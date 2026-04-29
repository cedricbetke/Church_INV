# Deployment

Diese Seite beschreibt den einfachsten Docker-Deploy fuer einen Linux-Server.

## Zielbild

- `client` laeuft als statischer Web-Build in Nginx
- `api` laeuft als Node-Container
- Uploads liegen persistent auf dem Server und werden in den API-Container gemountet
- der Client spricht ueber dieselbe Domain mit `/api` und `/uploads`

## Voraussetzungen

- Docker und Docker Compose auf dem Server
- MySQL ist bereits erreichbar
- die API-Datenbanktabellen existieren bereits

## Wichtige Ordner

- Web-App: `apps/client`
- API: `apps/api`
- Uploads auf dem Server: `/srv/churchinv/uploads`

## API-Umgebung

Die API nutzt fuer Docker jetzt Umgebungsvariablen statt harter DB-Werte.

Beispiel fuer [apps/api/.env](/c:/Users/cedri/vsProjects/ChurhINV_REPO/Church_INV/apps/api/.env):

```env
PORT=3000
ADMIN_PASSWORD=dein-admin-passwort
DB_HOST=192.168.178.71
DB_PORT=3306
DB_USER=cedric
DB_PASSWORD=dein-db-passwort
DB_NAME=church_Inv_Sql
```

## Client-API-URL

Im Docker-Setup nutzt der Client intern `EXPO_PUBLIC_API_BASE_URL=/`.

Dadurch gilt:

- Web-App unter derselben Domain
- API unter `/api`
- Uploads unter `/uploads`

Du brauchst fuer den Docker-Web-Build also keine lokale LAN-IP mehr in `apps/client/.env`.

## Uploads Uebernehmen

Die bestehenden Uploads solltest du einmalig auf den Server kopieren:

```bash
rsync -av apps/api/uploads/ user@server:/srv/churchinv/uploads/
```

Danach bleiben neue Uploads persistent, weil der Host-Ordner in den API-Container gemountet wird.

## Portainer

Wenn du bereits Portainer nutzt, kannst du den Stack auch dort deployen. Der pragmatische Weg ist:

1. Repo auf dem Server aktualisieren
2. `apps/api/.env` auf dem Server anlegen
3. Upload-Ordner unter `/srv/churchinv/uploads` bereitstellen
4. Stack entweder ueber Portainer oder direkt per `docker compose` starten

Wichtig:

- `apps/api/.env` kommt bewusst nicht aus Git
- Uploads liegen ebenfalls ausserhalb des Images als Host-Ordner

## Starten

Im Repo auf dem Server:

```bash
docker compose build
docker compose up -d
```

Danach:

- Client: `http://SERVER:51821`
- API: `http://SERVER:3000`
- Swagger: `http://SERVER:3000/api/docs`

Wenn der API-Port extern bereits belegt ist, kann der Host-Port im Compose-Setup abweichend gemappt werden, zum Beispiel `3001:3000`.

## Volumes

Im Compose-Setup wird dieser Mount verwendet:

```yaml
volumes:
  - /srv/churchinv/uploads:/app/uploads
```

Das ist wichtig, weil die API Uploads lokal unter `/app/uploads` erwartet.

## Reverse Proxy Optional

Wenn du bereits einen vorgeschalteten Nginx- oder Traefik-Proxy hast, ist der saubere Zielzustand:

- externe Domain zeigt auf den `client`-Container
- der `client`-Container proxied `/api` und `/uploads` intern an `api:3000`

Dann brauchst du nach aussen nur noch einen Einstiegspunkt.

## GitHub Actions CI/CD

Es gibt aktuell zwei getrennte Deploy-Wege:

- Testserver: `.github/workflows/deploy-test-server.yml`
- Produktion: `.github/workflows/deploy-production.yml`

### Testserver

Der Testserver-Workflow ist fuer einen GitHub-hosted Runner mit SSH-/`rsync`-Deploy gedacht.

Der Workflow macht:

1. `docker compose build` auf GitHub Actions als Vorpruefung
2. Sync des Repos per SSH und `rsync` auf den Zielserver
3. `docker compose build --pull`
4. `docker compose up -d --remove-orphans`

Im aktuellen Testserver-Setup ist der Web-Client extern auf `http://SERVER:51821` ausgelegt. Ein passender Healthcheck sollte deshalb ebenfalls auf Port `51821` zeigen.

Standardmaessig laeuft der Testserver-Deploy:

- bei Push auf `testserver`
- manuell ueber `workflow_dispatch`

### Produktion

Der Produktions-Workflow ist fuer einen `self-hosted` GitHub Runner gedacht. Das ist sinnvoll, wenn der Produktivserver nicht direkt aus dem Internet per SSH erreichbar ist, aber selbst eine ausgehende Verbindung zu GitHub aufbauen kann.

Der Workflow macht:

1. `docker compose build` auf GitHub Actions als Vorpruefung
2. Checkout auf dem self-hosted Runner direkt auf dem Produktionsserver
3. lokale Pruefung, ob `apps/api/.env` auf dem Server vorhanden ist
4. `docker compose build --pull`
5. `docker compose up -d --remove-orphans`

Standardmaessig laeuft der Produktions-Deploy:

- bei Push auf `master`
- manuell ueber `workflow_dispatch`

## Testserver-Secrets

Diese Repository-Secrets werden fuer den Testserver-Workflow erwartet:

- `DEPLOY_HOST`
- `DEPLOY_USER`
- `DEPLOY_SSH_KEY_B64`
- `DEPLOY_PATH`
- optional `DEPLOY_PORT`
- optional `DEPLOY_HEALTHCHECK_URL`

Hinweise:

- `DEPLOY_SSH_KEY_B64` ist der private SSH-Key Base64-kodiert, damit mehrzeilige OpenSSH-Keys in GitHub Secrets stabil uebertragen werden
- der passende Public Key muss in `~/.ssh/authorized_keys` des Zielusers auf dem Testserver liegen
- `apps/api/.env` bleibt bewusst nur auf dem Testserver und wird vom Workflow nicht ueberschrieben
- `apps/client/.env` wird ebenfalls nicht auf den Server kopiert

## Self-Hosted Runner vorbereiten

Vor dem ersten Produktions-Deploy sollten auf dem Produktivserver vorhanden sein:

1. Docker und Docker Compose
2. Git
3. ein registrierter self-hosted GitHub Runner fuer dieses Repository
4. der ausgecheckte Repo-Ordner des Runners
5. `apps/api/.env` im ausgecheckten Repo
6. der Upload-Ordner `/srv/churchinv/uploads`

Der Workflow erstellt bei Bedarf:

- `/srv/churchinv/uploads`

Nicht automatisch erstellt wird:

- `apps/api/.env`

Diese Datei musst du einmalig direkt auf dem Produktivserver anlegen und dort auch pflegen.
