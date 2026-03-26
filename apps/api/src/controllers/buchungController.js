const Buchung = require('../models/buchungModel');

const isValidDateString = (value) => {
    if (!value || typeof value !== 'string') {
        return false;
    }

    return !Number.isNaN(new Date(value).getTime());
};

const getAllBuchungen = async (_req, res) => {
    try {
        const buchungen = await Buchung.getAll();
        res.json(buchungen);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const createBuchung = async (req, res) => {
    try {
        const { titel, bucher_name, zweck = null, start_datum, end_datum, geraete_inv_nr } = req.body;

        if (!titel || !bucher_name || !isValidDateString(start_datum) || !isValidDateString(end_datum) || !Array.isArray(geraete_inv_nr) || geraete_inv_nr.length === 0) {
            return res.status(400).json({ error: 'Titel, Buchen fuer, Zeitraum und mindestens ein Geraet sind erforderlich.' });
        }

        const startDate = new Date(start_datum);
        const endDate = new Date(end_datum);

        if (endDate < startDate) {
            return res.status(400).json({ error: 'Das Enddatum darf nicht vor dem Startdatum liegen.' });
        }

        const buchung = await Buchung.create({
            titel: String(titel).trim(),
            bucher_name: String(bucher_name).trim(),
            zweck: typeof zweck === 'string' && zweck.trim() ? zweck.trim() : null,
            start_datum,
            end_datum,
            geraete_inv_nr,
        });

        res.status(201).json(buchung);
    } catch (error) {
        if (error.code === 'BOOKING_CONFLICT') {
            return res.status(409).json({
                error: error.message,
                conflicts: error.conflicts,
            });
        }

        res.status(500).json({ error: error.message });
    }
};

const deleteBuchung = async (req, res) => {
    try {
        const result = await Buchung.delete(req.params.id);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    getAllBuchungen,
    createBuchung,
    deleteBuchung,
};
