const PcoPlanSuggestion = require('../models/pcoPlanSuggestionModel');

const getAllSuggestions = async (_req, res) => {
    try {
        const suggestions = await PcoPlanSuggestion.getAll();
        res.json(suggestions);
    } catch (error) {
        console.error('Fehler beim Laden der PCO-Planvorschlaege:', error);
        res.status(500).json({ error: 'PCO-Planvorschlaege konnten nicht geladen werden.' });
    }
};

module.exports = {
    getAllSuggestions,
};
