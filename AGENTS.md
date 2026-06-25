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

## Arbeitsweise fuer Bugfixes und Features

- Fuer jeden Bugfix und jedes neue Feature wird zuerst eine eigene Branch erstellt.
- Die Branch wird anhand des Tickets benannt, z. B. nach Ticketnummer und kurzer Beschreibung:
  - `fix/123-masterdata-delete-error`
  - `feature/124-location-merge`
  - `chore/125-cleanup-import-script`
- Wenn keine Ticketnummer vorhanden ist, wird ein kurzer beschreibender Branchname verwendet.
- Vor dem Erstellen einer Branch wird der aktuelle Git-Status geprueft.
- Lokale Aenderungen, die nicht zur aktuellen Aufgabe gehoeren, duerfen nicht ueberschrieben oder zurueckgesetzt werden.
- Ob ein Stand zuerst auf `testserver` getestet werden soll, entscheidet der Nutzer individuell.

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

## Kontext- und Token-Hygiene fuer Codex

- Pro Ticket, Bugfix oder Feature soll eine neue Codex-Session verwendet werden.
- Alte Codex-Sessions sollen nicht fuer neue Tickets weitergefuehrt werden.
- Codex darf lange Test-, Build- und Log-Ausgaben nicht ungefiltert in den Kontext uebernehmen.
- Fuer potenziell lange Commands wie `npm test`, `npm run build`, `npx expo export --platform web --clear`, `docker logs` und CI-Logs soll Codex standardmaessig `scripts/codex-log-summary.ps1` verwenden.
- Codex soll diese Commands nicht direkt mit ungefilterter Ausgabe ausfuehren, wenn die Ausgabe lang werden kann.
- Dafuer sollen Commands in PowerShell z. B. so ausgefuehrt werden:
  `npm test 2>&1 | powershell -ExecutionPolicy Bypass -File scripts/codex-log-summary.ps1`
- Bei UI-Aenderungen soll der Web-Export standardmaessig so geprueft werden:
  `npx expo export --platform web --clear 2>&1 | powershell -ExecutionPolicy Bypass -File scripts/codex-log-summary.ps1 -Prompt "Check if export succeeded. If failed, return only the real error, relevant file and shortest useful stacktrace."`
- Codex soll nach der Zusammenfassung nur gezielt relevante Originalstellen nachpruefen.
- Bei grossen Diffs zuerst `git diff --stat` oder `git diff --name-only` verwenden und danach gezielt einzelne Dateien pruefen.

## Session-Hygiene fuer Codex

- Codex soll den Nutzer aktiv darauf hinweisen, eine neue Session zu starten, wenn ein neues Ticket, ein neuer Bugfix oder ein neues Feature begonnen wird.
- Codex soll den Nutzer ebenfalls auf eine neue Session hinweisen, wenn die aktuelle Aufgabe abgeschlossen ist und danach ein anderes Thema beginnt.
- Nach sehr langen Debug-Sessions, grossen Tool-Ausgaben, vielen Dateiänderungen oder Context-Compaction soll Codex empfehlen, fuer die naechste Aufgabe eine neue Session zu starten.
- Wenn Codex empfiehlt, eine neue Session zu starten, soll es einen kurzen Copy-Paste-Startprompt fuer die neue Session liefern.

```bash
npx expo export --platform web --clear
```

- Das Repo hat bekannte TypeScript-Fehler in aelteren Inventory-/Masterdata-Dateien. `tsc --noEmit` kann deshalb unabhaengig von aktuellen Aenderungen fehlschlagen.
