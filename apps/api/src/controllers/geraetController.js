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
const getMaxId = async (req, res) => {
    try {
        const id = await Geraet.getMaxId();
        res.json(id);
    }catch (error) {
        console.error('Fehler beim Abrufen der Inventarnummer:', error);
        res.status(500).json({ error: error.message });
    }
};

const createGeraet = async (req, res) => {
    try {
        const {
            modell_id,
            einkaufspreis = null, // Optionales Feld, Standardwert null
            status_id,
            standort_id,
            bereich_id,
            verantwortlicher_id,
            kategorie_id,
            geraetefoto_url = null,  // Optionales Feld, Standardwert null
            kaufdatum = null,         // Optionales Feld, Standardwert null
            serien_nr = null,         // Optionales Feld, Standardwert null
            qrcode = null             // Optionales Feld, Standardwert null
        } = req.body;

        // Überprüfen, ob alle erforderlichen Felder vorhanden sind
        if (!modell_id || !status_id || !standort_id || !bereich_id || !verantwortlicher_id || !kategorie_id) {
            return res.status(400).json({ error: 'Alle Felder sind erforderlich' });
        }

        // Erstellung des neuen Geräts
        const newGeraet = await Geraet.create(
            status_id,          // Erster Parameter: status_id
            modell_id,          // Zweiter Parameter: modell_id
            bereich_id,         // Dritter Parameter: bereich_id
            kaufdatum,          // Vierter Parameter: kaufdatum
            einkaufspreis,      // Optional: einkaufspreis, falls nicht angegeben, explizit null
            serien_nr,          // Optional: serien_nr
            standort_id,        // Optional: standort_id
            verantwortlicher_id,// Optional: verantwortlicher_id
            kategorie_id,       // Optional: kategorie_id
            qrcode,             // Optional: qrcode
            geraetefoto_url     // Optional: geraetefoto_url
        );

        // Erfolgreiche Antwort mit dem neu erstellten Gerät
        res.status(201).json(newGeraet);
    } catch (error) {
        console.log(req.body)
        res.status(500).json({ error: error.message });
    }
};

const updateGeraet = async (req, res) => {
    try {
        const {
            modell_id,
            seriennummer = null,
            status_id,
            standort_id,
            bereich_id,
            verantwortlicher_id,
            kategorie_id,
            geraetefoto_url = null,
            kaufdatum = null,
            serien_nr = null,
            qrcode = null
        } = req.body;

        // Überprüfen, ob alle erforderlichen Felder vorhanden sind
        if (!modell_id || !status_id || !standort_id || !bereich_id || !verantwortlicher_id || !kategorie_id) {
            return res.status(400).json({ error: 'Alle Felder sind erforderlich' });
        }

        // Aktualisierung des Geräts
        const updatedGeraet = await Geraet.update(
            req.params.id,
            modell_id,
            seriennummer,
            status_id,
            standort_id,
            bereich_id,
            verantwortlicher_id,
            kategorie_id,
            geraetefoto_url,
            kaufdatum,
            serien_nr,
            qrcode
        );

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

module.exports = { getAllGeraete, getGeraetById, createGeraet, updateGeraet, deleteGeraet, getMaxId };
