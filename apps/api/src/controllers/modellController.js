const Modell = require('../models/modellModel');

// Alle Modelle abrufen
const getAllModelle = async (req, res) => {
    try {
        const modelle = await Modell.getAll();
        res.json(modelle);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Modell nach ID abrufen
const getModellById = async (req, res) => {
    try {
        const modell = await Modell.getById(req.params.id);
        if (!modell) return res.status(404).json({ error: 'Modell nicht gefunden' });
        res.json(modell);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Neues Modell erstellen
const createModell = async (req, res) => {
    try {
        const { name, beschreibung } = req.body;
        if (!name) return res.status(400).json({ error: 'Name ist erforderlich' });

        const newModell = await Modell.create(name, beschreibung);
        res.status(201).json(newModell);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Modell aktualisieren
const updateModell = async (req, res) => {
    try {
        const { name, beschreibung } = req.body;
        if (!name) return res.status(400).json({ error: 'Name ist erforderlich' });

        const updatedModell = await Modell.update(req.params.id, name, beschreibung);
        res.json(updatedModell);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Modell löschen
const deleteModell = async (req, res) => {
    try {
        const result = await Modell.delete(req.params.id);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { getAllModelle, getModellById, createModell, updateModell, deleteModell };
