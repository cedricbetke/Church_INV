const express = require('express');
const router = express.Router();
const inventarController = require('../controllers/inventarController');

/**
 * @swagger
 * tags:
 *   - name: Inventory
 *     description: Endpoints zum Verwalten des Inventory
 *
 */

/**
 * Neues Inventargerät inkl. Standort und Zuweisung anlegen (transaktional)
 */
router.post('/voll', inventarController.createFullInventory);

module.exports = router;
