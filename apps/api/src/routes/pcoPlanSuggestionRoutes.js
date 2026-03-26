const express = require('express');
const router = express.Router();
const pcoPlanSuggestionController = require('../controllers/pcoPlanSuggestionController');

/**
 * @swagger
 * /api/pco-plan-suggestion:
 *   get:
 *     tags: [PCO]
 *     summary: PCO-Plaene als Buchungsvorschlaege abrufen
 *     responses:
 *       200:
 *         description: Liste kommender PCO-Planvorschlaege
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/PcoPlanSuggestion'
 *       500:
 *         description: Interner Serverfehler
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/', pcoPlanSuggestionController.getAllSuggestions);

module.exports = router;
