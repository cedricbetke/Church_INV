const db = require('../config/db');

const toUsageMap = (rows, idColumn = 'id') => {
    return rows.reduce((usage, row) => {
        usage[row[idColumn]] = Number(row.count ?? 0);
        return usage;
    }, {});
};

const MasterdataUsage = {
    getAll: async () => {
        const [
            herstellerRows,
            objekttypRows,
            modellRows,
            statusRows,
            bereichGeraetRows,
            bereichKategorieRows,
            standortRows,
            kategorieRows,
            personRows,
        ] = await Promise.all([
            db.query('SELECT hersteller_id AS id, COUNT(*) AS count FROM modell WHERE hersteller_id IS NOT NULL GROUP BY hersteller_id'),
            db.query('SELECT objekttyp_id AS id, COUNT(*) AS count FROM modell WHERE objekttyp_id IS NOT NULL GROUP BY objekttyp_id'),
            db.query('SELECT modell_id AS id, COUNT(*) AS count FROM geraet WHERE modell_id IS NOT NULL GROUP BY modell_id'),
            db.query('SELECT status_id AS id, COUNT(*) AS count FROM geraet WHERE status_id IS NOT NULL GROUP BY status_id'),
            db.query('SELECT bereich_id AS id, COUNT(*) AS count FROM geraet WHERE bereich_id IS NOT NULL GROUP BY bereich_id'),
            db.query('SELECT bereich_id AS id, COUNT(*) AS count FROM kategorie WHERE bereich_id IS NOT NULL GROUP BY bereich_id'),
            db.query('SELECT standort_id AS id, COUNT(*) AS count FROM geraet WHERE standort_id IS NOT NULL GROUP BY standort_id'),
            db.query('SELECT kategorie_id AS id, COUNT(*) AS count FROM geraet WHERE kategorie_id IS NOT NULL GROUP BY kategorie_id'),
            db.query('SELECT verantwortlicher_id AS id, COUNT(*) AS count FROM geraet WHERE verantwortlicher_id IS NOT NULL GROUP BY verantwortlicher_id'),
        ]);

        const bereiche = toUsageMap(bereichGeraetRows[0]);
        for (const row of bereichKategorieRows[0]) {
            bereiche[row.id] = Number(bereiche[row.id] ?? 0) + Number(row.count ?? 0);
        }

        return {
            brands: toUsageMap(herstellerRows[0]),
            objectTypes: toUsageMap(objekttypRows[0]),
            models: toUsageMap(modellRows[0]),
            states: toUsageMap(statusRows[0]),
            bereiche,
            standorte: toUsageMap(standortRows[0]),
            kategorien: toUsageMap(kategorieRows[0]),
            personen: toUsageMap(personRows[0]),
        };
    },
};

module.exports = MasterdataUsage;
