const Hersteller = require('../models/herstellerModel');

const getAllHersteller = async (req, res) => {
    try {
        const hersteller = await Hersteller.getAll();
        res.json(hersteller);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getHerstellerById = async (req, res) => {
    try {
        const hersteller = await Hersteller.getById(req.params.id);
        if (!hersteller) return res.status(404).json({ error: 'Hersteller nicht gefunden' });
        res.json(hersteller);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const createHersteller = async (req, res) => {
    try {
        const { name } = req.body;
        if (!name) return res.status(400).json({ error: 'Name ist erforderlich' });

        const newHersteller = await Hersteller.create(name);
        res.status(201).json(newHersteller);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const updateHersteller = async (req, res) => {
    try {
        const { name } = req.body;
        if (!name) return res.status(400).json({ error: 'Name ist erforderlich' });

        const updatedHersteller = await Hersteller.update(req.params.id, name);
        res.json(updatedHersteller);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const deleteHersteller = async (req, res) => {
    try {
        const result = await Hersteller.delete(req.params.id);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { getAllHersteller, getHerstellerById, createHersteller, updateHersteller, deleteHersteller };
