const db = require('../config/db'); // Import der DB-Verbindung

const Kategorie = {
    getAll: async () => {
        const [rows] = await db.query('SELECT * FROM kategorie');
        return rows;
    },

    getById: async (id) => {
        const [rows] = await db.query('SELECT * FROM kategorie WHERE id = ?', [id]);
        return rows[0];
    },

    create: async (name, bereich_id) => {
        const [result] = await db.query('INSERT INTO kategorie (name, bereich_id) VALUES (?, ?)', [name, bereich_id]);
        return { id: result.insertId, name, bereich_id };
    },

    update: async (id, name, bereich_id) => {
        await db.query('UPDATE kategorie SET name = ?, bereich_id = ? WHERE id = ?', [name, bereich_id, id]);
        return { id, name, bereich_id };
    },

    delete: async (id) => {
        await db.query('DELETE FROM kategorie WHERE id = ?', [id]);
        return { message: `Kategorie mit ID ${id} gelöscht` };
    }
};

module.exports = Kategorie;
