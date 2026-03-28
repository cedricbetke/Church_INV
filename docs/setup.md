# Setup und Betrieb

Diese Seite ist fuer den technischen Einstieg gedacht: lokale Entwicklung, Start der App und typische Betriebsfragen.

## Kurz gesagt

- API und Client koennen getrennt oder gemeinsam aus dem Root gestartet werden
- fuer Handy-Tests im gleichen WLAN darf im Client nicht `localhost` stehen
- Swagger ist ueber die API erreichbar
- der aktuelle Admin-Modus arbeitet noch uebergangsweise mit einem Passwort

## Voraussetzungen

- Node.js
- npm
- MySQL
- Expo CLI bzw. `npx expo`

## Projektstruktur

- `apps/client`: Expo-Client
- `apps/api`: API und Swagger
- `docs`: Projektdokumentation
- `import`: Importdateien, Reports und operative Import-Hinweise

## Umgebungsvariablen

### API

Datei: `apps/api/.env`

```env
PORT=3000
ADMIN_PASSWORD=admin
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=churchinv
DB_PASSWORD=secret
DB_NAME=church_Inv_Sql
```

### Client

Datei: `apps/client/.env`

```env
EXPO_PUBLIC_API_BASE_URL=http://localhost:3000
EXPO_PUBLIC_ADMIN_PASSWORD=admin
```

## Lokal starten

### Gemeinsamer Start aus dem Root

```bash
npm run dev
```

Das startet:

- API
- normalen Expo-Client

Fuer Browserbetrieb:

```bash
npm run dev:web
```

### Einzelstart

API:

```bash
npm run dev:api
```

Client:

```bash
npm run dev:client
```

Client direkt im Browser:

```bash
npm run dev:client:web
```

## Scripts

Die projektspezifischen Scripts sind in `package.json` definiert und werden aus dem Projekt-Root gestartet.
Argumente werden mit `--` durchgereicht.

```bash
npm run import:teams -- --dry-run
```

Import- und Cleanup-Scripts (Details in `docs/import.md`):

- `import:teams`
- `import:teams-documents`
- `import:teams-photos`
- `backfill:photo-thumbs`
- `optimize:stored-photos`
- `cleanup:photo-documents`

Patch-Notes-Sync:

- `sync:patch-notes` (erstellt `docs/changelog.md` und `apps/client/src/features/patch-notes/data/patchNotes.ts`
  aus `docs/patch-notes/patch-notes.json`)

## VS Code

Fuer VS Code sind jetzt Start-Configs im Repo vorhanden:

- `.vscode/tasks.json`
- `.vscode/launch.json`

Damit gibt es direkte Startoptionen fuer:

- `ChurchINV Dev`
- `ChurchINV Dev Web`
- `ChurchINV API`
- `ChurchINV Client`
- `ChurchINV Client Web`

Das ist der naechste Ersatz fuer den klassischen Startbutton aus IntelliJ.

## Testen im lokalen Netzwerk

Wenn die App auf einem Handy oder einem anderen Geraet im gleichen WLAN laufen soll, muss der Client auf die IP des Entwicklungsrechners zeigen.

Also nicht:

```env
EXPO_PUBLIC_API_BASE_URL=http://localhost:3000
```

sondern zum Beispiel:

```env
EXPO_PUBLIC_API_BASE_URL=http://192.168.x.x:3000
```

## Swagger

Nach dem Start der API ist die Dokumentation hier erreichbar:

- `http://localhost:3000/api/docs`

## Admin-Modus

Der aktuelle Admin-Modus ist bewusst einfach gehalten und nutzt noch ein Passwort statt echter Benutzer-Authentifizierung.

Admin-relevante Aktionen sind derzeit:

- Geraet anlegen
- Geraet bearbeiten
- Geraet loeschen
- Dokumente hochladen oder loeschen
- Stammdaten pflegen

## Scanner-Hinweis

Der QR-Scanner funktioniert im nativen App-/Expo-Kontext zuverlaessiger als im unsicheren mobilen Browser-Kontext.

Fuer mobiles Web ist spaeter in der Regel `https` noetig, besonders wenn Kamera-Zugriff sauber funktionieren soll.
