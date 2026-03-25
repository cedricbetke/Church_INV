const fs = require('fs');
const path = require('path');
const Geraet = require('../models/geratModel');
const GeraetVerlauf = require('../models/geraetVerlaufModel');
const geraeteUploadDir = path.resolve(__dirname, '..', '..', 'uploads', 'geraete');

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

const getGeraetVerlauf = async (req, res) => {
    try {
        const verlauf = await GeraetVerlauf.getAllByGeraetId(req.params.id);
        res.json(verlauf);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const uploadGeraetFoto = async (req, res) => {
    try {
        const { dataUrl, fileName } = req.body;

        if (!dataUrl || typeof dataUrl !== 'string') {
            return res.status(400).json({ error: 'Bilddaten fehlen' });
        }

        const match = dataUrl.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/);
        if (!match) {
            return res.status(400).json({ error: 'Ungueltiges Bildformat' });
        }

        const mimeType = match[1];
        const base64Data = match[2];
        const extension = mimeType.split('/')[1] || 'jpg';
        const safeBaseName = (fileName || 'geraetefoto')
            .replace(/\.[^.]+$/, '')
            .replace(/[^a-zA-Z0-9_-]/g, '_');
        const finalFileName = `${Date.now()}_${safeBaseName}.${extension}`;
        fs.mkdirSync(geraeteUploadDir, { recursive: true });
        fs.writeFileSync(path.join(geraeteUploadDir, finalFileName), base64Data, 'base64');

        res.status(201).json({
            path: `/uploads/geraete/${finalFileName}`,
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const createGeraet = async (req, res) => {
    try {
        const {
            inv_nr,
            modell_id,
            einkaufspreis = null, // Optionales Feld, Standardwert null
            status_id,
            standort_id,
            bereich_id,
            verantwortlicher_id,
            kategorie_id,
            geraetefoto_url = null,  // Optionales Feld, Standardwert null
            kaufdatum = null,         // Optionales Feld, Standardwert null
            serien_nr = null          // Optionales Feld, Standardwert null
        } = req.body;

        // Überprüfen, ob alle erforderlichen Felder vorhanden sind
        if (!inv_nr || !modell_id || !status_id || !bereich_id) {
            return res.status(400).json({ error: 'Alle Felder sind erforderlich' });
        }

        if (!Number.isInteger(Number(inv_nr)) || Number(inv_nr) <= 0) {
            return res.status(400).json({ error: 'Inventarnummer muss eine positive ganze Zahl sein' });
        }

        // Erstellung des neuen Geräts
        const newGeraet = await Geraet.create(
            inv_nr,
            status_id,          // Erster Parameter: status_id
            modell_id,          // Zweiter Parameter: modell_id
            bereich_id,         // Dritter Parameter: bereich_id
            kaufdatum,          // Vierter Parameter: kaufdatum
            einkaufspreis,      // Optional: einkaufspreis, falls nicht angegeben, explizit null
            serien_nr,          // Optional: serien_nr
            standort_id,        // Optional: standort_id
            verantwortlicher_id,// Optional: verantwortlicher_id
            kategorie_id,       // Optional: kategorie_id
            geraetefoto_url     // Optional: geraetefoto_url
        );

        // Erfolgreiche Antwort mit dem neu erstellten Gerät
        await GeraetVerlauf.logCreate(inv_nr);
        res.status(201).json(newGeraet);
    } catch (error) {
        console.log(req.body)
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ error: 'Die Inventarnummer ist bereits vergeben' });
        }
        res.status(500).json({ error: error.message });
    }
};

const updateGeraet = async (req, res) => {
    try {
        const beforeSnapshot = await GeraetVerlauf.getGeraetSnapshot(req.params.id);
        if (!beforeSnapshot) {
            return res.status(404).json({ error: 'Geraet nicht gefunden' });
        }

        const {
            modell_id,
            seriennummer = null,
            status_id,
            standort_id,
            bereich_id,
            verantwortlicher_id,
            kategorie_id,
            einkaufspreis = null,
            geraetefoto_url = null,
            kaufdatum = null,
            serien_nr = null
        } = req.body;

        // Überprüfen, ob alle erforderlichen Felder vorhanden sind
        if (!modell_id || !status_id || !bereich_id) {
            return res.status(400).json({ error: 'Alle Felder sind erforderlich' });
        }

        // Aktualisierung des Geräts
        const updatedGeraet = await Geraet.update(
            req.params.id,
            status_id,
            modell_id,
            bereich_id,
            kaufdatum,
            einkaufspreis,
            serien_nr ?? seriennummer,
            standort_id,
            verantwortlicher_id,
            kategorie_id,
            geraetefoto_url
        );

        const afterSnapshot = await GeraetVerlauf.getGeraetSnapshot(req.params.id);
        if (afterSnapshot) {
            await GeraetVerlauf.logUpdateChanges(Number(req.params.id), beforeSnapshot, afterSnapshot);
        }

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

module.exports = { getAllGeraete, getGeraetById, createGeraet, updateGeraet, deleteGeraet, getMaxId, uploadGeraetFoto, getGeraetVerlauf };
