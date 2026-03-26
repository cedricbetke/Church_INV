# ChurchINV

ChurchINV ist eine Inventar-App für Geräteverwaltung mit Expo/React Native im Client und einer Node/Express-API mit MySQL im Backend.

## Schnellstart

1. Abhängigkeiten installieren

```bash
npm install
```

2. API konfigurieren

`apps/api/.env`

```env
PORT=3000
ADMIN_PASSWORD=admin
```

3. Client konfigurieren

`apps/client/.env`

```env
EXPO_PUBLIC_API_BASE_URL=http://localhost:3000
EXPO_PUBLIC_ADMIN_PASSWORD=admin
```

4. API starten

```bash
npx tsx apps/api/src/server.ts
```

5. Client starten

```bash
cd apps/client
npx expo start
```

## Doku

- Projektdoku: [docs/README.md](/c:/Users/cedri/vsProjects/ChurhINV_REPO/Church_INV/docs/README.md)
- Setup und Betrieb: [docs/setup.md](/c:/Users/cedri/vsProjects/ChurhINV_REPO/Church_INV/docs/setup.md)
- Funktionen und Workflows: [docs/features.md](/c:/Users/cedri/vsProjects/ChurhINV_REPO/Church_INV/docs/features.md)
- Architekturüberblick: [docs/architecture.md](/c:/Users/cedri/vsProjects/ChurhINV_REPO/Church_INV/docs/architecture.md)
- Patch Notes: [docs/changelog.md](/c:/Users/cedri/vsProjects/ChurhINV_REPO/Church_INV/docs/changelog.md)
- Strukturierte Patch Notes: [patch-notes.json](/c:/Users/cedri/vsProjects/ChurhINV_REPO/Church_INV/docs/patch-notes/patch-notes.json)

## API-Doku

Nach dem Start der API:

- Swagger UI: `http://localhost:3000/api/docs`

## Hinweise

- Admin-Aktionen laufen aktuell über ein einfaches Passwortmodell.
- Für produktive Nutzung sollte das später durch echte Authentifizierung, z. B. OAuth, ersetzt werden.
- Der QR-Flow nutzt aktuell die Inventarnummer als Scan-Inhalt.
- Patch Notes sind sowohl als Markdown als auch bereits read-only in der App verfügbar.
