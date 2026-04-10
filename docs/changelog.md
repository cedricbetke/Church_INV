# Patch Notes

> Diese Datei wird aus `docs/patch-notes/patch-notes.json` erzeugt.
> Änderungen daher bitte in der JSON-Datei pflegen und danach `npm run sync:patch-notes` ausführen.

## 0.7.13

**10.04.2026**  
**Inventarsuche und Filterbedienung nachgeschaerft**

Die Inventarliste ist bei groesseren Datenmengen jetzt deutlich besser bedienbar. Filter liegen nicht mehr inline ueber der Tabelle, sondern als eigenes Overlay vor, die Filterwerte kommen alphabetisch sortiert aus der API, und die Freitextsuche versteht mehr alltagstaugliche Schreibweisen. Zusaetzlich merkt sich die Web-App Theme, Update-Hinweise und die gewaehlte Tabellengroesse im Browser, und mehrere selten genutzte UI-Bausteine werden erst bei Bedarf nachgeladen.

- Die Filter der Inventarliste oeffnen sich jetzt als eigenes Overlay statt die Tabellenansicht inline nach unten zu druecken
- Auf breiten Webansichten wird der Filter als rechte Seitenleiste gezeigt, auf kleineren Breiten als Bottom Sheet
- Status, Hersteller, Modell, Objekttyp, Bereich und Standort werden aus der API jetzt alphabetisch nach Name geliefert
- Der Filter der Inventarliste kennt jetzt auch Objekttyp als eigene Filtergruppe
- Die Freitextsuche durchsucht zusaetzlich Objekttyp, Kaufdatum und Anhang-Namen
- Die Freitextsuche ist robuster gegen Schreibvarianten und unterstuetzt Kombinationen mehrerer Suchwoerter besser
- Inventarnummern lassen sich in der Suche toleranter finden, auch in Schreibweisen wie `INV-123`
- Die Web-App zeigt neue Patch-Notes-Versionen als einmaligen Hinweis beim Oeffnen an und merkt sich gesehene Versionen im Browser
- Der gewaehlte Hell- oder Darkmode bleibt im Browser gespeichert und wird beim naechsten Oeffnen wiederhergestellt
- Die Inventarliste bietet jetzt auch 100 Eintraege pro Seite und merkt sich die zuletzt gewaehlte Seitengroesse im Browser
- Patch Notes, Stammdaten-Admin, Detailansicht und Add/Edit-Form werden im Client jetzt erst bei Bedarf lazy geladen

## 0.7.12

**09.04.2026**  
**Testserver-Deploy per GitHub Actions eingerichtet**

ChurchINV kann jetzt automatisiert auf einen externen Testserver deployed werden. Der Workflow prueft den Docker-Build vorab, synchronisiert das Repo per SSH auf den Server und startet die Container dort neu. Der Web-Client ist dabei fuer den externen Zugriff auf Port 51821 ausgelegt.

- Ein GitHub-Actions-Workflow deployt den aktuellen Stand automatisiert auf den externen Testserver
- Der Deploy prueft zuerst den Docker-Build und synchronisiert das Repo anschliessend per SSH und rsync auf den Zielserver
- Der Server startet API und Client danach per docker compose neu und raeumt alte Container mit remove-orphans mit auf
- Der Deploy-Workflow nutzt einen Base64-kodierten SSH-Key in den Repository-Secrets fuer stabilere Uebertragung in GitHub Actions
- Die Deployment-Doku beschreibt jetzt die noetigen Secrets, den Server-Setup und den manuellen wie automatischen Ablauf
- Der Web-Client ist fuer den externen Testbetrieb auf Host-Port 51821 dokumentiert und erreichbar

## 0.7.11

**08.04.2026**  
**Modellgruppierung und Stammdaten bereinigt**

Die Modellansicht in den Buchungen fasst Geraete jetzt robuster nach Hersteller und Modell zusammen. Zusaetzlich wurden mehrere Modell- und Standort-Schreibvarianten in den Stammdaten bereinigt, und die Hauptseite zeigt keinen wirkungslosen Zurueck-Pfeil mehr.

- Die Auswahl Nach Modell in den Buchungen gruppiert jetzt nach Hersteller plus Modell statt zusaetzlich nach Standort oder Bereich
- Standort- und Bereichsinformationen bleiben in der Modellansicht sichtbar, erzeugen aber keine getrennten Gruppen mehr
- Ausgemusterte Geraete werden auf der Buchungsseite nicht mehr in die buchbare Auswahl aufgenommen
- Mehrere doppelte Modell-Schreibweisen in den Stammdaten wurden auf gemeinsame Zielmodelle zusammengefuehrt
- Mehrere offensichtliche Standort-Tippfehler wurden in den Stammdaten auf die jeweils korrekte Variante vereinheitlicht
- Die Hauptseite zeigt in der Topbar keinen leeren Zurueck-Pfeil mehr

## 0.7.10

**29.03.2026**  
**Mobile Kartenansicht der Inventarliste verfeinert**

Die mobile Hauptansicht der Inventarliste wurde visuell neu gewichtet: Karten sind kompakter, der Footer ist auf kleinen Breiten besser ausbalanciert, und Fotos haben in der Kartenansicht jetzt klar mehr Prioritaet.

- Die mobile Kartenansicht der Inventarliste wurde platzsparender abgestimmt, damit auf kleinen Breiten mehr Geraete gleichzeitig sichtbar bleiben
- Der mobile Pagination-Footer der Hauptansicht wurde mehrfach nachgeschaerft und als flache, besser ausbalancierte Leiste fuer kleine Breiten umgesetzt
- In der mobilen Kartenansicht wurden die Tags unter den Geraeten wieder entfernt, um die Darstellung ruhiger zu halten
- Das Thumbnail neben der Modellbezeichnung ist in der mobilen Hauptansicht jetzt deutlich groesser und als wichtiges visuelles Element gewichtet
- Desktop- und breitere Webansichten der Inventarliste bleiben von diesen Anpassungen unberuehrt

## 0.7.9

**28.03.2026**  
**Mobile Buchungsansicht stabilisiert**

Auf schmalen Breiten bleibt der Buchungsbereich vorerst bewusst bei der Listenansicht, damit die mobile Darstellung stabil und lesbar bleibt.

- Die Kalenderansicht fuer bestehende Buchungen ist auf mobilen Breiten vorerst deaktiviert
- Mobile Geraete zeigen im rechten Buchungsbereich nur noch die stabilere Listenansicht
- Desktop und breitere Webansichten behalten den Umschalter zwischen Liste und Kalender
- Im Buchungsformular gibt es jetzt nur noch eine gezielte Aktion zum Leeren der Geraeteauswahl statt eines kompletten Formular-Resets
- Die Auswahldialoge auf der AddPage unterscheiden jetzt sauber zwischen Feldern mit echter Neuanlage und reinen Auswahlfeldern
- Modell und Kategorie werden in der AddPage erst freigegeben, wenn die jeweils benoetigten Felder vorher gesetzt sind
- Mehrtaegige Buchungen im Kalender werden derzeit ueber Tagesstatus wie 'laufend' statt ueber starke Blockgrafiken kenntlich gemacht

## 0.7.8

**28.03.2026**  
**Buchungsformular und Patch Notes nachgeschaerft**

Das Buchungsformular reagiert beim Datum sinnvoller und startet mit alltagstauglichen Tageszeiten, die Patch Notes koennen direkt auf Issues verlinken, und die Topbar zeigt den Beta-Status jetzt sichtbarer an. ([#5](https://github.com/cedricbetke/Church_INV/issues/5))

- Beim Aendern des Startdatums wird das Enddatum in typischen Standardfaellen automatisch passend mitgezogen (Issue #5)
- Leere Datumsfelder starten beim Oeffnen des Pickers jetzt sinnvoll mit 00:00 fuer den Anfang und 23:59 fuer das Ende
- Die Patch-Notes-Ansicht in der App kann jetzt direkt auf verknuepfte GitHub-Issues verlinken
- Die Topbar zeigt den aktuellen Beta-Status jetzt direkt am ChurchINV-Titel
- Auf mobilen Breiten wurde das Beta-Badge kompakter unter den Titel gezogen, damit die Aktionsbuttons sichtbar bleiben

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

