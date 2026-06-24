const db = require('../config/db'); // Import der DB-Verbindung

const Standort = {
    getAll: async () => {
        const [rows] = await db.query('SELECT * FROM standort ORDER BY name ASC');
        return rows;
    },

    getById: async (id) => {
        const [rows] = await db.query('SELECT * FROM standort WHERE id = ?', [id]);
        return rows[0];
    },

    getUsageCount: async (id) => {
        const [rows] = await db.query('SELECT COUNT(*) AS count FROM geraet WHERE standort_id = ?', [id]);
        return Number(rows[0]?.count ?? 0);
    },

    create: async (name) => {
        const [result] = await db.query('INSERT INTO standort (name) VALUES (?)', [name]);
        return { id: result.insertId, name };
    },

    update: async (id, name) => {
        await db.query('UPDATE standort SET name = ? WHERE id = ?', [name, id]);
        return { id, name };
    },

    delete: async (id) => {
        await db.query('DELETE FROM standort WHERE id = ?', [id]);
        return { message: `Standort mit ID ${id} gelöscht` };
    }
};

module.exports = Standort;
