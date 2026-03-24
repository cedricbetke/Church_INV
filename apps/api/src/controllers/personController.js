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
        const { vorname, nachname, email } = req.body;
        if (!vorname || !nachname || !email) {
            return res.status(400).json({ error: 'Vorname, Nachname und E-Mail sind erforderlich' });
        }

        const newPerson = await Person.create(vorname, nachname, email);
        res.status(201).json(newPerson);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const updatePerson = async (req, res) => {
    try {
        const { vorname, nachname, email } = req.body;
        if (!vorname || !nachname || !email) {
            return res.status(400).json({ error: 'Vorname, Nachname und E-Mail sind erforderlich' });
        }

        const updatedPerson = await Person.update(req.params.id, vorname, nachname, email);
        res.json(updatedPerson);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const deletePerson = async (req, res) => {
    try {
        const result = await Person.delete(req.params.id);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { getAllPersonen, getPersonById, createPerson, updatePerson, deletePerson };
