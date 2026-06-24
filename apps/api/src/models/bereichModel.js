const db = require('../config/db'); // Import der DB-Verbindung

const Bereich = {
    getAll: async () => {
        const [rows] = await db.query('SELECT * FROM bereich ORDER BY name ASC');
        return rows;
    },

    getById: async (id) => {
        const [rows] = await db.query('SELECT * FROM bereich WHERE id = ?', [id]);
        return rows[0];
    },

    getUsageCount: async (id) => {
        const [geraetRows] = await db.query('SELECT COUNT(*) AS count FROM geraet WHERE bereich_id = ?', [id]);
        const [kategorieRows] = await db.query('SELECT COUNT(*) AS count FROM kategorie WHERE bereich_id = ?', [id]);
        return Number(geraetRows[0]?.count ?? 0) + Number(kategorieRows[0]?.count ?? 0);
    },

    create: async (name) => {
        const [result] = await db.query('INSERT INTO bereich (name) VALUES (?)', [name]);
        return { id: result.insertId, name };
    },

    update: async (id, name) => {
        await db.query('UPDATE bereich SET name = ? WHERE id = ?', [name, id]);
        return { id, name };
    },

    delete: async (id) => {
        await db.query('DELETE FROM bereich WHERE id = ?', [id]);
        return { message: `Bereich mit ID ${id} gelöscht` };
    }
};

module.exports = Bereich;
