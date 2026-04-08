const fs = require('fs');
const path = require('path');
const Dokumente = require('../models/dokumenteModel');
const dokumenteUploadDir = path.resolve(__dirname, '..', '..', 'uploads', 'dokumente');
const DOCUMENT_UPLOAD_MAX_SIZE_BYTES = 10 * 1024 * 1024;

const allowedDocumentExtensions = new Set([
    'pdf',
    'doc',
    'docx',
    'txt',
    'xlsx',
    'xls',
    'png',
    'jpg',
    'jpeg',
]);

const allowedDocumentMimeTypes = new Map([
    ['application/pdf', 'pdf'],
    ['application/msword', 'doc'],
    ['application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'docx'],
    ['text/plain', 'txt'],
    ['application/vnd.ms-excel', 'xls'],
    ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'xlsx'],
    ['image/png', 'png'],
    ['image/jpeg', 'jpg'],
]);

const getFileExtension = (fileName = '') => {
    const match = fileName.toLowerCase().match(/\.([a-z0-9]+)$/);
    return match ? match[1] : '';
};

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

        const mimeType = match[1].toLowerCase();
        const base64Data = match[2];
        const fileExtension = getFileExtension(fileName);
        const mappedExtension = allowedDocumentMimeTypes.get(mimeType);
        const hasAllowedExtension = allowedDocumentExtensions.has(fileExtension);
        const isGenericMimeType = mimeType === 'application/octet-stream';
        const fileSizeBytes = Buffer.byteLength(base64Data, 'base64');

        if (!mappedExtension && !(isGenericMimeType && hasAllowedExtension)) {
            return res.status(400).json({ error: 'Dateityp nicht erlaubt. Erlaubt sind PDF, Word, Excel, TXT, PNG und JPG.' });
        }

        if (fileSizeBytes > DOCUMENT_UPLOAD_MAX_SIZE_BYTES) {
            return res.status(400).json({ error: 'Dokument ist zu gross. Maximal 10 MB erlaubt.' });
        }

        const extension = mappedExtension || fileExtension;
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
