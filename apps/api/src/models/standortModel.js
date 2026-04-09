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

    create: async (name, adresse) => {
        const [result] = await db.query(
            'INSERT INTO standort (name, adresse) VALUES (?, ?)',
            [name, adresse]
        );
        return { id: result.insertId, name, adresse };
    },

    update: async (id, name, adresse) => {
        await db.query(
            'UPDATE standort SET name = ?, adresse = ? WHERE id = ?',
            [name, adresse, id]
        );
        return { id, name, adresse };
    },

    delete: async (id) => {
        await db.query('DELETE FROM standort WHERE id = ?', [id]);
        return { message: `Standort mit ID ${id} gelöscht` };
    }
};

module.exports = Standort;
