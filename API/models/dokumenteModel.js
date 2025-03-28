const db = require('../config/db'); // Import der DB-Verbindung

const Dokumente = {
    getAll: async () => {
        const [rows] = await db.query('SELECT * FROM dokumente');
        return rows;
    },

    getById: async (id) => {
        const [rows] = await db.query('SELECT * FROM dokumente WHERE id = ?', [id]);
        return rows[0];  // Nur das erste Ergebnis zurückgeben (falls vorhanden)
    },

    create: async (name, url, geraete_id) => {
        const [result] = await db.query('INSERT INTO dokumente (name, url, geraete_id) VALUES (?, ?, ?)', [name, url, geraete_id]);
        return { id: result.insertId, name, url, geraete_id };
    },

    update: async (id, name, url, geraete_id) => {
        await db.query('UPDATE dokumente SET name = ?, url = ?, geraete_id = ? WHERE id = ?', [name, url, geraete_id, id]);
        return { id, name, url, geraete_id };
    },

    delete: async (id) => {
        await db.query('DELETE FROM dokumente WHERE id = ?', [id]);
        return { message: `Dokument mit ID ${id} gelöscht` };
    }
};

module.exports = Dokumente;
