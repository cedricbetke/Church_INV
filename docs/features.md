# Funktionen und Workflows

Diese Seite beschreibt, was die App aktuell fachlich abdeckt und wo noch bewusste Grenzen liegen.

## Kurz gesagt

ChurchINV kann aktuell:

- Geraete verwalten
- Stammdaten pflegen
- Fotos und Dokumente je Geraet ablegen
- per QR zur Detailansicht springen
- Aenderungen pro Geraet im Verlauf anzeigen
- mehrere Geraete in einer Buchung reservieren

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

Beim Anlegen eines Geraets gilt aktuell:

- Hersteller, Objekttyp und Modell koennen direkt aus dem Auswahldialog neu angelegt werden
- Status, Standort, Bereich, Kategorie und Person sind dort reine Auswahlfelder und suggerieren keine direkte Neuanlage
- Modell wird erst verfuegbar, wenn Hersteller und Objekttyp gesetzt sind
- Kategorie wird erst verfuegbar, wenn ein Bereich gesetzt ist

## Medien

- ein Geraetefoto pro Geraet
- mehrere Dokumente pro Geraet
- neue Geraetefotos werden erst beim echten Speichern hochgeladen
- neue Geraetefotos werden direkt als optimiertes JPG gespeichert
- Tabellenansicht und Detailansicht nutzen bevorzugt Thumbnail-Dateien fuer schnellere Anzeige

## Zusatzdaten

- Seriennummer
- Kaufdatum
- Einkaufspreis
- Zustandshinweis

## Suche und Tabellenansicht

- Textsuche ueber Inventarnummer, Hersteller, Modell, Objekttyp, Standort, Bereich, Kategorie, verantwortliche Person, Seriennummer, Kaufdatum und Dokumentnamen
- Freitextsuche ist toleranter bei Schreibweisen und kombiniert mehrere Suchwoerter robuster
- Filter als separates Overlay statt inline ueber der Tabelle
- Filterwerte fuer Status, Hersteller, Modell, Bereich und Standort kommen alphabetisch sortiert aus der API
- Sortierung
- sichtbare Spalten waehlbar

## QR-Flow

- QR-Scan oeffnet das passende Geraet
- Grundlage ist die Inventarnummer
- kein separates QR-Feld in der Datenbank noetig
- auf der Buchungsseite kann ein QR-Code direkt ein einzelnes Geraet in die aktuelle Auswahl uebernehmen

## Buchungen

- eine Buchung kann mehrere Geraete enthalten
- Buchungen haben Titel, Bucher, optionalen Zweck und einen Zeitraum
- beim Anlegen wird auf einfache Zeitueberschneidungen geprueft
- bestehende Buchungen koennen angezeigt und geloescht werden
- die Geraeteauswahl kennt sowohl Einzelgeraete als auch Auswahl nach Modellmenge
- die Geraeteauswahl kann separat geleert werden, ohne Titel, Zeitraum und Zweck zurueckzusetzen
- bestehende Buchungen haben eine umschaltbare Listen- und Kalenderansicht
- die Kalenderansicht startet standardmaessig und zeigt Monatsuebersicht plus Tagesagenda
- mehrtaegige Buchungen werden im Kalender derzeit bewusst eher textuell ueber Tagesstatus wie "laufend" statt ueber starke Blockgrafiken markiert
- auf mobilen Breiten wird aktuell nur die stabilere Listenansicht gezeigt
- beim Aendern des Startdatums wird das Enddatum in typischen Standardfaellen direkt mit angepasst
- leere Datumsfelder im nativen Picker starten fuer Buchungsbeginn bei 00:00 und fuer das Ende bei 23:59

## Import und Medienmigration

- CSV-Import fuer Inventar aus Teams/Microsoft Lists
- Dokument-Import aus SharePoint-Attachments
- Foto-Import aus SharePoint-Bildfeldern und reservierten Bild-Anhaengen
- vorhandene Team-Fotos koennen als Thumbnails nacherzeugt werden
- bestehende gespeicherte Geraetefotos koennen nachtraeglich auf den optimierten JPG-Pfad umgestellt werden

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

## Mobile und Responsive Verhalten

- die Hauptseite nutzt auf schmalen Screens eine kompakte Kartenansicht statt der Desktop-Tabelle
- Detailansicht und Buchungsseite sind fuer kleinere Browser- und App-Screens nachgeschaerft
- einige Topbar-Aktionen sind auf mobilen Breiten bewusst kompakter angeordnet

## Patch Notes

- strukturierte Datenbasis in `docs/patch-notes/patch-notes.json`
- Markdown-Uebersicht in [changelog.md](/c:/Users/cedri/vsProjects/ChurhINV_REPO/Church_INV/docs/changelog.md)
- read-only Anzeige direkt in der App ueber die Topbar
- Patch-Notes-Eintraege koennen optional direkt auf zugehoerige GitHub-Issues verlinken

## Topbar

- die Topbar kennzeichnet den aktuellen Stand sichtbar als Beta
- auf breiten Ansichten wird die aktuelle Versionsnummer direkt neben dem Titel angezeigt

## Bekannte fachliche Grenzen

- Authentifizierung ist noch kein echtes Benutzer- und Rollenmodell
- der Admin-Bereich ist bewusst noch eine erste Version
- einige UI-Feinkanten sollten nach echtem Nutzerfeedback weiter geschliffen werden
