const db = require('../config/db'); // Import der DB-Verbindung

const Objekttyp = {
    getAll: async () => {
        const [rows] = await db.query('SELECT * FROM objekttyp');
        return rows;
    },

    getById: async (id) => {
        const [rows] = await db.query('SELECT * FROM objekttyp WHERE id = ?', [id]);
        return rows[0];
    },

    create: async (name) => {
        const [result] = await db.query('INSERT INTO objekttyp (name) VALUES (?)', [name]);
        return { id: result.insertId, name };
    },

    update: async (id, name) => {
        await db.query('UPDATE objekttyp SET name = ? WHERE id = ?', [name, id]);
        return { id, name };
    },

    delete: async (id) => {
        await db.query('DELETE FROM objekttyp WHERE id = ?', [id]);
        return { message: `Objekttyp mit ID ${id} gelöscht` };
    }
};

module.exports = Objekttyp;
