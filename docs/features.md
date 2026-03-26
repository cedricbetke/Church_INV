# Funktionen und Workflows

## Geräteverwaltung

- Geräte anlegen
- Geräte bearbeiten
- Geräte löschen
- Pflichtfelder und Stammdaten prüfen

## Stammdaten

Im aktuellen Stand werden gepflegt:

- Hersteller
- Objekttyp
- Modell
- Bereich
- Standort
- Kategorie
- Person
- Status

Ein Teil der Stammdatenpflege ist zusätzlich über ein Admin-Panel erreichbar.

## Medien

- Ein Gerätefoto pro Gerät
- Dokumente pro Gerät

## Zusatzdaten

- Seriennummer
- Kaufdatum
- Einkaufspreis
- Zustandshinweis

## Suche und Tabelle

- Textsuche
- Filter
- Sortierung
- auswählbare sichtbare Spalten

## QR-Flow

- QR-Scan öffnet das passende Gerät
- Grundlage ist aktuell die Inventarnummer
- kein separates QR-Feld in der Datenbank notwendig

## Verlauf

Pro Gerät gibt es einen Verlauf mit:

- Anlage
- Änderungen wichtiger Felder

Mehrere Änderungen eines Speichervorgangs werden in der Oberfläche gruppiert dargestellt.

## Admin-Funktionen

- Admin-Login per Passwort
- Session-Speicherung im Browser-Tab
- Admin-Panel für erste Stammdatenpflege

## Dark Mode

- optional umschaltbar in der Topbar
- Hauptansicht, Detailseite, Add/Edit und große Teile der Admin-Oberfläche sind bereits angepasst
- sollte weiter im Alltag geprüft werden, besonders auf kleineren Screens

## Patch Notes

- strukturierte Datenbasis in `docs/patch-notes/patch-notes.json`
- zusätzliche Markdown-Übersicht in [changelog.md](/c:/Users/cedri/vsProjects/ChurhINV_REPO/Church_INV/docs/changelog.md)
- read-only Anzeige direkt in der App über die Topbar

## Bekannte fachliche Grenzen

- Authentifizierung ist noch kein echtes Benutzer-/Rollenmodell
- der Admin-Bereich ist noch bewusst eine erste Version
- einige UI-Feinkanten sollten nach echtem Nutzerfeedback weiter geschliffen werden
