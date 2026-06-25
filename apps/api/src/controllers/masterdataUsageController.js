const MasterdataUsage = require('../models/masterdataUsageModel');

const getMasterdataUsage = async (req, res) => {
    try {
        const usage = await MasterdataUsage.getAll();
        res.json(usage);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { getMasterdataUsage };
