const db = require('../config/db'); // Import der DB-Verbindung

const Hersteller = {
    getAll: async () => {
        const [rows] = await db.query('SELECT * FROM hersteller ORDER BY name ASC');
        return rows;
    },

    getById: async (id) => {
        const [rows] = await db.query('SELECT * FROM hersteller WHERE id = ?', [id]);
        return rows[0];
    },

    create: async (name) => {
        const [result] = await db.query('INSERT INTO hersteller (name) VALUES (?)', [name]);
        return { id: result.insertId, name };
    },

    update: async (id, name) => {
        await db.query('UPDATE hersteller SET name = ? WHERE id = ?', [name, id]);
        return { id, name };
    },

    delete: async (id) => {
        await db.query('DELETE FROM hersteller WHERE id = ?', [id]);
        return { message: `Hersteller mit ID ${id} gelöscht` };
    }
};

module.exports = Hersteller;
