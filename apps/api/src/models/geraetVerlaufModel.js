const db = require('../config/db');

const DETAIL_SELECT = `
    SELECT
        g.inv_nr AS inv_nr,
        g.kaufdatum AS kaufdatum,
        g.einkaufspreis AS einkaufspreis,
        g.serien_nr AS serien_nr,
        g.geraetefoto_url AS geraetefoto_url,
        s.name AS Status,
        h.name AS Hersteller,
        o.name AS Objekttyp,
        m.name AS Modell,
        stand.name AS Standort,
        b.name AS Bereich,
        k.name AS Kategorie,
        CONCAT(p.vorname, ' ', p.nachname) AS Verantwortlicher
    FROM geraet g
    JOIN status s ON g.status_id = s.id
    JOIN modell m ON g.modell_id = m.id
    JOIN hersteller h ON m.hersteller_id = h.id
    JOIN objekttyp o ON m.objekttyp_id = o.id
    JOIN bereich b ON g.bereich_id = b.id
    LEFT JOIN standort stand ON g.standort_id = stand.id
    LEFT JOIN kategorie k ON g.kategorie_id = k.id
    LEFT JOIN person p ON g.verantwortlicher_id = p.id
`;

const normalizeValue = (value) => {
    if (value === undefined || value === null || value === '') {
        return null;
    }

    return String(value);
};

const GeraetVerlauf = {
    getAllByGeraetId: async (geraetInvNr) => {
        const [rows] = await db.query(
            `SELECT id, geraet_inv_nr, aktion, feld, alter_wert, neuer_wert, erstellt_am
             FROM geraet_verlauf
             WHERE geraet_inv_nr = ?
             ORDER BY erstellt_am DESC, id DESC`,
            [geraetInvNr],
        );
        return rows;
    },

    logEntry: async ({ geraetInvNr, aktion, feld = null, alterWert = null, neuerWert = null }) => {
        await db.query(
            `INSERT INTO geraet_verlauf (geraet_inv_nr, aktion, feld, alter_wert, neuer_wert)
             VALUES (?, ?, ?, ?, ?)`,
            [geraetInvNr, aktion, feld, normalizeValue(alterWert), normalizeValue(neuerWert)],
        );
    },

    logCreate: async (geraetInvNr) => {
        await GeraetVerlauf.logEntry({
            geraetInvNr,
            aktion: 'create',
            feld: 'geraet',
            neuerWert: 'Geraet angelegt',
        });
    },

    logUpdateChanges: async (geraetInvNr, before, after) => {
        const fieldsToTrack = [
            { feld: 'status', before: before.Status, after: after.Status },
            { feld: 'hersteller', before: before.Hersteller, after: after.Hersteller },
            { feld: 'objekttyp', before: before.Objekttyp, after: after.Objekttyp },
            { feld: 'modell', before: before.Modell, after: after.Modell },
            { feld: 'bereich', before: before.Bereich, after: after.Bereich },
            { feld: 'standort', before: before.Standort, after: after.Standort },
            { feld: 'kategorie', before: before.Kategorie, after: after.Kategorie },
            { feld: 'verantwortlicher', before: before.Verantwortlicher, after: after.Verantwortlicher },
            { feld: 'seriennummer', before: before.serien_nr, after: after.serien_nr },
            { feld: 'kaufdatum', before: before.kaufdatum, after: after.kaufdatum },
            { feld: 'einkaufspreis', before: before.einkaufspreis, after: after.einkaufspreis },
            { feld: 'geraetefoto', before: before.geraetefoto_url, after: after.geraetefoto_url },
        ];

        for (const field of fieldsToTrack) {
            const previousValue = normalizeValue(field.before);
            const nextValue = normalizeValue(field.after);

            if (previousValue === nextValue) {
                continue;
            }

            await GeraetVerlauf.logEntry({
                geraetInvNr,
                aktion: 'update',
                feld: field.feld,
                alterWert: previousValue,
                neuerWert: nextValue,
            });
        }
    },

    getGeraetSnapshot: async (geraetInvNr) => {
        const [rows] = await db.query(`${DETAIL_SELECT} WHERE g.inv_nr = ?`, [geraetInvNr]);
        return rows[0] ?? null;
    },
};

module.exports = GeraetVerlauf;
