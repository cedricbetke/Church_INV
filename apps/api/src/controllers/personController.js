const Person = require('../models/personModel');

const getAllPersonen = async (req, res) => {
    try {
        const personen = await Person.getAll();
        res.json(personen);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getPersonById = async (req, res) => {
    try {
        const person = await Person.getById(req.params.id);
        if (!person) return res.status(404).json({ error: 'Person nicht gefunden' });
        res.json(person);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const createPerson = async (req, res) => {
    try {
        const { vorname, nachname } = req.body;
        if (!vorname || !nachname) {
            return res.status(400).json({ error: 'Vorname und Nachname sind erforderlich' });
        }

        const newPerson = await Person.create(vorname, nachname);
        res.status(201).json(newPerson);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const updatePerson = async (req, res) => {
    try {
        const { vorname, nachname } = req.body;
        if (!vorname || !nachname) {
            return res.status(400).json({ error: 'Vorname und Nachname sind erforderlich' });
        }

        const updatedPerson = await Person.update(req.params.id, vorname, nachname);
        res.json(updatedPerson);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const deletePerson = async (req, res) => {
    try {
        const person = await Person.getById(req.params.id);
        if (!person) return res.status(404).json({ error: 'Person nicht gefunden' });

        const usageCount = await Person.getUsageCount(req.params.id);
        if (usageCount > 0) {
            return res.status(409).json({
                error: 'Person wird noch als Verantwortlicher verwendet und kann nicht geloescht werden.',
                usageCount,
            });
        }

        const result = await Person.delete(req.params.id);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const mergePerson = async (req, res) => {
    try {
        const { targetId } = req.body;
        if (!targetId) return res.status(400).json({ error: 'Ziel-Person ist erforderlich' });
        res.json(await Person.merge(req.params.id, targetId));
    } catch (error) {
        res.status(error.statusCode || 500).json({ error: error.message });
    }
};

module.exports = { getAllPersonen, getPersonById, createPerson, updatePerson, deletePerson, mergePerson };
