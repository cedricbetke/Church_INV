# Patch Notes

> Diese Datei wird aus `docs/patch-notes/patch-notes.json` erzeugt.
> Änderungen daher bitte in der JSON-Datei pflegen und danach `npm run sync:patch-notes` ausführen.

## 0.7.7

**28.03.2026**  
**Buchungskalender als zweite Ansicht**

Bestehende Buchungen koennen jetzt nicht nur als Liste, sondern auch in einer Kalenderansicht mit Tagesagenda betrachtet werden. Der Buchungsbereich startet dabei standardmaessig im Kalender. ([#4](https://github.com/cedricbetke/Church_INV/issues/4))

- Bestehende Buchungen haben jetzt einen Umschalter zwischen Liste und Kalender (Issue #4)
- Die neue Kalenderansicht zeigt eine Monatsuebersicht direkt auf der Buchungsseite (Issue #4)
- Ein gewaehlter Kalendertag blendet darunter die passende Tagesagenda ein (Issue #4)
- Der rechte Buchungsbereich startet jetzt standardmaessig in der Kalenderansicht (Issue #4)

## 0.7.6

**28.03.2026**  
**Foto- und Dev-Workflow gestrafft**

Fotos werden platzsparender behandelt, die Detailansicht nutzt wieder bevorzugt Vorschaubilder, und API sowie Client koennen jetzt bequem aus dem Projekt-Root oder direkt aus VS Code gestartet werden.

- Neue Geraetefotos werden erst beim Speichern hochgeladen statt schon beim Auswaehlen
- Neue Fotos werden direkt als optimierte JPG-Dateien gespeichert und erzeugen weiterhin kleine Thumbnails
- Bestehende Geraetefotos koennen per Script auf den optimierten JPG-Pfad gebracht werden
- Die Detailansicht nutzt wieder bevorzugt das Thumbnail fuer stabilere Bildanzeige
- API und Client lassen sich jetzt gemeinsam ueber Root-Skripte starten
- VS Code hat Tasks und Launch-Configs als Startbutton-Ersatz erhalten
- Docker- und Linux-Deployment inkl. persistentem Upload-Ordner ist dokumentiert

## 0.7.5

**27.03.2026**  
**Topbar und Feedback-Flow geschaerft**

Die Web-Topbar wurde klarer sortiert, Patch Notes sitzen jetzt direkt am Titel, und Bugs sowie Feature-Wuensche koennen direkt als GitHub-Issues gemeldet werden.

- Patch Notes wurden in der Standard-Webansicht direkt neben dem ChurchINV-Titel platziert
- Bug- und Feature-Buttons oeffnen direkt die passende GitHub-Issue-Maske mit vorbereiteten Labels
- Die wichtigsten Topbar-Symbole haben jetzt unaufdringliche Tooltips fuer bessere Orientierung
- Buchungen zeigen Konflikte mit bestehenden Reservierungen jetzt direkt als sichtbaren Warnblock mit betroffenen Inventarnummern

## 0.7.0

**27.03.2026**  
**Import, Buchungen und mobile Oberflaeche ausgebaut**

Der Bestand kann jetzt aus Teams/SharePoint uebernommen werden, Buchungen sind als eigener Workflow verfuegbar, und Haupt- sowie Detailansicht wurden fuer kleinere Screens deutlich nachgeschaerft.

- CSV-, Dokument- und Foto-Import aus Teams/SharePoint sind als wiederverwendbare Scripts vorhanden
- Teams-Fotos erzeugen jetzt zusaetzlich Vorschaubilder fuer schnellere Listenansichten
- Mehrgeraete-Buchungen mit Zeitraum, Konfliktpruefung und Loeschen sind verfuegbar
- QR-Scan kann in der Buchung direkt einzelne Geraete in die Auswahl uebernehmen
- Die Hauptansicht hat fuer schmale Screens eine kompakte mobile Kartenansicht erhalten
- Detailansicht und Buchungsseite wurden fuer kleinere Displays und bessere Reaktionszeit ueberarbeitet

## 0.6.0

**26.03.2026**  
**Inventar-Workflow deutlich erweitert**

Geräteverwaltung, Dokumente, Verlauf, QR-Scan und Admin-Funktionen wurden wesentlich ausgebaut.

- Geräte können angelegt, bearbeitet und gelöscht werden
- Dokumente pro Gerät sind integriert
- QR-Scan öffnet direkt die Detailansicht
- Geräteverlauf ist sichtbar
- Admin-Panel für erste Stammdatenpflege ist vorhanden
- Zustandshinweis ist als eigenes Gerätefeld verfügbar
- Swagger-Dokumentation wurde verbessert
- Optionaler Dark Mode wurde ergänzt
- Patch Notes sind als read-only Ansicht in der App verfügbar

## 0.5.0

**22.03.2026**  
**Detail und Edit-Flow verbessert**

Die Detailansicht wurde ausgebaut und der Edit-Flow auf eine gemeinsame Formularbasis gestellt.

- Detailansicht deutlich erweitert
- Add- und Edit-Formular zusammengeführt
- Foto-Upload integriert
- Erste Admin-Logik ergänzt

## 0.4.0

**18.03.2026**  
**Inventarliste und Grundnavigation stehen**

Die erste funktionsfähige Inventaransicht und der Basis-Flow zum Anlegen von Geräten wurden aufgebaut.

- Geräte können angelegt werden
- Inventarliste und Grundnavigation stehen

