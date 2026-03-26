# ChurchINV Dokumentation

Diese Dokumentation ist der Einstieg ins Projekt. Sie soll zwei Dinge leisten:

- neue Personen schnell orientieren
- spaetere Detailfragen gezielt beantworten

## Start Here

Wenn du neu im Projekt bist, lies in dieser Reihenfolge:

1. [Setup und Betrieb](/c:/Users/cedri/vsProjects/ChurhINV_REPO/Church_INV/docs/setup.md)
2. [Funktionen und Workflows](/c:/Users/cedri/vsProjects/ChurhINV_REPO/Church_INV/docs/features.md)
3. [Architektur](/c:/Users/cedri/vsProjects/ChurhINV_REPO/Church_INV/docs/architecture.md)

Wenn du mit echten Bestandsdaten arbeitest:

1. [Import und Migration](/c:/Users/cedri/vsProjects/ChurhINV_REPO/Church_INV/docs/import.md)
2. [Buchung](/c:/Users/cedri/vsProjects/ChurhINV_REPO/Church_INV/docs/booking.md)
3. [Planning Center](/c:/Users/cedri/vsProjects/ChurhINV_REPO/Church_INV/docs/pco.md)
4. [Patch Notes](/c:/Users/cedri/vsProjects/ChurhINV_REPO/Church_INV/docs/changelog.md)

## Was Die App Abdeckt

ChurchINV verwaltet:

- Inventarnummern und Geraetestammdaten
- Bereich, Standort, Kategorie und verantwortliche Person
- Zustandshinweise
- Geraetefotos und Dokumente
- Verlauf pro Geraet
- QR-Scan auf die Detailansicht
- Mehrgeraete-Buchungen mit Zeitraum

## Welche Seite Fuer Was

- [Setup und Betrieb](/c:/Users/cedri/vsProjects/ChurhINV_REPO/Church_INV/docs/setup.md)
  Hier steht, wie du Client, API, lokale Umgebung und Netzwerkzugriff startest.

- [Funktionen und Workflows](/c:/Users/cedri/vsProjects/ChurhINV_REPO/Church_INV/docs/features.md)
  Diese Seite beschreibt, was die App fachlich kann und wo aktuelle Grenzen liegen.

- [Architektur](/c:/Users/cedri/vsProjects/ChurhINV_REPO/Church_INV/docs/architecture.md)
  Diese Seite ist fuer technische Orientierung im Code und fuer spaetere Erweiterungen gedacht.

- [Import und Migration](/c:/Users/cedri/vsProjects/ChurhINV_REPO/Church_INV/docs/import.md)
  Hier steht der gesamte Pfad fuer CSV-, Dokument- und Foto-Import aus Teams/SharePoint.

- [Buchung](/c:/Users/cedri/vsProjects/ChurhINV_REPO/Church_INV/docs/booking.md)
  Diese Seite beschreibt die Datenbanktabellen und den ersten Buchungs-Workflow fuer mehrere Geraete.

- [Planning Center](/c:/Users/cedri/vsProjects/ChurhINV_REPO/Church_INV/docs/pco.md)
  Diese Seite beschreibt den aktuellen PCO-Mapping-Schritt zwischen Service Types und Standard-Geraeten.

- [Patch Notes](/c:/Users/cedri/vsProjects/ChurhINV_REPO/Church_INV/docs/changelog.md)
  Menschenlesbare Aenderungshistorie.

## Technischer Kurzueberblick

- Client: Expo / React Native / React Native Paper
- API: Node.js / Express
- Datenbank: MySQL
- API-Doku: Swagger / OpenAPI

## Patch Notes In Der App

Zusatzlich zur Markdown-Doku gibt es strukturierte Patch Notes als JSON:

- [patch-notes.json](/c:/Users/cedri/vsProjects/ChurhINV_REPO/Church_INV/docs/patch-notes/patch-notes.json)

Darauf basiert auch die read-only Anzeige direkt in der App.
