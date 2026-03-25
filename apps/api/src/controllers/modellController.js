const Modell = require('../models/modellModel');

const getAllModelle = async (req, res) => {
    try {
        const modelle = await Modell.getAll();
        res.json(modelle);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getModellById = async (req, res) => {
    try {
        const modell = await Modell.getById(req.params.id);
        if (!modell) {
            return res.status(404).json({ error: 'Modell nicht gefunden' });
        }

        res.json(modell);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const createModell = async (req, res) => {
    try {
        const { name, hersteller_id, objekttyp_id = null } = req.body;
        if (!name || !hersteller_id) {
            return res.status(400).json({ error: 'Name und Hersteller-ID sind erforderlich' });
        }

        const newModell = await Modell.create(name, hersteller_id, objekttyp_id);
        res.status(201).json(newModell);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const updateModell = async (req, res) => {
    try {
        const { name, hersteller_id, objekttyp_id = null } = req.body;
        if (!name || !hersteller_id) {
            return res.status(400).json({ error: 'Name und Hersteller-ID sind erforderlich' });
        }

        const updatedModell = await Modell.update(req.params.id, name, hersteller_id, objekttyp_id);
        res.json(updatedModell);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const deleteModell = async (req, res) => {
    try {
        const result = await Modell.delete(req.params.id);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { getAllModelle, getModellById, createModell, updateModell, deleteModell };
