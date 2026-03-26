# Planning Center

Diese Seite beschreibt den aktuellen ersten PCO-Baustein: Service Types werden aus einer lokalen JSON-Datei synchronisiert und koennen danach in ChurchINV mit Standard-Geraeten verknuepft werden.

## Kurz Gesagt

Der Ablauf ist im Moment:

1. PCO-Daten mit deinem bestehenden Script als JSON nach `import/pco-services-import-report.json` schreiben
2. diese JSON in die Mapping-Tabellen synchronisieren
3. pro Service Type Standard-Geraete zuordnen
4. daraus direkt PCO-Buchungen synchronisieren

## Datenbanktabellen

Fuer den aktuellen Mapping-Schritt werden diese Tabellen erwartet:

```sql
CREATE TABLE pco_service_type_mapping (
    id INT AUTO_INCREMENT PRIMARY KEY,
    pco_service_type_id VARCHAR(80) NOT NULL,
    pco_service_type_name VARCHAR(150) NOT NULL,
    is_virtual TINYINT(1) NOT NULL DEFAULT 0,
    source_service_type_id VARCHAR(80) NULL,
    source_service_type_name VARCHAR(150) NULL,
    source_series_title VARCHAR(150) NULL,
    aktiv TINYINT(1) NOT NULL DEFAULT 1,
    erstellt_am TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    aktualisiert_am TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uq_pco_service_type_mapping (pco_service_type_id)
);

CREATE TABLE pco_service_type_mapping_geraet (
    mapping_id INT NOT NULL,
    geraet_inv_nr INT NOT NULL,
    PRIMARY KEY (mapping_id, geraet_inv_nr),
    CONSTRAINT fk_pco_mapping_geraet_mapping
        FOREIGN KEY (mapping_id) REFERENCES pco_service_type_mapping(id)
        ON DELETE CASCADE,
    CONSTRAINT fk_pco_mapping_geraet_geraet
        FOREIGN KEY (geraet_inv_nr) REFERENCES geraet(inv_nr)
        ON DELETE CASCADE
);
```

## Sync Aus Der JSON

Die JSON-Datei wird nicht direkt von der App gelesen. Stattdessen wird sie per Script in die Datenbank uebernommen:

```bash
npm run sync:pco-mappings -- --dry-run
npm run sync:pco-mappings
```

Der Sync:

- uebernimmt normale `service_types`
- uebernimmt `derived_service_types` als `is_virtual = true`
- schreibt nur die Kopf-Daten des Mappings
- laesst bestehende Geraetezuordnungen unangetastet

Der Report landet in:

- `import/pco-mapping-sync-report.json`

## API

Aktuell stehen diese Endpunkte bereit:

- `GET /api/pco-mapping`
- `PUT /api/pco-mapping/:id`
- `GET /api/pco-plan-suggestion`

`GET` liefert alle Service-Type-Mappings inklusive der bereits verknuepften Geraete.

`PUT` aktualisiert:

- `aktiv`
- `geraete_inv_nr`

Beispiel:

```json
{
  "aktiv": true,
  "geraete_inv_nr": [12, 13, 18]
}
```

## Direkter PCO-Buchungssync

Der pragmatische Hauptpfad ist jetzt nicht mehr nur der Vorschlag in der UI, sondern ein direkter Sync in die Buchungstabelle.

Script:

```bash
npm run sync:pco-bookings -- --dry-run
npm run sync:pco-bookings
```

Der Sync:

- liest `import/pco-services-import-report.json`
- nutzt nur aktive PCO-Mappings mit zugeordneten Geraeten
- legt daraus direkte Buchungen mit `quelle = 'pco'` an
- aktualisiert bestehende PCO-Buchungen ueber `external_id`
- ueberschreibt bei virtuellen Service Types die Basis-Service-Type-Plaene fuer dieselben Termine
- protokolliert Konflikte statt blind doppelt zu buchen

Report:

- `import/pco-booking-sync-report.json`

Wichtig:

- dafuer muessen die erweiterten Felder in `geraet_buchung` vorhanden sein
- siehe [Buchung](/c:/Users/cedri/vsProjects/ChurhINV_REPO/Church_INV/docs/booking.md)

## Was Noch Nicht Drin Ist

Noch nicht enthalten sind:

- direkter Live-Abruf aus Planning Center in der App
- Persistenz einzelner PCO-Plaene in einer eigenen Tabelle
- Ruecksynchronisierung zu PCO

## Nächster Sinnvoller Schritt

Nach dem Sync ist der naechste Ausbau:

1. Mapping-Ansicht in der App
2. Geraete pro Service Type pflegen
3. PCO-Buchungssync regelmaessig laufen lassen
4. spaeter optional auf echten API-Live-Sync erweitern
