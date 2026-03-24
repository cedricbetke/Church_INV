const db = require('../config/db'); // Import der DB-Verbindung

const Person = {
    getAll: async () => {
        const [rows] = await db.query('SELECT * FROM person');
        return rows;
    },

    getById: async (id) => {
        const [rows] = await db.query('SELECT * FROM person WHERE id = ?', [id]);
        return rows[0];
    },

    create: async (vorname, nachname, email) => {
        const [result] = await db.query(
            'INSERT INTO person (vorname, nachname, email) VALUES (?, ?, ?)',
            [vorname, nachname, email]
        );
        return { id: result.insertId, vorname, nachname, email };
    },

    update: async (id, vorname, nachname, email) => {
        await db.query(
            'UPDATE person SET vorname = ?, nachname = ?, email = ? WHERE id = ?',
            [vorname, nachname, email, id]
        );
        return { id, vorname, nachname, email };
    },

    delete: async (id) => {
        await db.query('DELETE FROM person WHERE id = ?', [id]);
        return { message: `Person mit ID ${id} gelöscht` };
    }
};

module.exports = Person;
