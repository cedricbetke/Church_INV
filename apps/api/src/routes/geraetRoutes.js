const express = require('express');
const router = express.Router();
const geraetController = require('../controllers/geraetController');
const requireAdmin = require('../middleware/requireAdmin');

/**
 * @swagger
 * /api/geraet:
 *   get:
 *     tags: [Gerät]
 *     summary: Alle Geräte abrufen
 *     responses:
 *       200:
 *         description: Liste aller Geräte
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/DeviceListItem'
 *       500:
 *         description: Interner Serverfehler
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/', geraetController.getAllGeraete);

/**
 * @swagger
 * /api/geraet/max-id:
 *   get:
 *     tags: [Gerät]
 *     summary: Nächste freie Inventarnummer ermitteln
 *     responses:
 *       200:
 *         description: Nächste freie Inventarnummer
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 next_number:
 *                   type: integer
 *                   example: 42
 *       500:
 *         description: Interner Serverfehler
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/max-id', geraetController.getMaxId);

/**
 * @swagger
 * /api/geraet/upload-photo:
 *   post:
 *     tags: [Gerät]
 *     summary: Gerätefoto hochladen
 *     security:
 *       - AdminPassword: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UploadRequest'
 *     responses:
 *       201:
 *         description: Foto erfolgreich hochgeladen
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UploadResponse'
 *       400:
 *         description: Ungültige Bilddaten
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
router.post('/upload-photo', geraetController.uploadGeraetFoto);

/**
 * @swagger
 * /api/geraet/{id}/verlauf:
 *   get:
 *     tags: [Gerät]
 *     summary: Verlauf eines Geräts abrufen
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Verlaufseinträge zum Gerät
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/DeviceHistoryEntry'
 *       500:
 *         description: Interner Serverfehler
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/:id/verlauf', geraetController.getGeraetVerlauf);

/**
 * @swagger
 * /api/geraet/{id}:
 *   get:
 *     tags: [Gerät]
 *     summary: Ein Gerät anhand der Inventarnummer abrufen
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Gerät gefunden
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DeviceDetail'
 *       404:
 *         description: Gerät nicht gefunden
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
router.get('/:id', geraetController.getGeraetById);

/**
 * @swagger
 * /api/geraet:
 *   post:
 *     tags: [Gerät]
 *     summary: Neues Gerät anlegen
 *     security:
 *       - AdminPassword: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/DeviceWritePayload'
 *     responses:
 *       201:
 *         description: Gerät erfolgreich erstellt
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DeviceDetail'
 *       400:
 *         description: Pflichtfelder fehlen oder Payload ist ungültig
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
 *       409:
 *         description: Inventarnummer existiert bereits
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
router.post('/', requireAdmin, geraetController.createGeraet);

/**
 * @swagger
 * /api/geraet/{id}:
 *   put:
 *     tags: [Gerät]
 *     summary: Gerät aktualisieren
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
 *             $ref: '#/components/schemas/DeviceUpdatePayload'
 *     responses:
 *       200:
 *         description: Gerät erfolgreich aktualisiert
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DeviceDetail'
 *       400:
 *         description: Pflichtfelder fehlen oder Payload ist ungültig
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
 *         description: Gerät nicht gefunden
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
router.put('/:id', requireAdmin, geraetController.updateGeraet);

/**
 * @swagger
 * /api/geraet/{id}:
 *   delete:
 *     tags: [Gerät]
 *     summary: Gerät löschen
 *     security:
 *       - AdminPassword: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Gerät erfolgreich gelöscht
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessMessage'
 *       403:
 *         description: Admin-Berechtigung fehlt
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
router.delete('/:id', requireAdmin, geraetController.deleteGeraet);

module.exports = router;
