# Setup und Betrieb

## Voraussetzungen

- Node.js
- npm
- MySQL
- Expo CLI bzw. `npx expo`

## Verzeichnisstruktur

- `apps/client`: Expo-Client
- `apps/api`: API und Swagger
- `docs`: Projektdokumentation

## Umgebungsvariablen

### API

Datei: `apps/api/.env`

```env
PORT=3000
ADMIN_PASSWORD=admin
```

### Client

Datei: `apps/client/.env`

```env
EXPO_PUBLIC_API_BASE_URL=http://localhost:3000
EXPO_PUBLIC_ADMIN_PASSWORD=admin
```

## Lokaler Start

### API starten

```bash
npx tsx apps/api/src/server.ts
```

### Client starten

```bash
cd apps/client
npx expo start
```

## Testen im lokalen Netzwerk

Für Handy-Browser oder Geräte im gleichen WLAN muss im Client statt `localhost` die IP des PCs verwendet werden:

```env
EXPO_PUBLIC_API_BASE_URL=http://192.168.x.x:3000
```

## Swagger

Nach Start der API erreichbar unter:

- `http://localhost:3000/api/docs`

## Admin-Modus

Aktuell läuft der Admin-Modus noch über ein Passwort. Das ist ein Übergangsmodell und soll später durch echte Authentifizierung ersetzt werden.

Admin-relevante Aktionen:

- Gerät anlegen
- Gerät bearbeiten
- Gerät löschen
- Dokumente hochladen/löschen
- Stammdaten pflegen

## Scanner-Hinweis

Der QR-Scanner funktioniert im nativen Expo-/App-Kontext zuverlässiger als im unsicheren mobilen Browser-Kontext. Für Web auf dem Handy ist später in der Regel `https` nötig.
