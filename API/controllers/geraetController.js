const Geraet = require('../models/geratModel');

const getAllGeraete = async (req, res) => {
    try {
        const geraete = await Geraet.getAll();
        res.json(geraete);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getGeraetById = async (req, res) => {
    try {
        const geraet = await Geraet.getById(req.params.id);
        if (!geraet) return res.status(404).json({ error: 'Gerät nicht gefunden' });
        res.json(geraet);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const createGeraet = async (req, res) => {
    try {
        const { name, seriennummer, status_id, standort_id, objekttyp_id } = req.body;
        if (!name || !seriennummer || !status_id || !standort_id || !objekttyp_id) {
            return res.status(400).json({ error: 'Alle Felder sind erforderlich' });
        }

        const newGeraet = await Geraet.create(name, seriennummer, status_id, standort_id, objekttyp_id);
        res.status(201).json(newGeraet);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const updateGeraet = async (req, res) => {
    try {
        const { name, seriennummer, status_id, standort_id, objekttyp_id } = req.body;
        if (!name || !seriennummer || !status_id || !standort_id || !objekttyp_id) {
            return res.status(400).json({ error: 'Alle Felder sind erforderlich' });
        }

        const updatedGeraet = await Geraet.update(req.params.id, name, seriennummer, status_id, standort_id, objekttyp_id);
        res.json(updatedGeraet);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const deleteGeraet = async (req, res) => {
    try {
        const result = await Geraet.delete(req.params.id);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { getAllGeraete, getGeraetById, createGeraet, updateGeraet, deleteGeraet };
