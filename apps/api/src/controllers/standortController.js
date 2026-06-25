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
        const { name } = req.body;
        if (!name) {
            return res.status(400).json({ error: 'Name ist erforderlich' });
        }

        const newStandort = await Standort.create(name);
        res.status(201).json(newStandort);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const updateStandort = async (req, res) => {
    try {
        const { name } = req.body;
        if (!name) {
            return res.status(400).json({ error: 'Name ist erforderlich' });
        }

        const updatedStandort = await Standort.update(req.params.id, name);
        res.json(updatedStandort);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const deleteStandort = async (req, res) => {
    try {
        const standort = await Standort.getById(req.params.id);
        if (!standort) return res.status(404).json({ error: 'Standort nicht gefunden' });

        const usageCount = await Standort.getUsageCount(req.params.id);
        if (usageCount > 0) {
            return res.status(409).json({
                error: 'Standort wird noch von Geraeten verwendet und kann nicht geloescht werden.',
                usageCount,
            });
        }

        const result = await Standort.delete(req.params.id);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const mergeStandort = async (req, res) => {
    try {
        const { targetId } = req.body;
        if (!targetId) {
            return res.status(400).json({ error: 'Ziel-Standort ist erforderlich' });
        }

        const result = await Standort.merge(req.params.id, targetId);
        res.json(result);
    } catch (error) {
        res.status(error.statusCode || 500).json({ error: error.message });
    }
};

module.exports = { getAllStandorte, getStandortById, createStandort, updateStandort, deleteStandort, mergeStandort };
