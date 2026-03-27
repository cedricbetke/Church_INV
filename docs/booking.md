# Buchung

Diese Seite beschreibt den aktuellen manuellen Buchungsblock in ChurchINV.

## Kurz gesagt

- eine Buchung kann mehrere Geraete enthalten
- Buchungen haben Titel, Bucher, optionalen Zweck und einen Zeitraum
- beim Anlegen wird auf einfache Zeitueberschneidungen geprueft
- auf der Buchungsseite kann ein QR-Code direkt ein einzelnes Geraet in die aktuelle Auswahl uebernehmen

## Benoetigte DB-Tabellen

```sql
CREATE TABLE geraet_buchung (
    id INT AUTO_INCREMENT PRIMARY KEY,
    titel VARCHAR(150) NOT NULL,
    bucher_name VARCHAR(120) NOT NULL,
    zweck TEXT NULL,
    start_datum DATETIME NOT NULL,
    end_datum DATETIME NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'reserviert',
    erstellt_am TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE geraet_buchung_geraet (
    buchung_id INT NOT NULL,
    geraet_inv_nr INT NOT NULL,
    PRIMARY KEY (buchung_id, geraet_inv_nr),
    CONSTRAINT fk_geraet_buchung_geraet_buchung
        FOREIGN KEY (buchung_id) REFERENCES geraet_buchung(id)
        ON DELETE CASCADE,
    CONSTRAINT fk_geraet_buchung_geraet_geraet
        FOREIGN KEY (geraet_inv_nr) REFERENCES geraet(inv_nr)
        ON DELETE CASCADE
);
```

## API

- `GET /api/buchung`
- `POST /api/buchung`
- `DELETE /api/buchung/:id`

## Oberflaeche

- eigene Buchungsseite statt Modal
- vorhandene Buchungen starten eingeklappt
- Geraete koennen einzeln oder nach Modellmenge ausgewaehlt werden
- QR-Scan kann einzelne Geraete direkt in die Auswahl uebernehmen

## Optionale PCO-Erweiterung

Planning Center ist aktuell nur ein vorbereiteter Nebenpfad. Fuer den manuellen Buchungsbetrieb werden keine zusaetzlichen PCO-Spalten in `geraet_buchung` benoetigt.

Wenn Buchungen spaeter doch direkt aus Planning Center synchronisiert werden sollen, kann `geraet_buchung` optional um diese Felder erweitert werden:

- `quelle`
- `external_id`
- `pco_service_type_id`
- `planning_center_url`

## Erste Grenzen

- noch keine Kalenderansicht
- noch keine Sammelbearbeitung bestehender Buchungen
- noch kein automatischer Geraetestatus-Wechsel
