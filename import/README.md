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

## Hinweise

- Die Originaldateien sollten unveraendert bleiben.
- `sharepoint-storage-state.json` enthaelt sensible Session-Daten und sollte nicht committed werden.
- `sharepoint-cookie.txt` wird nur noch als Notfall-/Debug-Hilfsdatei behalten und vom neuen Hauptpfad nicht mehr benoetigt.
- Bilder und Dokumente werden getrennt importiert.
- Dokumente landen unter `apps/api/uploads/dokumente`.
