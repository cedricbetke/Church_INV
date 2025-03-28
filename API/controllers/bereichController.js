const Bereich = require('../models/bereichModel');

const getAllBereiche = async (req, res) => {
    try {
        const bereiche = await Bereich.getAll();
        res.json(bereiche);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getBereichById = async (req, res) => {
    try {
        const bereich = await Bereich.getById(req.params.id);
        if (!bereich) return res.status(404).json({ error: 'Bereich nicht gefunden' });
        res.json(bereich);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const createBereich = async (req, res) => {
    try {
        const { name } = req.body;
        if (!name) return res.status(400).json({ error: 'Name ist erforderlich' });

        const newBereich = await Bereich.create(name);
        res.status(201).json(newBereich);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const updateBereich = async (req, res) => {
    try {
        const { name } = req.body;
        if (!name) return res.status(400).json({ error: 'Name ist erforderlich' });

        const updatedBereich = await Bereich.update(req.params.id, name);
        res.json(updatedBereich);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const deleteBereich = async (req, res) => {
    try {
        const result = await Bereich.delete(req.params.id);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { getAllBereiche, getBereichById, createBereich, updateBereich, deleteBereich };
