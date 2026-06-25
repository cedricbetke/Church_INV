const express = require('express');
const router = express.Router();
const masterdataUsageController = require('../controllers/masterdataUsageController');

/**
 * @swagger
 * /api/masterdata/usage:
 *   get:
 *     tags: [Stammdaten]
 *     summary: Nutzungszahlen fuer Stammdaten abrufen
 *     description: Liefert pro Stammdaten-Typ eine Map von ID zu Nutzungsanzahl. Eintraege mit einer Anzahl groesser 0 gelten in der Admin-Maske als genutzt und koennen nicht geloescht werden.
 *     responses:
 *       200:
 *         description: Nutzungszahlen nach Stammdaten-Typ
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 brands:
 *                   type: object
 *                   additionalProperties:
 *                     type: integer
 *                   example:
 *                     "1": 3
 *                 objectTypes:
 *                   type: object
 *                   additionalProperties:
 *                     type: integer
 *                   example:
 *                     "2": 5
 *                 models:
 *                   type: object
 *                   additionalProperties:
 *                     type: integer
 *                   example:
 *                     "7": 12
 *                 states:
 *                   type: object
 *                   additionalProperties:
 *                     type: integer
 *                   example:
 *                     "1": 42
 *                 bereiche:
 *                   type: object
 *                   additionalProperties:
 *                     type: integer
 *                   example:
 *                     "3": 18
 *                 standorte:
 *                   type: object
 *                   additionalProperties:
 *                     type: integer
 *                   example:
 *                     "4": 9
 *                 kategorien:
 *                   type: object
 *                   additionalProperties:
 *                     type: integer
 *                   example:
 *                     "6": 4
 *                 personen:
 *                   type: object
 *                   additionalProperties:
 *                     type: integer
 *                   example:
 *                     "5": 2
 *       500:
 *         description: Fehler beim Ermitteln der Nutzungszahlen
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/', masterdataUsageController.getMasterdataUsage);

module.exports = router;
