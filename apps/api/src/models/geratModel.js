const fs = require('fs');
const path = require('path');
const db = require('../config/db');

const uploadsRootDir = path.resolve(__dirname, '..', '..', 'uploads');

const deleteUploadedFile = (storedPath) => {
    if (!storedPath || typeof storedPath !== 'string' || !storedPath.startsWith('/uploads/')) {
        return;
    }

    const relativePath = storedPath.replace(/^\/uploads[\\/]?/, '');
    const filePath = path.resolve(uploadsRootDir, relativePath);

    if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
    }
};

const Geraet = {
    getAll: async () => {
        const [rows] = await db.query(`
            SELECT
                g.inv_nr AS inv_nr,
                g.kaufdatum AS kaufdatum,
                g.einkaufspreis AS einkaufspreis,
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
        `);
        return rows;
    },

    getById: async (id) => {
        const [rows] = await db.query('SELECT * FROM geraet WHERE inv_nr = ?', [id]);
        return rows[0];
    },

    getMaxId: async () => {
        const [maxId] = await db.query('SELECT naechste_inventarnummer() AS next_number');
        return maxId[0].next_number;
    },

    create: async (inv_nr, status_id, modell_id, bereich_id, kaufdatum, einkaufspreis, serien_nr, standort_id, verantwortlicher_id, kategorie_id, geraetefoto_url) => {
        const _kaufdatum = kaufdatum || null;
        const _einkaufspreis = einkaufspreis || null;
        const _serien_nr = serien_nr || null;
        const _standort_id = standort_id || null;
        const _verantwortlicher_id = verantwortlicher_id || null;
        const _kategorie_id = kategorie_id || null;
        const _geraetefoto_url = geraetefoto_url || null;

        await db.query(
            'INSERT INTO geraet (inv_nr, status_id, modell_id, bereich_id, kaufdatum, einkaufspreis, serien_nr, standort_id, verantwortlicher_id, kategorie_id, geraetefoto_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [inv_nr, status_id, modell_id, bereich_id, _kaufdatum, _einkaufspreis, _serien_nr, _standort_id, _verantwortlicher_id, _kategorie_id, _geraetefoto_url],
        );

        return {
            inv_nr,
            status_id,
            modell_id,
            bereich_id,
            kaufdatum: _kaufdatum,
            einkaufspreis: _einkaufspreis,
            serien_nr: _serien_nr,
            standort_id: _standort_id,
            verantwortlicher_id: _verantwortlicher_id,
            kategorie_id: _kategorie_id,
            geraetefoto_url: _geraetefoto_url,
        };
    },

    update: async (id, status_id, modell_id, bereich_id, kaufdatum, einkaufspreis, serien_nr, standort_id, verantwortlicher_id, kategorie_id, geraetefoto_url) => {
        const _kaufdatum = kaufdatum || null;
        const _einkaufspreis = einkaufspreis || null;
        const _serien_nr = serien_nr || null;
        const _standort_id = standort_id || null;
        const _verantwortlicher_id = verantwortlicher_id || null;
        const _kategorie_id = kategorie_id || null;
        const _geraetefoto_url = geraetefoto_url || null;

        await db.query(
            'UPDATE geraet SET status_id = ?, modell_id = ?, bereich_id = ?, kaufdatum = ?, einkaufspreis = ?, serien_nr = ?, standort_id = ?, verantwortlicher_id = ?, kategorie_id = ?, geraetefoto_url = ? WHERE inv_nr = ?',
            [status_id, modell_id, bereich_id, _kaufdatum, _einkaufspreis, _serien_nr, _standort_id, _verantwortlicher_id, _kategorie_id, _geraetefoto_url, id],
        );

        return {
            inv_nr: id,
            status_id,
            modell_id,
            bereich_id,
            kaufdatum: _kaufdatum,
            einkaufspreis: _einkaufspreis,
            serien_nr: _serien_nr,
            standort_id: _standort_id,
            verantwortlicher_id: _verantwortlicher_id,
            kategorie_id: _kategorie_id,
            geraetefoto_url: _geraetefoto_url,
        };
    },

    delete: async (id) => {
        const [geraetRows] = await db.query('SELECT geraetefoto_url FROM geraet WHERE inv_nr = ?', [id]);
        const geraet = geraetRows[0] ?? null;
        const [dokumentRows] = await db.query('SELECT url FROM dokumente WHERE geraete_id = ?', [id]);

        await db.query('DELETE FROM geraet WHERE inv_nr = ?', [id]);

        deleteUploadedFile(geraet?.geraetefoto_url);
        for (const dokument of dokumentRows) {
            deleteUploadedFile(dokument.url);
        }

        return { message: `Geraet mit ID ${id} geloescht` };
    },
};

module.exports = Geraet;
