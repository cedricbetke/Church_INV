const express = require('express');
const router = express.Router();
const herstellerController = require('../controllers/herstellerController');

/**
 * @swagger
 * /api/hersteller:
 *   get:
 *     tags: [Hersteller]
 *     summary: Alle Hersteller abrufen
 *     responses:
 *       200:
 *         description: Herstellerliste
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Hersteller'
 */
router.get('/', herstellerController.getAllHersteller);

/**
 * @swagger
 * /api/hersteller/{id}:
 *   get:
 *     tags: [Hersteller]
 *     summary: Einen Hersteller abrufen
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Hersteller gefunden
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Hersteller'
 *       404:
 *         description: Hersteller nicht gefunden
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/:id', herstellerController.getHerstellerById);

/**
 * @swagger
 * /api/hersteller:
 *   post:
 *     tags: [Hersteller]
 *     summary: Neuen Hersteller anlegen
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/HerstellerWritePayload'
 *     responses:
 *       201:
 *         description: Hersteller erfolgreich angelegt
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Hersteller'
 *       500:
 *         description: Interner Serverfehler
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/', herstellerController.createHersteller);

/**
 * @swagger
 * /api/hersteller/{id}:
 *   put:
 *     tags: [Hersteller]
 *     summary: Hersteller aktualisieren
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
 *             $ref: '#/components/schemas/HerstellerWritePayload'
 *     responses:
 *       200:
 *         description: Hersteller erfolgreich aktualisiert
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Hersteller'
 *       404:
 *         description: Hersteller nicht gefunden
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.put('/:id', herstellerController.updateHersteller);

/**
 * @swagger
 * /api/hersteller/{id}:
 *   delete:
 *     tags: [Hersteller]
 *     summary: Hersteller löschen
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Hersteller erfolgreich gelöscht
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessMessage'
 *       404:
 *         description: Hersteller nicht gefunden
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.delete('/:id', herstellerController.deleteHersteller);

module.exports = router;
