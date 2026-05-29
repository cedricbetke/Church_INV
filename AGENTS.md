# AGENTS.md

## Projekt

ChurchINV ist eine Inventar- und Buchungs-App.

- `apps/client`: Expo/React Native Web Client
- `apps/api`: Node/Express API
- `docs`: Projekt-, Setup-, Deployment- und Feature-Dokumentation
- `scripts`: Import-, Sync- und Wartungsskripte

## Lokale Entwicklung

Aus dem Repo-Root:

```bash
npm run dev
```

Das startet API und Expo-Client gemeinsam.

Weitere Befehle:

```bash
npm run dev:api
npm run dev:client
npm run dev:web
```

Der Client braucht lokal `apps/client/.env`, z. B.:

```env
EXPO_PUBLIC_API_BASE_URL=http://localhost:3000
EXPO_PUBLIC_ADMIN_PASSWORD=admin
EXPO_PUBLIC_ENABLE_PCO=false
```

Fuer Handy-Tests im gleichen Netzwerk muss `EXPO_PUBLIC_API_BASE_URL` auf die LAN-IP des Entwicklungsrechners zeigen.

## Server-Env und Deployment

Auf dem Server ist `apps/api/.env` die zentrale Env-Datei fuer API, Datenbank und Docker Compose.

Wichtige Werte:

```env
ADMIN_PASSWORD=...
DB_HOST=db
DB_PORT=3306
DB_USER=...
DB_PASSWORD=...
DB_NAME=church_Inv_Sql
MYSQL_ROOT_PASSWORD=...
```

Im Docker-Deploy braucht der Server keine `apps/client/.env`.
Der Client wird mit Build-Args aus `docker-compose.yml` gebaut:

- `EXPO_PUBLIC_API_BASE_URL=/`
- `EXPO_PUBLIC_ADMIN_PASSWORD=${ADMIN_PASSWORD}`
- `EXPO_PUBLIC_ENABLE_PCO=${EXPO_PUBLIC_ENABLE_PCO:-false}`

Damit gibt es fuer das Admin-Passwort auf dem Server nur eine Quelle: `apps/api/.env`.

## GitHub Actions

- `deploy-test-server.yml` deployed Branch `testserver` per SSH/rsync auf den Testserver.
- `deploy-production.yml` deployed Branch `master` auf dem self-hosted Runner.
- Push auf `master` startet Production-Deploy.
- Push auf `testserver` startet Testserver-Deploy.

Vor Production-Merge sollte der Stand auf `testserver` erfolgreich getestet sein.

## Buchungen

Aktuelle Buchungslogik:

- Admins koennen direkt Buchungen anlegen.
- Nicht-Admins koennen Buchungsanfragen stellen.
- Buchungsanfragen haben Status `angefragt`.
- Admins koennen Anfragen annehmen oder ablehnen.
- Angenommene Anfragen werden zu `reserviert`.
- Abgelehnte Anfragen werden `abgelehnt`.
- Blockierend fuer Konflikte sind aktuell `reserviert` und `ausgegeben`.
- Offene Anfragen blockieren nicht, werden aber im Kalender und Formular als Hinweis angezeigt.

## Wichtige Hinweise fuer Agenten

- Bestehende `.env`-Dateien enthalten lokale oder serverseitige Secrets und sollen nicht committed werden.
- `apps/client/.env` ist lokale Entwickler-Konfiguration.
- `apps/api/.env` ist server-/lokale API-Konfiguration.
- Keine unaufgeforderten destruktiven Git-Befehle verwenden.
- Bei UI-Aenderungen den Web-Export pruefen:

```bash
npx expo export --platform web --clear
```

- Das Repo hat bekannte TypeScript-Fehler in aelteren Inventory-/Masterdata-Dateien. `tsc --noEmit` kann deshalb unabhaengig von aktuellen Aenderungen fehlschlagen.
