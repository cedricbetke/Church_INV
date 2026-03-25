const fs = require('fs');
const path = require('path');
const Dokumente = require('../models/dokumenteModel');
const dokumenteUploadDir = path.resolve(__dirname, '..', '..', 'uploads', 'dokumente');

const getAllDokumente = async (req, res) => {
    try {
        const geraeteId = req.query.geraete_id ? Number(req.query.geraete_id) : null;
        const dokumente = await Dokumente.getAll(geraeteId);
        res.json(dokumente);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getDokumentById = async (req, res) => {
    try {
        const dokument = await Dokumente.getById(req.params.id);
        if (!dokument) {
            return res.status(404).json({ error: 'Dokument nicht gefunden' });
        }

        res.json(dokument);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const uploadDokument = async (req, res) => {
    try {
        const { dataUrl, fileName } = req.body;

        if (!dataUrl || typeof dataUrl !== 'string') {
            return res.status(400).json({ error: 'Dateidaten fehlen' });
        }

        const match = dataUrl.match(/^data:([a-zA-Z0-9/+.-]+);base64,(.+)$/);
        if (!match) {
            return res.status(400).json({ error: 'Ungueltiges Dateiformat' });
        }

        const mimeType = match[1];
        const base64Data = match[2];
        const extension = mimeType.split('/')[1] || 'bin';
        const safeBaseName = (fileName || 'dokument')
            .replace(/\.[^.]+$/, '')
            .replace(/[^a-zA-Z0-9_-]/g, '_');
        const finalFileName = `${Date.now()}_${safeBaseName}.${extension}`;
        fs.mkdirSync(dokumenteUploadDir, { recursive: true });
        fs.writeFileSync(path.join(dokumenteUploadDir, finalFileName), base64Data, 'base64');

        res.status(201).json({
            path: `/uploads/dokumente/${finalFileName}`,
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const createDokument = async (req, res) => {
    try {
        const { name, url, geraete_id } = req.body;
        if (!name || !url || !geraete_id) {
            return res.status(400).json({ error: 'Name, URL und Geraete-ID sind erforderlich' });
        }

        const newDokument = await Dokumente.create(name, url, geraete_id);
        res.status(201).json(newDokument);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const updateDokument = async (req, res) => {
    try {
        const { name, url, geraete_id } = req.body;
        if (!name || !url || !geraete_id) {
            return res.status(400).json({ error: 'Name, URL und Geraete-ID sind erforderlich' });
        }

        const updatedDokument = await Dokumente.update(req.params.id, name, url, geraete_id);
        res.json(updatedDokument);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const deleteDokument = async (req, res) => {
    try {
        const result = await Dokumente.delete(req.params.id);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { getAllDokumente, getDokumentById, uploadDokument, createDokument, updateDokument, deleteDokument };
