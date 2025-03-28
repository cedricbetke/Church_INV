const Dokumente = require('../models/dokumenteModel'); // Import des Dokumente Modells

const getAllDokumente = async (req, res) => {
    try {
        const dokumente = await Dokumente.getAll();
        res.json(dokumente); // Rückgabe aller Dokumente
    } catch (error) {
        res.status(500).json({ error: error.message }); // Fehlerbehandlung bei Datenbankfehlern
    }
};

const getDokumentById = async (req, res) => {
    try {
        const dokument = await Dokumente.getById(req.params.id); // Suche nach Dokument anhand der ID
        if (!dokument) return res.status(404).json({ error: 'Dokument nicht gefunden' }); // Fehler, falls Dokument nicht existiert
        res.json(dokument); // Rückgabe des gefundenen Dokuments
    } catch (error) {
        res.status(500).json({ error: error.message }); // Fehlerbehandlung bei Datenbankfehlern
    }
};

const createDokument = async (req, res) => {
    try {
        const { name, url, geraete_id } = req.body; // Extrahieren der Parameter aus dem Request Body
        if (!name || !url || !geraete_id) return res.status(400).json({ error: 'Name, URL und Geräte-ID sind erforderlich' }); // Validierung der Eingabedaten

        const newDokument = await Dokumente.create(name, url, geraete_id); // Erstellen des neuen Dokuments
        res.status(201).json(newDokument); // Rückgabe des erstellten Dokuments
    } catch (error) {
        res.status(500).json({ error: error.message }); // Fehlerbehandlung bei Datenbankfehlern
    }
};

const updateDokument = async (req, res) => {
    try {
        const { name, url, geraete_id } = req.body; // Extrahieren der Parameter aus dem Request Body
        if (!name || !url || !geraete_id) return res.status(400).json({ error: 'Name, URL und Geräte-ID sind erforderlich' }); // Validierung der Eingabedaten

        const updatedDokument = await Dokumente.update(req.params.id, name, url, geraete_id); // Aktualisieren des Dokuments anhand der ID
        if (!updatedDokument) return res.status(404).json({ error: 'Dokument nicht gefunden' }); // Fehler, falls Dokument nicht existiert
        res.json(updatedDokument); // Rückgabe des aktualisierten Dokuments
    } catch (error) {
        res.status(500).json({ error: error.message }); // Fehlerbehandlung bei Datenbankfehlern
    }
};

const deleteDokument = async (req, res) => {
    try {
        const result = await Dokumente.delete(req.params.id); // Löschen des Dokuments anhand der ID
        if (!result) return res.status(404).json({ error: 'Dokument nicht gefunden' }); // Fehler, falls Dokument nicht existiert
        res.json(result); // Bestätigung der Löschung
    } catch (error) {
        res.status(500).json({ error: error.message }); // Fehlerbehandlung bei Datenbankfehlern
    }
};

module.exports = { getAllDokumente, getDokumentById, createDokument, updateDokument, deleteDokument };
