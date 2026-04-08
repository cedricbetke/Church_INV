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
- der rechte Buchungsbereich kennt jetzt eine umschaltbare Listen- und Kalenderansicht
- die Kalenderansicht ist der aktuelle Standard beim Oeffnen der Buchungsseite
- vorhandene Buchungen starten in der Listenansicht eingeklappt
- auf mobilen Breiten bleibt der rechte Buchungsbereich vorerst bei der Listenansicht, damit die Darstellung stabil bleibt
- Geraete koennen einzeln oder nach Modellmenge ausgewaehlt werden
- die Modellansicht gruppiert Geraete nach Hersteller plus Modell, nicht mehr nach Standort oder Bereich
- unterschiedliche Standorte oder Bereiche bleiben in der Modellansicht nur noch Zusatzinfo und trennen keine Gruppen mehr
- ausgemusterte Geraete werden auf der Buchungsseite nicht mehr als buchbare Auswahl angezeigt
- die Geraeteauswahl kann gezielt geleert werden, ohne das restliche Buchungsformular zurueckzusetzen
- beim Setzen des Startdatums wird das Enddatum in typischen Faellen sinnvoll mitgezogen
- leere Datumsfelder starten beim Oeffnen des nativen Pickers mit 00:00 fuer `Von` und 23:59 fuer `Bis`
- QR-Scan kann einzelne Geraete direkt in die Auswahl uebernehmen

## Stammdatenhinweis

- die Gruppierung nach Modell ist nur dann wirklich sauber, wenn Hersteller und Modell in den Stammdaten konsistent gepflegt sind
- offensichtliche Schreibvarianten bei Modellen und Standorten wurden im Datenbestand bereits bereinigt
- falls gleiche Geraete trotzdem noch getrennt erscheinen, sollte zuerst auf abweichende Hersteller- oder Modellnamen geprueft werden

## Kalenderansicht

- Monatsansicht fuer bestehende Buchungen direkt auf der Buchungsseite
- Tagesauswahl zeigt darunter die Agenda fuer den gewaehlten Tag
- Monatswechsel ist moeglich, ohne den restlichen Buchungs-Workflow zu verlassen
- die Listenansicht bleibt parallel als zweite Ansicht erhalten
- auf mobilen Breiten ist die Kalenderansicht vorerst ausgeblendet

## Optionale PCO-Erweiterung

Planning Center ist aktuell nur ein vorbereiteter Nebenpfad. Fuer den manuellen Buchungsbetrieb werden keine zusaetzlichen PCO-Spalten in `geraet_buchung` benoetigt.

Wenn Buchungen spaeter doch direkt aus Planning Center synchronisiert werden sollen, kann `geraet_buchung` optional um diese Felder erweitert werden:

- `quelle`
- `external_id`
- `pco_service_type_id`
- `planning_center_url`

## Erste Grenzen

- noch keine Sammelbearbeitung bestehender Buchungen
- noch kein automatischer Geraetestatus-Wechsel
