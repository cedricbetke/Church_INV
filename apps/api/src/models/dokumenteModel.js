const db = require('../config/db');
const fs = require('fs');
const path = require('path');

const Dokumente = {
    getAll: async (geraete_id = null) => {
        if (geraete_id) {
            const [rows] = await db.query('SELECT * FROM dokumente WHERE geraete_id = ? ORDER BY id DESC', [geraete_id]);
            return rows;
        }

        const [rows] = await db.query('SELECT * FROM dokumente ORDER BY id DESC');
        return rows;
    },

    getById: async (id) => {
        const [rows] = await db.query('SELECT * FROM dokumente WHERE id = ?', [id]);
        return rows[0];
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
        const dokument = await Dokumente.getById(id);
        await db.query('DELETE FROM dokumente WHERE id = ?', [id]);

        if (dokument?.url && typeof dokument.url === 'string' && dokument.url.startsWith('/uploads/')) {
            const filePath = path.resolve(process.cwd(), dokument.url.replace(/^\//, ''));
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        }

        return { message: `Dokument mit ID ${id} geloescht` };
    }
};

module.exports = Dokumente;
