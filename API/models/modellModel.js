const db = require('../config/db'); // Import der DB-Verbindung

const Modell = {
    getAll: async () => {
        const [rows] = await db.query('SELECT * FROM modell');
        return rows;
    },

    getById: async (id) => {
        const [rows] = await db.query('SELECT * FROM modell WHERE id = ?', [id]);
        return rows[0];
    },

    create: async (name, beschreibung) => {
        const [result] = await db.query('INSERT INTO modell (name, beschreibung) VALUES (?, ?)', [name, beschreibung]);
        return { id: result.insertId, name, beschreibung };
    },

    update: async (id, name, beschreibung) => {
        await db.query('UPDATE modell SET name = ?, beschreibung = ? WHERE id = ?', [name, beschreibung, id]);
        return { id, name, beschreibung };
    },

    delete: async (id) => {
        await db.query('DELETE FROM modell WHERE id = ?', [id]);
        return { message: `Modell mit ID ${id} gelöscht` };
    }
};

module.exports = Modell;
