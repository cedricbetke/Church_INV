const db = require('../config/db'); // Import der DB-Verbindung

const Geraet = {
    getAll: async () => {
        const [rows] = await db.query('SELECT * FROM geraete_View');
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

    create: async (status_id, modell_id, bereich_id, kaufdatum, einkaufspreis, serien_nr, standort_id, verantwortlicher_id, kategorie_id, qrcode, geraetefoto_url) => {
        // Falls der Wert nicht übergeben wird, dann als NULL speichern
        const _kaufdatum = kaufdatum || null;
        const _einkaufspreis = einkaufspreis || null;
        const _serien_nr = serien_nr || null;
        const _standort_id = standort_id || null;
        const _verantwortlicher_id = verantwortlicher_id || null;
        const _kategorie_id = kategorie_id || null;
        const _qrcode = qrcode || null;
        const _geraetefoto_url = geraetefoto_url || null;

        const [result] = await db.query(
            'INSERT INTO geraet (status_id, modell_id, bereich_id, kaufdatum, einkaufspreis, serien_nr, standort_id, verantwortlicher_id, kategorie_id, qrcode, geraetefoto_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [status_id, modell_id, bereich_id, _kaufdatum, _einkaufspreis, _serien_nr, _standort_id, _verantwortlicher_id, _kategorie_id, _qrcode, _geraetefoto_url]
        );

        return {
            inv_nr: result.insertId,
            status_id,
            modell_id,
            bereich_id,
            kaufdatum: _kaufdatum,
            einkaufspreis: _einkaufspreis,
            serien_nr: _serien_nr,
            standort_id: _standort_id,
            verantwortlicher_id: _verantwortlicher_id,
            kategorie_id: _kategorie_id,
            qrcode: _qrcode,
            geraetefoto_url: _geraetefoto_url
        };
    },

    update: async (id, status_id, modell_id, bereich_id, kaufdatum, einkaufspreis, serien_nr, standort_id, verantwortlicher_id, kategorie_id, qrcode, geraetefoto_url) => {
        // Falls der Wert nicht übergeben wird, dann als NULL speichern
        const _kaufdatum = kaufdatum || null;
        const _einkaufspreis = einkaufspreis || null;
        const _serien_nr = serien_nr || null;
        const _standort_id = standort_id || null;
        const _verantwortlicher_id = verantwortlicher_id || null;
        const _kategorie_id = kategorie_id || null;
        const _qrcode = qrcode || null;
        const _geraetefoto_url = geraetefoto_url || null;

        await db.query(
            'UPDATE geraet SET status_id = ?, modell_id = ?, bereich_id = ?, kaufdatum = ?, einkaufspreis = ?, serien_nr = ?, standort_id = ?, verantwortlicher_id = ?, kategorie_id = ?, qrcode = ?, geraetefoto_url = ? WHERE inv_nr = ?',
            [status_id, modell_id, bereich_id, _kaufdatum, _einkaufspreis, _serien_nr, _standort_id, _verantwortlicher_id, _kategorie_id, _qrcode, _geraetefoto_url, id]
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
            qrcode: _qrcode,
            geraetefoto_url: _geraetefoto_url
        };
    },

    delete: async (id) => {
        await db.query('DELETE FROM geraet WHERE inv_nr = ?', [id]);
        return { message: `Gerät mit ID ${id} gelöscht` };
    }
};

module.exports = Geraet;
