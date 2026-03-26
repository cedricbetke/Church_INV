const express = require('express');
const router = express.Router();
const dokumenteController = require('../controllers/dokumenteController');
const requireAdmin = require('../middleware/requireAdmin');

/**
 * @swagger
 * /api/dokumente:
 *   get:
 *     tags: [Dokumente]
 *     summary: Dokumente abrufen
 *     parameters:
 *       - in: query
 *         name: geraete_id
 *         required: false
 *         schema:
 *           type: integer
 *         description: Optional auf ein Gerät filtern
 *     responses:
 *       200:
 *         description: Dokumente erfolgreich geladen
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Dokument'
 *       500:
 *         description: Interner Serverfehler
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/', dokumenteController.getAllDokumente);

/**
 * @swagger
 * /api/dokumente/upload:
 *   post:
 *     tags: [Dokumente]
 *     summary: Dokumentdatei hochladen
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
 *         description: Datei erfolgreich hochgeladen
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UploadResponse'
 *       400:
 *         description: Ungültige Dateidaten
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
 *       500:
 *         description: Interner Serverfehler
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/upload', requireAdmin, dokumenteController.uploadDokument);

/**
 * @swagger
 * /api/dokumente/{id}:
 *   get:
 *     tags: [Dokumente]
 *     summary: Einzelnes Dokument abrufen
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Dokument gefunden
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Dokument'
 *       404:
 *         description: Dokument nicht gefunden
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
router.get('/:id', dokumenteController.getDokumentById);

/**
 * @swagger
 * /api/dokumente:
 *   post:
 *     tags: [Dokumente]
 *     summary: Dokumenteintrag anlegen
 *     security:
 *       - AdminPassword: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/DokumentWritePayload'
 *     responses:
 *       201:
 *         description: Dokument erfolgreich angelegt
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Dokument'
 *       400:
 *         description: Pflichtfelder fehlen
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
 *       500:
 *         description: Interner Serverfehler
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/', requireAdmin, dokumenteController.createDokument);

/**
 * @swagger
 * /api/dokumente/{id}:
 *   put:
 *     tags: [Dokumente]
 *     summary: Dokumenteintrag aktualisieren
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
 *             $ref: '#/components/schemas/DokumentWritePayload'
 *     responses:
 *       200:
 *         description: Dokument erfolgreich aktualisiert
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Dokument'
 *       400:
 *         description: Pflichtfelder fehlen
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
 *       500:
 *         description: Interner Serverfehler
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.put('/:id', requireAdmin, dokumenteController.updateDokument);

/**
 * @swagger
 * /api/dokumente/{id}:
 *   delete:
 *     tags: [Dokumente]
 *     summary: Dokument löschen
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
 *         description: Dokument erfolgreich gelöscht
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
router.delete('/:id', requireAdmin, dokumenteController.deleteDokument);

module.exports = router;
