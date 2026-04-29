#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ENV_FILE="${ENV_FILE:-$ROOT_DIR/apps/api/.env}"
BACKUP_CONFIG_FILE="${BACKUP_CONFIG_FILE:-/home/inventory/backup.env}"

if [ -f "$BACKUP_CONFIG_FILE" ]; then
  set -a
  # shellcheck disable=SC1090
  . "$BACKUP_CONFIG_FILE"
  set +a
fi

BACKUP_ROOT="${BACKUP_ROOT:-/home/inventory/backups}"
UPLOADS_DIR="${UPLOADS_DIR:-/home/inventory/data/uploads}"
RETENTION_DAYS="${RETENTION_DAYS:-14}"

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

TIMESTAMP="$(date +%Y%m%d-%H%M%S)"
TARGET_DIR="$BACKUP_ROOT/$TIMESTAMP"
mkdir -p "$TARGET_DIR"

echo "Creating MySQL backup..."
docker exec churchinv-db mysqldump \
  -u root \
  -p"$MYSQL_ROOT_PASSWORD" \
  --single-transaction \
  --routines \
  --triggers \
  "$DB_NAME" > "$TARGET_DIR/${DB_NAME}.sql"

echo "Creating uploads backup..."
if [ -d "$UPLOADS_DIR" ]; then
  tar -czf "$TARGET_DIR/uploads.tar.gz" -C "$UPLOADS_DIR" .
else
  echo "Uploads directory does not exist: $UPLOADS_DIR" >&2
  tar -czf "$TARGET_DIR/uploads.tar.gz" --files-from /dev/null
fi

cat > "$TARGET_DIR/manifest.txt" <<EOF
created_at=$TIMESTAMP
db_name=$DB_NAME
uploads_dir=$UPLOADS_DIR
EOF

echo "Removing backups older than $RETENTION_DAYS days..."
find "$BACKUP_ROOT" -mindepth 1 -maxdepth 1 -type d -mtime +"$RETENTION_DAYS" -exec rm -rf {} +

echo "Backup written to $TARGET_DIR"
