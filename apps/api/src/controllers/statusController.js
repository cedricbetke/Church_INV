const Status = require('../models/statusModel');

const getAllStatus = async (req, res) => {
    try {
        const statusList = await Status.getAll();
        res.json(statusList);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getStatusById = async (req, res) => {
    try {
        const status = await Status.getById(req.params.id);
        if (!status) return res.status(404).json({ error: 'Status nicht gefunden' });
        res.json(status);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const createStatus = async (req, res) => {
    try {
        const { name } = req.body;
        if (!name) {
            return res.status(400).json({ error: 'Name ist erforderlich' });
        }

        const newStatus = await Status.create(name);
        res.status(201).json(newStatus);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const updateStatus = async (req, res) => {
    try {
        const { name } = req.body;
        if (!name) {
            return res.status(400).json({ error: 'Name ist erforderlich' });
        }

        const updatedStatus = await Status.update(req.params.id, name);
        res.json(updatedStatus);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const deleteStatus = async (req, res) => {
    try {
        const status = await Status.getById(req.params.id);
        if (!status) return res.status(404).json({ error: 'Status nicht gefunden' });

        const usageCount = await Status.getUsageCount(req.params.id);
        if (usageCount > 0) {
            return res.status(409).json({
                error: 'Status wird noch von Geraeten verwendet und kann nicht geloescht werden.',
                usageCount,
            });
        }

        const result = await Status.delete(req.params.id);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const mergeStatus = async (req, res) => {
    try {
        const { targetId } = req.body;
        if (!targetId) return res.status(400).json({ error: 'Ziel-Status ist erforderlich' });
        res.json(await Status.merge(req.params.id, targetId));
    } catch (error) {
        res.status(error.statusCode || 500).json({ error: error.message });
    }
};

module.exports = { getAllStatus, getStatusById, createStatus, updateStatus, deleteStatus, mergeStatus };
