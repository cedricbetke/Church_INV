const express = require('express');
const router = express.Router();
const masterdataUsageController = require('../controllers/masterdataUsageController');

router.get('/', masterdataUsageController.getMasterdataUsage);

module.exports = router;
