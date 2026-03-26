# Setup und Betrieb

Diese Seite ist fuer den technischen Einstieg gedacht: lokale Entwicklung, Start der App und typische Betriebsfragen.

## Kurz gesagt

- API und Client werden getrennt gestartet
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
```

### Client

Datei: `apps/client/.env`

```env
EXPO_PUBLIC_API_BASE_URL=http://localhost:3000
EXPO_PUBLIC_ADMIN_PASSWORD=admin
```

## Lokal starten

### API

```bash
npx tsx apps/api/src/server.ts
```

### Client

```bash
cd apps/client
npx expo start
```

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
