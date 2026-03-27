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

## Starten

Im Repo auf dem Server:

```bash
docker compose build
docker compose up -d
```

Danach:

- Client: `http://SERVER:8080`
- API: `http://SERVER:3000`
- Swagger: `http://SERVER:3000/api/docs`

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
