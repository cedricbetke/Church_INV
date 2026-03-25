const db = require('../config/db');

const Modell = {
    getAll: async () => {
        const [rows] = await db.query('SELECT * FROM modell');
        return rows;
    },

    getById: async (id) => {
        const [rows] = await db.query('SELECT * FROM modell WHERE id = ?', [id]);
        return rows[0];
    },

    create: async (name, hersteller_id, objekttyp_id = null) => {
        const [result] = await db.query(
            'INSERT INTO modell (name, hersteller_id, objekttyp_id) VALUES (?, ?, ?)',
            [name, hersteller_id, objekttyp_id],
        );

        return { id: result.insertId, name, hersteller_id, objekttyp_id };
    },

    update: async (id, name, hersteller_id, objekttyp_id = null) => {
        await db.query(
            'UPDATE modell SET name = ?, hersteller_id = ?, objekttyp_id = ? WHERE id = ?',
            [name, hersteller_id, objekttyp_id, id],
        );

        return { id, name, hersteller_id, objekttyp_id };
    },

    delete: async (id) => {
        await db.query('DELETE FROM modell WHERE id = ?', [id]);
        return { message: `Modell mit ID ${id} geloescht` };
    }
};

module.exports = Modell;
