const db = require('../config/db'); // Import der DB-Verbindung

const Geraet = {
    getAll: async () => {
        const [rows] = await db.query('SELECT * FROM geraet');
        return rows;
    },

    getById: async (id) => {
        const [rows] = await db.query('SELECT * FROM geraet WHERE id = ?', [id]);
        return rows[0];
    },

    create: async (name, seriennummer, status_id, standort_id, objekttyp_id) => {
        const [result] = await db.query(
            'INSERT INTO geraet (name, seriennummer, status_id, standort_id, objekttyp_id) VALUES (?, ?, ?, ?, ?)',
            [name, seriennummer, status_id, standort_id, objekttyp_id]
        );
        return { id: result.insertId, name, seriennummer, status_id, standort_id, objekttyp_id };
    },

    update: async (id, name, seriennummer, status_id, standort_id, objekttyp_id) => {
        await db.query(
            'UPDATE geraet SET name = ?, seriennummer = ?, status_id = ?, standort_id = ?, objekttyp_id = ? WHERE id = ?',
            [name, seriennummer, status_id, standort_id, objekttyp_id, id]
        );
        return { id, name, seriennummer, status_id, standort_id, objekttyp_id };
    },

    delete: async (id) => {
        await db.query('DELETE FROM geraet WHERE id = ?', [id]);
        return { message: `Gerät mit ID ${id} gelöscht` };
    }
};

module.exports = Geraet;
