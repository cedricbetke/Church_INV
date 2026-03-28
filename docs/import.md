# Import und Migration

Diese Seite beschreibt den aktuellen Migrationspfad aus der bestehenden Teams-/SharePoint-Liste nach ChurchINV.

## Kurz gesagt

Der Import ist in vier Teile getrennt:

1. Inventar und Stammdaten
2. verantwortliche Personen
3. Dokumente
4. Geraetefotos

Die Importer sind wiederverwendbar, solange die SharePoint-Struktur gleich bleibt und eine gueltige Session vorhanden ist.

## Voraussetzungen

- Zugriff auf die MySQL-Datenbank
- die benoetigten Exportdateien im Ordner `import/`
- installierte Dev-Dependencies
- gueltige SharePoint-Anmeldung fuer Dokument- und Foto-Import

Installation:

```bash
npm install
```

## Benoetigte Dateien

Im Ordner `import/` liegen je nach Schritt:

- `Inventar Liste csv.csv`
- optional `Inventar Liste csv mit schema.csv`
- `teams-export-with-id.csv`
- optional `sharepoint-storage-state.json`
- optional `sharepoint-cookie.txt`

Hinweise:

- `sharepoint-storage-state.json` wird beim Browser-Login erzeugt
- `sharepoint-cookie.txt` bleibt nur als Debug-/Notfallpfad bestehen

## Empfohlene Reihenfolge

1. Testdaten sichern oder bewusst leeren
2. Inventar-Import pruefen
3. Inventar importieren
4. Dokument-Import pruefen
5. Dokumente importieren
6. Foto-Import pruefen
7. Fotos importieren
8. Vorschaubilder fuer bestehende Fotos erzeugen
9. bestehende grosse Geraetefotos optional optimieren
10. falls noetig falsch importierte Foto-Dokumente bereinigen

## 1. Inventar-Import

Der Inventar-Import liest die Teams-CSV, normalisiert Werte und legt fehlende Stammdaten an.

Dry run:

```bash
npm run import:teams -- --dry-run
```

Echter Import:

```bash
npm run import:teams
```

Report:

- `import/import-report.json`

### Verhalten

- arbeitet ueber `Inventar-Nr`
- legt fehlende Stammdaten an
- mappt Personen pragmatisch aus dem Teams-Feld
- behandelt einige fehlende Hersteller und Objekttypen mit dem Fallback `Unbekannt`

### Bekannte Grenzen

Aktuell bleiben drei problematische Geraete aussen vor, solange die Quelldaten nicht ergaenzt werden:

- `InvNr 40`
- `InvNr 489`
- `InvNr 779`

## 2. Dokument-Import

Der Dokument-Import nutzt:

- `teams-export-with-id.csv`
- die SharePoint-Item-ID
- eine gespeicherte SharePoint-Session

Beim ersten Lauf oder nach Session-Ablauf:

```bash
npm run import:teams-documents -- --dry-run --fresh-login
```

Danach im Browser bei SharePoint anmelden und im Terminal bestaetigen.

Normaler Dry run:

```bash
npm run import:teams-documents -- --dry-run
```

Echter Import:

```bash
npm run import:teams-documents
```

Report:

- `import/documents-import-report.json`

### Verhalten

- holt klassische SharePoint-List-Attachments
- speichert Dateien unter `apps/api/uploads/dokumente`
- legt Eintraege in `dokumente` an
- ueberspringt vorhandene Dokumente
- ueberspringt bewusst `Reserved_ImageAttachment_...`, wenn diese eigentlich Geraetefotos sind

## 3. Foto-Import

Der Foto-Import nutzt dieselbe gespeicherte SharePoint-Session wie der Dokument-Import.

Dry run:

```bash
npm run import:teams-photos -- --dry-run
```

Echter Import:

```bash
npm run import:teams-photos
```

Report:

- `import/photos-import-report.json`

### Verhalten

Der Importer prueft pro SharePoint-Item in dieser Reihenfolge:

1. normales Feld `DevicePhoto`
2. Fallback auf `Reserved_ImageAttachment_...`, falls das Bild technisch als reservierter Anhang am Eintrag haengt

Bei Erfolg:

- Datei wird unter `apps/api/uploads/geraete` gespeichert
- `geraet.geraetefoto_url` wird gesetzt
- neue Fotos werden dabei direkt als optimiertes JPG gespeichert

### Bekannte Restfaelle

- `InvNr 218` kann je nach SharePoint-Zustand ein manueller Restfall bleiben

## 4. Thumbnail-Backfill fuer Tabellenvorschau

Bestehende Fotos koennen nachtraeglich kleine Vorschaubilder bekommen, damit die Tabelle nicht immer die Vollbilder laden muss.

Dry run:

```bash
npm run backfill:photo-thumbs -- --dry-run
```

Echter Lauf:

```bash
npm run backfill:photo-thumbs
```

Report:

- `import/photo-thumbnail-backfill-report.json`

Bei Erfolg:

- Vorschaubilder werden unter `apps/api/uploads/geraete/thumbs` gespeichert
- die Tabellenansicht nutzt diese kleineren Dateien statt der Vollbilder

## 5. Optimierung vorhandener Geraetefotos

Bestehende Fotos koennen nachtraeglich auf denselben optimierten JPG-Pfad gebracht werden wie neue Uploads.

Dry run:

```bash
npm run optimize:stored-photos -- --dry-run
```

Echter Lauf:

```bash
npm run optimize:stored-photos
```

Report:

- `import/photo-optimization-report.json`

Bei Erfolg:

- grosse Altdateien werden durch optimierte JPGs ersetzt
- Thumbnails werden neu erzeugt
- `geraet.geraetefoto_url` wird bei Bedarf auf den neuen JPG-Pfad aktualisiert

Wichtig:

- der Lauf sollte auf dem Bestand ausgefuehrt werden, der tatsaechlich von der laufenden App genutzt wird
- Sonderfaelle mit ungueltigen Altdateien koennen als Fehler im Report auftauchen

## 6. Cleanup falsch importierter Foto-Dokumente

Falls vor dem Fix SharePoint-Bilder irrtuemlich als Dokumente importiert wurden, entfernt der Cleanup diese Dubletten wieder aus:

- Tabelle `dokumente`
- `apps/api/uploads/dokumente`

Dry run:

```bash
npm run cleanup:photo-documents -- --dry-run
```

Echter Cleanup:

```bash
npm run cleanup:photo-documents
```

Report:

- `import/cleanup-photo-documents-report.json`

Wichtig:

- diesen Cleanup erst nach erfolgreichem Foto-Import ausfuehren

## Re-Import spaeter

Die Importer sind fuer spaetere Neuimporte wiederverwendbar.

Worauf du achten musst:

- die SharePoint-Session kann ablaufen
  Dann mit `--fresh-login` neu anmelden
- geaenderte SharePoint-Strukturen koennen Anpassungen noetig machen
- die drei bekannten fehlenden Geraete bleiben ohne bessere Quelldaten weiter draussen

Empfohlener Ablauf fuer einen spaeteren Re-Import:

1. `npm run import:teams -- --dry-run`
2. `npm run import:teams-documents -- --dry-run`
3. `npm run import:teams-photos -- --dry-run`
4. Reports pruefen
5. echte Laeufe starten

## Sicherheit und Git

Diese Pfade sind Laufzeitdaten und gehoeren nicht in Git:

- `apps/api/uploads/`
- `import/sharepoint-storage-state.json`
- `import/sharepoint-cookie.txt`

Die Eintraege sind bereits in `.gitignore` enthalten.

## Operative Kurzfassung

Die kompaktere Arbeitsanleitung fuer den Tagesgebrauch liegt weiterhin hier:

- [import/README.md](/c:/Users/cedri/vsProjects/ChurhINV_REPO/Church_INV/import/README.md)
