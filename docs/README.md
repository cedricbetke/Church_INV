# ChurchINV Dokumentation

Diese Dokumentation ist der Einstieg für das Projekt. Sie ist so aufgebaut, dass sie sowohl für Entwickler als auch für spätere interne Nutzer verständlich bleibt.

## Inhalte

- [Setup und Betrieb](/c:/Users/cedri/vsProjects/ChurhINV_REPO/Church_INV/docs/setup.md)
- [Funktionen und Workflows](/c:/Users/cedri/vsProjects/ChurhINV_REPO/Church_INV/docs/features.md)
- [Architektur](/c:/Users/cedri/vsProjects/ChurhINV_REPO/Church_INV/docs/architecture.md)
- [Import und Migration](/c:/Users/cedri/vsProjects/ChurhINV_REPO/Church_INV/docs/import.md)
- [Patch Notes](/c:/Users/cedri/vsProjects/ChurhINV_REPO/Church_INV/docs/changelog.md)

## Ziel des Projekts

ChurchINV verwaltet Geräte und zugehörige Informationen wie:

- Inventarnummer
- Hersteller, Objekttyp und Modell
- Bereich, Standort, Kategorie und verantwortliche Person
- Zustandshinweis pro Gerät
- Fotos und Dokumente
- Bearbeitungsverlauf

## Technischer Überblick

- Client: Expo / React Native / React Native Paper
- API: Node.js / Express
- Datenbank: MySQL
- API-Doku: Swagger / OpenAPI

## Patch Notes in der App

Zusätzlich zur normalen Markdown-Doku gibt es strukturierte Patch Notes als JSON:

- [patch-notes.json](/c:/Users/cedri/vsProjects/ChurhINV_REPO/Church_INV/docs/patch-notes/patch-notes.json)

Darauf basiert inzwischen auch die read-only Anzeige direkt in der App. Damit gibt es eine gemeinsame Datenbasis für Projektdoku, Vorstellung und spätere Release-Notes.
