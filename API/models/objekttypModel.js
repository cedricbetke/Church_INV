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

    create: async (name, beschreibung) => {
        const [result] = await db.query('INSERT INTO objekttyp (name, beschreibung) VALUES (?, ?)', [name, beschreibung]);
        return { id: result.insertId, name, beschreibung };
    },

    update: async (id, name, beschreibung) => {
        await db.query('UPDATE objekttyp SET name = ?, beschreibung = ? WHERE id = ?', [name, beschreibung, id]);
        return { id, name, beschreibung };
    },

    delete: async (id) => {
        await db.query('DELETE FROM objekttyp WHERE id = ?', [id]);
        return { message: `Objekttyp mit ID ${id} gelöscht` };
    }
};

module.exports = Objekttyp;
