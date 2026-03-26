# Funktionen und Workflows

Diese Seite beschreibt, was die App aktuell fachlich abdeckt und wo noch bewusste Grenzen liegen.

## Kurz gesagt

ChurchINV kann aktuell:

- Geraete verwalten
- Stammdaten pflegen
- Fotos und Dokumente je Geraet ablegen
- per QR zur Detailansicht springen
- Aenderungen pro Geraet im Verlauf anzeigen

## Geraeteverwaltung

- Geraete anlegen
- Geraete bearbeiten
- Geraete loeschen
- Pflichtfelder und Stammdaten beim Speichern pruefen

## Stammdaten

Im aktuellen Stand werden diese Stammdaten genutzt:

- Hersteller
- Objekttyp
- Modell
- Bereich
- Standort
- Kategorie
- Person
- Status

Ein Teil der Pflege ist direkt ueber das Admin-Panel erreichbar.

## Medien

- ein Geraetefoto pro Geraet
- mehrere Dokumente pro Geraet

## Zusatzdaten

- Seriennummer
- Kaufdatum
- Einkaufspreis
- Zustandshinweis

## Suche und Tabellenansicht

- Textsuche
- Filter
- Sortierung
- sichtbare Spalten waehlbar

## QR-Flow

- QR-Scan oeffnet das passende Geraet
- Grundlage ist die Inventarnummer
- kein separates QR-Feld in der Datenbank noetig

## Verlauf

Pro Geraet gibt es einen Verlauf fuer:

- Anlage
- Aenderungen wichtiger Felder

Mehrere Aenderungen eines Speichervorgangs werden in der Oberflaeche als gemeinsamer Block gruppiert.

## Admin-Funktionen

- Admin-Login per Passwort
- Session-Speicherung im Browser-Tab
- Admin-Panel fuer erste Stammdatenpflege

## Dark Mode

- optional ueber die Topbar umschaltbar
- Hauptansicht, Detailseite, Add/Edit und grosse Teile des Admin-Bereichs sind bereits angepasst
- sollte im Alltag weiter auf kleineren Screens mitgeprueft werden

## Patch Notes

- strukturierte Datenbasis in `docs/patch-notes/patch-notes.json`
- Markdown-Uebersicht in [changelog.md](/c:/Users/cedri/vsProjects/ChurhINV_REPO/Church_INV/docs/changelog.md)
- read-only Anzeige direkt in der App ueber die Topbar

## Bekannte fachliche Grenzen

- Authentifizierung ist noch kein echtes Benutzer- und Rollenmodell
- der Admin-Bereich ist bewusst noch eine erste Version
- einige UI-Feinkanten sollten nach echtem Nutzerfeedback weiter geschliffen werden
