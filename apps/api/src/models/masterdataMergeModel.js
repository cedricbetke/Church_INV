const db = require('../config/db');

const validateIds = (sourceId, targetId) => {
    const numericSourceId = Number(sourceId);
    const numericTargetId = Number(targetId);

    if (!Number.isInteger(numericSourceId) || !Number.isInteger(numericTargetId)) {
        const error = new Error('Quell- und Ziel-ID muessen gueltig sein');
        error.statusCode = 400;
        throw error;
    }

    if (numericSourceId === numericTargetId) {
        const error = new Error('Quelle und Ziel duerfen nicht identisch sein');
        error.statusCode = 400;
        throw error;
    }

    return { numericSourceId, numericTargetId };
};

const mergeMasterdata = async ({ table, label, references, sourceId, targetId, selectColumns = 'id, name' }) => {
    const { numericSourceId, numericTargetId } = validateIds(sourceId, targetId);
    const connection = await db.getConnection();

    try {
        await connection.beginTransaction();

        const [sourceRows] = await connection.query(`SELECT ${selectColumns} FROM ${table} WHERE id = ? FOR UPDATE`, [numericSourceId]);
        const [targetRows] = await connection.query(`SELECT ${selectColumns} FROM ${table} WHERE id = ? FOR UPDATE`, [numericTargetId]);

        if (!sourceRows[0]) {
            const error = new Error(`${label} nicht gefunden`);
            error.statusCode = 404;
            throw error;
        }

        if (!targetRows[0]) {
            const error = new Error(`Ziel-${label} nicht gefunden`);
            error.statusCode = 404;
            throw error;
        }

        let updatedReferences = 0;
        for (const reference of references) {
            const [updateResult] = await connection.query(
                `UPDATE ${reference.table} SET ${reference.column} = ? WHERE ${reference.column} = ?`,
                [numericTargetId, numericSourceId]
            );
            updatedReferences += Number(updateResult.affectedRows ?? 0);
        }

        await connection.query(`DELETE FROM ${table} WHERE id = ?`, [numericSourceId]);
        await connection.commit();

        return {
            sourceId: numericSourceId,
            sourceName: sourceRows[0].name ?? [sourceRows[0].vorname, sourceRows[0].nachname].filter(Boolean).join(' '),
            targetId: numericTargetId,
            targetName: targetRows[0].name ?? [targetRows[0].vorname, targetRows[0].nachname].filter(Boolean).join(' '),
            updatedReferences,
            deletedSource: true,
        };
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
};

module.exports = { mergeMasterdata };
