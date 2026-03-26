const db = require('../config/db');

const mapRowsToMappings = (rows) => {
    const grouped = new Map();

    for (const row of rows) {
        if (!grouped.has(row.id)) {
            grouped.set(row.id, {
                id: row.id,
                pco_service_type_id: row.pco_service_type_id,
                pco_service_type_name: row.pco_service_type_name,
                is_virtual: Boolean(row.is_virtual),
                source_service_type_id: row.source_service_type_id,
                source_service_type_name: row.source_service_type_name,
                source_series_title: row.source_series_title,
                aktiv: Boolean(row.aktiv),
                erstellt_am: row.erstellt_am,
                aktualisiert_am: row.aktualisiert_am,
                geraete: [],
            });
        }

        if (row.geraet_inv_nr !== null && row.geraet_inv_nr !== undefined) {
            grouped.get(row.id).geraete.push({
                inv_nr: row.geraet_inv_nr,
                modell: row.modell,
                hersteller: row.hersteller,
                bereich: row.bereich,
                standort: row.standort,
            });
        }
    }

    return [...grouped.values()];
};

const PcoMapping = {
    getAll: async () => {
        const [rows] = await db.query(`
            SELECT
                m.id,
                m.pco_service_type_id,
                m.pco_service_type_name,
                m.is_virtual,
                m.source_service_type_id,
                m.source_service_type_name,
                m.source_series_title,
                m.aktiv,
                m.erstellt_am,
                m.aktualisiert_am,
                mg.geraet_inv_nr,
                g.inv_nr AS geraet_inv_nr,
                mo.name AS modell,
                h.name AS hersteller,
                b.name AS bereich,
                s.name AS standort
            FROM pco_service_type_mapping m
            LEFT JOIN pco_service_type_mapping_geraet mg
                ON mg.mapping_id = m.id
            LEFT JOIN geraet g
                ON g.inv_nr = mg.geraet_inv_nr
            LEFT JOIN modell mo
                ON mo.id = g.modell_id
            LEFT JOIN hersteller h
                ON h.id = mo.hersteller_id
            LEFT JOIN bereich b
                ON b.id = g.bereich_id
            LEFT JOIN standort s
                ON s.id = g.standort_id
            ORDER BY m.pco_service_type_name ASC, mg.geraet_inv_nr ASC
        `);

        return mapRowsToMappings(rows);
    },

    updateAssignments: async (id, payload) => {
        const {
            aktiv = true,
            geraete_inv_nr = [],
        } = payload;

        const connection = await db.getConnection();

        try {
            await connection.beginTransaction();

            const [existingRows] = await connection.query(
                'SELECT id FROM pco_service_type_mapping WHERE id = ?',
                [id],
            );

            if (!existingRows.length) {
                await connection.rollback();
                return null;
            }

            await connection.query(
                'UPDATE pco_service_type_mapping SET aktiv = ? WHERE id = ?',
                [aktiv ? 1 : 0, id],
            );

            await connection.query(
                'DELETE FROM pco_service_type_mapping_geraet WHERE mapping_id = ?',
                [id],
            );

            if (geraete_inv_nr.length > 0) {
                const values = geraete_inv_nr.map((invNr) => [id, invNr]);
                await connection.query(
                    'INSERT INTO pco_service_type_mapping_geraet (mapping_id, geraet_inv_nr) VALUES ?',
                    [values],
                );
            }

            await connection.commit();
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }

        const mappings = await PcoMapping.getAll();
        return mappings.find((mapping) => mapping.id === Number(id)) ?? null;
    },
};

module.exports = PcoMapping;
