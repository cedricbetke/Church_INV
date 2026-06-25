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

    getUsageCount: async (id) => {
        const [rows] = await db.query('SELECT COUNT(*) AS count FROM geraet WHERE standort_id = ?', [id]);
        return Number(rows[0]?.count ?? 0);
    },

    create: async (name) => {
        const [result] = await db.query('INSERT INTO standort (name) VALUES (?)', [name]);
        return { id: result.insertId, name };
    },

    update: async (id, name) => {
        await db.query('UPDATE standort SET name = ? WHERE id = ?', [name, id]);
        return { id, name };
    },

    delete: async (id) => {
        await db.query('DELETE FROM standort WHERE id = ?', [id]);
        return { message: `Standort mit ID ${id} gelöscht` };
    },

    merge: async (sourceId, targetId) => {
        const numericSourceId = Number(sourceId);
        const numericTargetId = Number(targetId);

        if (!Number.isInteger(numericSourceId) || !Number.isInteger(numericTargetId)) {
            const error = new Error('Quell- und Ziel-Standort muessen gueltige IDs sein');
            error.statusCode = 400;
            throw error;
        }

        if (numericSourceId === numericTargetId) {
            const error = new Error('Quell- und Ziel-Standort duerfen nicht identisch sein');
            error.statusCode = 400;
            throw error;
        }

        const connection = await db.getConnection();

        try {
            await connection.beginTransaction();

            const [sourceRows] = await connection.query('SELECT id, name FROM standort WHERE id = ? FOR UPDATE', [numericSourceId]);
            const [targetRows] = await connection.query('SELECT id, name FROM standort WHERE id = ? FOR UPDATE', [numericTargetId]);

            if (!sourceRows[0]) {
                const error = new Error('Quell-Standort nicht gefunden');
                error.statusCode = 404;
                throw error;
            }

            if (!targetRows[0]) {
                const error = new Error('Ziel-Standort nicht gefunden');
                error.statusCode = 404;
                throw error;
            }

            const [updateResult] = await connection.query(
                'UPDATE geraet SET standort_id = ? WHERE standort_id = ?',
                [numericTargetId, numericSourceId]
            );
            const [remainingRows] = await connection.query(
                'SELECT COUNT(*) AS count FROM geraet WHERE standort_id = ?',
                [numericSourceId]
            );

            let deletedSource = false;
            if (Number(remainingRows[0]?.count ?? 0) === 0) {
                await connection.query('DELETE FROM standort WHERE id = ?', [numericSourceId]);
                deletedSource = true;
            }

            await connection.commit();

            return {
                sourceId: numericSourceId,
                sourceName: sourceRows[0].name,
                targetId: numericTargetId,
                targetName: targetRows[0].name,
                updatedDevices: Number(updateResult.affectedRows ?? 0),
                deletedSource,
            };
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }
};

module.exports = Standort;
