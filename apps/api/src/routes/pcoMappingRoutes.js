const express = require('express');
const router = express.Router();
const pcoMappingController = require('../controllers/pcoMappingController');
const requireAdmin = require('../middleware/requireAdmin');

/**
 * @swagger
 * /api/pco-mapping:
 *   get:
 *     tags: [PCO]
 *     summary: Alle PCO-Service-Type-Mappings abrufen
 *     responses:
 *       200:
 *         description: Liste aller PCO-Mappings
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/PcoServiceTypeMapping'
 *       500:
 *         description: Interner Serverfehler
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/', pcoMappingController.getAllMappings);

/**
 * @swagger
 * /api/pco-mapping/{id}:
 *   put:
 *     tags: [PCO]
 *     summary: Geraetezuordnung und Aktiv-Status fuer ein PCO-Mapping aktualisieren
 *     security:
 *       - AdminPassword: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PcoServiceTypeMappingUpdatePayload'
 *     responses:
 *       200:
 *         description: Mapping erfolgreich aktualisiert
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PcoServiceTypeMapping'
 *       400:
 *         description: Ungueltige Eingabedaten
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Admin-Berechtigung fehlt
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Mapping nicht gefunden
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Interner Serverfehler
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.put('/:id', requireAdmin, pcoMappingController.updateMappingAssignments);

module.exports = router;
