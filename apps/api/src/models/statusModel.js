const db = require('../config/db'); // Import der DB-Verbindung

const Status = {
    getAll: async () => {
        const [rows] = await db.query('SELECT * FROM status ORDER BY name ASC');
        return rows;
    },

    getById: async (id) => {
        const [rows] = await db.query('SELECT * FROM status WHERE id = ?', [id]);
        return rows[0];
    },

    create: async (name) => {
        const [result] = await db.query('INSERT INTO status (name) VALUES (?)', [name]);
        return { id: result.insertId, name };
    },

    update: async (id, name) => {
        await db.query('UPDATE status SET name = ? WHERE id = ?', [name, id]);
        return { id, name };
    },

    delete: async (id) => {
        await db.query('DELETE FROM status WHERE id = ?', [id]);
        return { message: `Status mit ID ${id} gelöscht` };
    }
};

module.exports = Status;
