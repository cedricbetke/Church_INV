const db = require('../config/db');

const BOOKING_BASE_SELECT = `
    SELECT
        b.id,
        b.titel,
        b.bucher_name,
        b.zweck,
        b.start_datum,
        b.end_datum,
        b.status,
        b.erstellt_am,
        g.inv_nr AS geraet_inv_nr,
        m.name AS geraet_modell,
        h.name AS geraet_hersteller
    FROM geraet_buchung b
    LEFT JOIN geraet_buchung_geraet bg ON bg.buchung_id = b.id
    LEFT JOIN geraet g ON g.inv_nr = bg.geraet_inv_nr
    LEFT JOIN modell m ON m.id = g.modell_id
    LEFT JOIN hersteller h ON h.id = m.hersteller_id
`;

const mapBookingRows = (rows) => {
    const bookings = [];
    const bookingById = new Map();

    for (const row of rows) {
        let booking = bookingById.get(row.id);

        if (!booking) {
            booking = {
                id: row.id,
                titel: row.titel,
                bucher_name: row.bucher_name,
                zweck: row.zweck,
                start_datum: row.start_datum,
                end_datum: row.end_datum,
                status: row.status,
                erstellt_am: row.erstellt_am,
                geraete: [],
            };

            bookingById.set(row.id, booking);
            bookings.push(booking);
        }

        if (row.geraet_inv_nr != null) {
            booking.geraete.push({
                inv_nr: row.geraet_inv_nr,
                modell: row.geraet_modell,
                hersteller: row.geraet_hersteller,
            });
        }
    }

    return bookings;
};

const createBookingConflictError = (conflicts) => {
    const error = new Error('Mindestens eines der Geraete ist im gewaehlten Zeitraum bereits gebucht.');
    error.code = 'BOOKING_CONFLICT';
    error.conflicts = conflicts;
    return error;
};

const Buchung = {
    getAll: async () => {
        const [rows] = await db.query(
            `${BOOKING_BASE_SELECT}
             ORDER BY b.start_datum DESC, b.id DESC, bg.geraet_inv_nr ASC`,
        );

        return mapBookingRows(rows);
    },

    getById: async (id, connection = db) => {
        const [rows] = await connection.query(
            `${BOOKING_BASE_SELECT}
             WHERE b.id = ?
             ORDER BY bg.geraet_inv_nr ASC`,
            [id],
        );

        return mapBookingRows(rows)[0] ?? null;
    },

    create: async ({ titel, bucher_name, zweck = null, start_datum, end_datum, geraete_inv_nr }) => {
        const uniqueGeraete = [...new Set(geraete_inv_nr.map((value) => Number(value)).filter(Number.isFinite))];
        const connection = await db.getConnection();

        try {
            await connection.beginTransaction();

            const [conflictRows] = await connection.query(
                `
                    SELECT DISTINCT
                        b.id,
                        b.titel,
                        bg.geraet_inv_nr
                    FROM geraet_buchung b
                    INNER JOIN geraet_buchung_geraet bg ON bg.buchung_id = b.id
                    WHERE bg.geraet_inv_nr IN (?)
                      AND b.status <> 'storniert'
                      AND b.start_datum <= ?
                      AND b.end_datum >= ?
                `,
                [uniqueGeraete, end_datum, start_datum],
            );

            if (conflictRows.length > 0) {
                throw createBookingConflictError(conflictRows);
            }

            const [result] = await connection.query(
                `
                    INSERT INTO geraet_buchung (titel, bucher_name, zweck, start_datum, end_datum, status)
                    VALUES (?, ?, ?, ?, ?, 'reserviert')
                `,
                [titel, bucher_name, zweck, start_datum, end_datum],
            );

            if (uniqueGeraete.length > 0) {
                const values = uniqueGeraete.map((geraetInvNr) => [result.insertId, geraetInvNr]);
                await connection.query(
                    'INSERT INTO geraet_buchung_geraet (buchung_id, geraet_inv_nr) VALUES ?',
                    [values],
                );
            }

            await connection.commit();

            return await Buchung.getById(result.insertId);
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    },

    delete: async (id) => {
        const connection = await db.getConnection();

        try {
            await connection.beginTransaction();
            await connection.query('DELETE FROM geraet_buchung_geraet WHERE buchung_id = ?', [id]);
            await connection.query('DELETE FROM geraet_buchung WHERE id = ?', [id]);
            await connection.commit();

            return { message: `Buchung ${id} geloescht` };
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    },
};

module.exports = Buchung;
