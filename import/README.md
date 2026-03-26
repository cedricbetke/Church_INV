# Import-Ablage

Lege hier die Exporte und Hilfsdateien fuer den Teams-/SharePoint-Import ab.

Empfohlene Dateien:

- `Inventar Liste csv.csv`
- optional `Inventar Liste csv mit schema.csv`
- `teams-export-with-id.csv`
- optional `sharepoint-cookie.txt`
- optional `sharepoint-storage-state.json`

## Inventar-Import

Dry run:

```bash
npm run import:teams -- --dry-run
```

Echter Import:

```bash
npm run import:teams
```

Optional mit expliziter Datei:

```bash
npm run import:teams -- --file="import/Inventar Liste csv.csv"
```

Der Inventar-Import schreibt einen Report nach:

- `import/import-report.json`

## Dokument-Import

 Fuer den Dokument-Import wird benoetigt:

- `teams-export-with-id.csv` mit mindestens `ID` und `Inventar Nummer`
- eine gueltige SharePoint-Login-Session

Der Importer nutzt jetzt bevorzugt eine echte Browser-Session via Playwright. Beim ersten Lauf oeffnet sich ein Browserfenster, in dem du dich bei SharePoint anmeldest. Danach speichert das Script den Login-Status in:

- `import/sharepoint-storage-state.json`

Beim naechsten Lauf wird diese Datei wiederverwendet. Wenn die Session abgelaufen ist, kannst du mit `--fresh-login` erneut anmelden.

Vorher einmal die Dev-Dependency installieren:

```bash
npm install
```

Dry run:

```bash
npm run import:teams-documents -- --dry-run
```

Echter Import:

```bash
npm run import:teams-documents
```

Login-Session bewusst erneuern:

```bash
npm run import:teams-documents -- --fresh-login
```

Optional mit expliziter Storage-State-Datei:

```bash
npm run import:teams-documents -- --storage-state="import/sharepoint-storage-state.json"
```

Der Dokument-Import schreibt einen Report nach:

- `import/documents-import-report.json`

## Foto-Import

Der Foto-Import nutzt dieselbe gespeicherte SharePoint-Login-Session wie der Dokument-Import:

- `import/sharepoint-storage-state.json`

Er prueft zuerst das normale SharePoint-Feld `DevicePhoto` und faellt, falls dort nichts gesetzt ist, auf `Reserved_ImageAttachment_...`-Anhaenge des Listeneintrags zurueck.

Dry run:

```bash
npm run import:teams-photos -- --dry-run
```

Echter Import:

```bash
npm run import:teams-photos
```

Optional mit expliziter Storage-State-Datei:

```bash
npm run import:teams-photos -- --storage-state="import/sharepoint-storage-state.json"
```

Der Foto-Import schreibt einen Report nach:

- `import/photos-import-report.json`

## Cleanup falsch importierter Foto-Dokumente

Falls der Dokument-Import vor dem Fix schon `Reserved_ImageAttachment_...`-Dateien als normale Dokumente aufgenommen hat, kannst du sie damit gezielt wieder entfernen.

Dry run:

```bash
npm run cleanup:photo-documents -- --dry-run
```

Echter Cleanup:

```bash
npm run cleanup:photo-documents
```

Der Cleanup schreibt einen Report nach:

- `import/cleanup-photo-documents-report.json`

## Hinweise

- Die Originaldateien sollten unveraendert bleiben.
- `sharepoint-storage-state.json` enthaelt sensible Session-Daten und sollte nicht committed werden.
- `sharepoint-cookie.txt` wird nur noch als Notfall-/Debug-Hilfsdatei behalten und vom neuen Hauptpfad nicht mehr benoetigt.
- Bilder und Dokumente werden getrennt importiert.
- SharePoint-Reservierungsbilder wie `Reserved_ImageAttachment_...jpg` werden im Dokument-Import bewusst uebersprungen, damit sie nicht doppelt als Dokument und Foto landen.
- Bilder landen unter `apps/api/uploads/geraete`.
- Dokumente landen unter `apps/api/uploads/dokumente`.
