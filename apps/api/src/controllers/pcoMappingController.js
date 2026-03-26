const PcoMapping = require('../models/pcoMappingModel');

const getAllMappings = async (_req, res) => {
    try {
        const mappings = await PcoMapping.getAll();
        res.json(mappings);
    } catch (error) {
        console.error('Fehler beim Laden der PCO-Mappings:', error);
        res.status(500).json({ error: 'PCO-Mappings konnten nicht geladen werden.' });
    }
};

const updateMappingAssignments = async (req, res) => {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({ error: 'Ungueltige Mapping-ID.' });
    }

    const aktiv =
        typeof req.body?.aktiv === 'boolean'
            ? req.body.aktiv
            : true;

    const geraete_inv_nr = Array.isArray(req.body?.geraete_inv_nr)
        ? req.body.geraete_inv_nr
            .map((value) => Number(value))
            .filter((value) => Number.isInteger(value) && value > 0)
        : [];

    try {
        const updatedMapping = await PcoMapping.updateAssignments(id, {
            aktiv,
            geraete_inv_nr,
        });

        if (!updatedMapping) {
            return res.status(404).json({ error: 'PCO-Mapping nicht gefunden.' });
        }

        return res.json(updatedMapping);
    } catch (error) {
        console.error('Fehler beim Aktualisieren des PCO-Mappings:', error);
        return res.status(500).json({ error: 'PCO-Mapping konnte nicht aktualisiert werden.' });
    }
};

module.exports = {
    getAllMappings,
    updateMappingAssignments,
};
