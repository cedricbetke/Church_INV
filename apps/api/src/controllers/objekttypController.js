const Objekttyp = require('../models/objekttypModel');

const getAllObjekttypen = async (req, res) => {
    try {
        const objekttypen = await Objekttyp.getAll();
        res.json(objekttypen);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getObjekttypById = async (req, res) => {
    try {
        const objekttyp = await Objekttyp.getById(req.params.id);
        if (!objekttyp) return res.status(404).json({ error: 'Objekttyp nicht gefunden' });
        res.json(objekttyp);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const createObjekttyp = async (req, res) => {
    try {
        const { name, beschreibung } = req.body;
        if (!name) return res.status(400).json({ error: 'Name ist erforderlich' });

        const newObjekttyp = await Objekttyp.create(name, beschreibung);
        res.status(201).json(newObjekttyp);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const updateObjekttyp = async (req, res) => {
    try {
        const { name, beschreibung } = req.body;
        if (!name) return res.status(400).json({ error: 'Name ist erforderlich' });

        const updatedObjekttyp = await Objekttyp.update(req.params.id, name, beschreibung);
        res.json(updatedObjekttyp);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const deleteObjekttyp = async (req, res) => {
    try {
        const result = await Objekttyp.delete(req.params.id);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { getAllObjekttypen, getObjekttypById, createObjekttyp, updateObjekttyp, deleteObjekttyp };
