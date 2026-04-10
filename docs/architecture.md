# Architektur

## Überblick

ChurchINV besteht aus zwei Hauptteilen:

1. Client
2. API

## Client

Pfad:

- `apps/client`

Technik:

- Expo
- React Native
- Expo Router
- React Native Paper

Wichtige Bereiche:

- Inventarliste
- Detailansicht
- Add/Edit-Form
- QR-Scanner
- Admin-Panel
- Theme / Dark Mode
- Patch-Notes-Modal

Client-seitige Lastverteilung:

- stark genutzte Hauptansichten bleiben direkt verfuegbar
- selten genutzte Modals und Detailflows werden schrittweise lazy geladen
- aktuell betrifft das unter anderem Patch Notes, Stammdaten-Admin sowie Detail- und Add/Edit-Flow der Inventarliste

Client-seitige Persistenz im Browser:

- Theme-Modus wird im Web-Client in `localStorage` gespeichert
- gesehene Update-Hinweise werden versionsbezogen in `localStorage` gespeichert
- die zuletzt gewaehlte Seitengroesse der Inventarliste wird im Web-Client in `localStorage` gespeichert

## API

Pfad:

- `apps/api`

Technik:

- Express
- MySQL
- Swagger / OpenAPI

Wichtige Aufgaben:

- CRUD für Geräte
- CRUD für Stammdaten
- Upload von Fotos und Dokumenten
- Geräteverlauf
- Admin-Prüfung für geschützte Endpunkte

## Datenbank

Wichtige Tabellen:

- `geraet`
- `geraet_verlauf`
- `dokumente`
- `hersteller`
- `objekttyp`
- `modell`
- `bereich`
- `standort`
- `kategorie`
- `person`
- `status`

Wichtige Gerätefelder zusätzlich zu den Relationen:

- `serien_nr`
- `kaufdatum`
- `einkaufspreis`
- `zustandshinweis`

## Medien

Uploads liegen im API-Projekt unter:

- `apps/api/uploads/geraete`
- `apps/api/uploads/dokumente`

## Delete-Verhalten

- Relationale Abhängigkeiten werden über Foreign Keys und Cascade Delete abgesichert
- Dateien im Dateisystem werden zusätzlich im Backend gelöscht

## Dokumentationsstrategie

Es gibt zwei Ebenen:

1. Markdown-Doku für Entwickler und Projektvorstellung
2. strukturierte Patch Notes als JSON für die In-App-Anzeige
