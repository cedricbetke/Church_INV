#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ENV_FILE="${ENV_FILE:-$ROOT_DIR/apps/api/.env}"
PATCH_DIR="${PATCH_DIR:-$ROOT_DIR/schemas/patches}"
BACKUP_SCRIPT="${BACKUP_SCRIPT:-$ROOT_DIR/scripts/backup-production.sh}"

if [ ! -f "$ENV_FILE" ]; then
  echo "Missing env file: $ENV_FILE" >&2
  exit 1
fi

set -a
# shellcheck disable=SC1090
. "$ENV_FILE"
set +a

if [ -z "${DB_NAME:-}" ] || [ -z "${MYSQL_ROOT_PASSWORD:-}" ]; then
  echo "DB_NAME and MYSQL_ROOT_PASSWORD must be set in $ENV_FILE" >&2
  exit 1
fi

if [ ! -d "$PATCH_DIR" ]; then
  echo "No DB patch directory found: $PATCH_DIR"
  exit 0
fi

echo "Waiting for MySQL container..."
for _ in $(seq 1 30); do
  if docker exec churchinv-db mysqladmin ping -u root -p"$MYSQL_ROOT_PASSWORD" --silent >/dev/null 2>&1; then
    break
  fi

  sleep 2
done

docker exec churchinv-db mysqladmin ping -u root -p"$MYSQL_ROOT_PASSWORD" --silent >/dev/null

shopt -s nullglob
patches=("$PATCH_DIR"/*.sql)

if [ "${#patches[@]}" -eq 0 ]; then
  echo "No DB patches to apply."
  exit 0
fi

table_exists="$(
  docker exec churchinv-db mysql -u root -p"$MYSQL_ROOT_PASSWORD" "$DB_NAME" -N -B -e \
    "SELECT COUNT(*) FROM information_schema.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'schema_migrations';"
)"

pending_patches=()
for patch in "${patches[@]}"; do
  patch_name="$(basename "$patch")"

  if [ "$table_exists" = "0" ]; then
    pending_patches+=("$patch")
    continue
  fi

  already_applied="$(
    docker exec churchinv-db mysql -u root -p"$MYSQL_ROOT_PASSWORD" "$DB_NAME" -N -B -e \
      "SELECT COUNT(*) FROM schema_migrations WHERE filename = '$patch_name';"
  )"

  if [ "$already_applied" = "0" ]; then
    pending_patches+=("$patch")
  fi
done

if [ "${#pending_patches[@]}" -eq 0 ]; then
  echo "No pending DB patches."
  exit 0
fi

echo "Pending DB patches: ${#pending_patches[@]}"
echo "Creating backup before DB patches..."
bash "$BACKUP_SCRIPT"

docker exec churchinv-db mysql -u root -p"$MYSQL_ROOT_PASSWORD" "$DB_NAME" -e \
  "CREATE TABLE IF NOT EXISTS schema_migrations (
    filename VARCHAR(255) NOT NULL PRIMARY KEY,
    applied_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
  );"

for patch in "${pending_patches[@]}"; do
  patch_name="$(basename "$patch")"
  echo "Applying DB patch: $(basename "$patch")"
  docker exec -i churchinv-db mysql -u root -p"$MYSQL_ROOT_PASSWORD" "$DB_NAME" < "$patch"
  docker exec churchinv-db mysql -u root -p"$MYSQL_ROOT_PASSWORD" "$DB_NAME" -e \
    "INSERT INTO schema_migrations (filename) VALUES ('$patch_name');"
done

echo "DB patches applied."
