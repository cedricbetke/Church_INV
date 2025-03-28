const Standort = require('../models/standortModel');

const getAllStandorte = async (req, res) => {
    try {
        const standorte = await Standort.getAll();
        res.json(standorte);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getStandortById = async (req, res) => {
    try {
        const standort = await Standort.getById(req.params.id);
        if (!standort) return res.status(404).json({ error: 'Standort nicht gefunden' });
        res.json(standort);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const createStandort = async (req, res) => {
    try {
        const { name, adresse } = req.body;
        if (!name || !adresse) {
            return res.status(400).json({ error: 'Name und Adresse sind erforderlich' });
        }

        const newStandort = await Standort.create(name, adresse);
        res.status(201).json(newStandort);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const updateStandort = async (req, res) => {
    try {
        const { name, adresse } = req.body;
        if (!name || !adresse) {
            return res.status(400).json({ error: 'Name und Adresse sind erforderlich' });
        }

        const updatedStandort = await Standort.update(req.params.id, name, adresse);
        res.json(updatedStandort);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const deleteStandort = async (req, res) => {
    try {
        const result = await Standort.delete(req.params.id);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { getAllStandorte, getStandortById, createStandort, updateStandort, deleteStandort };
