# Import und Migration

Diese Seite beschreibt den aktuellen Importpfad fuer Daten aus der bestehenden Teams-/SharePoint-Liste nach ChurchINV.

## Ziel

Der Import deckt vier Bereiche ab:

- Stammdaten und Geraete
- verantwortliche Personen
- Dokumente
- Geraetefotos

Die Importer sind so aufgebaut, dass sie bei spaeteren Neu-Importen erneut genutzt werden koennen, solange die Struktur der SharePoint-Liste gleich bleibt.

## Voraussetzungen

- Zugriff auf die MySQL-Datenbank
- die Exportdateien im Ordner `import/`
- eine gueltige SharePoint-Anmeldung fuer Dokument- und Foto-Import
- installierte Dev-Dependencies

Installation:

```bash
npm install
```

## Benoetigte Dateien

Im Ordner `import/` werden abgelegt:

- `Inventar Liste csv.csv`
- optional `Inventar Liste csv mit schema.csv`
- `teams-export-with-id.csv`
- optional `sharepoint-storage-state.json`
- optional `sharepoint-cookie.txt`

Hinweis:
- `sharepoint-storage-state.json` wird durch den Browser-Login erzeugt
- `sharepoint-cookie.txt` wird nur noch als Debug-/Notfallpfad behalten

## Empfohlene Reihenfolge

1. Testdaten sichern oder bewusst leeren
2. Inventar-Import pruefen
3. Inventar importieren
4. Dokumente pruefen
5. Dokumente importieren
6. Fotos pruefen
7. Fotos importieren
8. Falls noetig falsch importierte Foto-Dokumente bereinigen

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
- behandelt einige fehlende Hersteller/Objekttypen mit Fallback `Unbekannt`

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
- ueberspringt bereits vorhandene Dokumente
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

### Bekannte Restfaelle

- `InvNr 218` kann je nach SharePoint-Zustand ein manueller Restfall bleiben

## 4. Cleanup falsch importierter Foto-Dokumente

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

## Re-Import in Zukunft

Die Importer sind so angelegt, dass sie erneut ausgefuehrt werden koennen.

Worauf du achten musst:

- SharePoint-Session kann ablaufen
  Dann mit `--fresh-login` neu anmelden.
- neue oder geaenderte SharePoint-Strukturen koennen Anpassungen noetig machen
- die drei bekannten fehlenden Geraete bleiben ohne ergaenzte Quelldaten weiter draussen

Empfohlener Ablauf bei spaeterem Re-Import:

1. `npm run import:teams -- --dry-run`
2. `npm run import:teams-documents -- --dry-run`
3. `npm run import:teams-photos -- --dry-run`
4. Reports pruefen
5. echte Laeufe starten

## Sicherheit und Git

Folgende Dateien bzw. Verzeichnisse sind Laufzeitdaten und gehoeren nicht in Git:

- `apps/api/uploads/`
- `import/sharepoint-storage-state.json`
- `import/sharepoint-cookie.txt`

Die Eintraege sind bereits in `.gitignore` enthalten.

## Operative Kurzfassung

Die kompaktere Arbeitsanleitung fuer den Tagesgebrauch liegt weiterhin hier:

- [`import/README.md`](/c:/Users/cedri/vsProjects/ChurhINV_REPO/Church_INV/import/README.md)
