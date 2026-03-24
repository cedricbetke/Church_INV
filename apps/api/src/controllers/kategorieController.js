const Kategorie = require('../models/kategorieModel');

const getAllKategorie = async (req, res) => {
    try {
        const kategorie = await Kategorie.getAll();
        res.json(kategorie);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getKategorieById = async (req, res) => {
    try {
        const kategorie = await Kategorie.getById(req.params.id);
        if (!kategorie) return res.status(404).json({ error: 'Kategorie nicht gefunden' });
        res.json(kategorie);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const createKategorie = async (req, res) => {
    try {
        const { name, bereich_id } = req.body;
        if (!name || !bereich_id) return res.status(400).json({ error: 'Name und Bereichs-ID sind erforderlich' });

        const newKategorie = await Kategorie.create(name, bereich_id);
        res.status(201).json(newKategorie);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const updateKategorie = async (req, res) => {
    try {
        const { name, bereich_id } = req.body;
        if (!name || !bereich_id) return res.status(400).json({ error: 'Name und Bereichs-ID sind erforderlich' });

        const updatedKategorie = await Kategorie.update(req.params.id, name, bereich_id);
        res.json(updatedKategorie);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const deleteKategorie = async (req, res) => {
    try {
        const result = await Kategorie.delete(req.params.id);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { getAllKategorie, getKategorieById, createKategorie, updateKategorie, deleteKategorie };
