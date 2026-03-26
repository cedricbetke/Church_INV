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
