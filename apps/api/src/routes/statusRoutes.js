const express = require('express');
const router = express.Router();
const statusController = require('../controllers/statusController');

/**
 * @swagger
 * /api/status:
 *   get:
 *     tags: [Status]
 *     summary: Alle Status abrufen
 *     responses:
 *       200:
 *         description: Statusliste
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     example: 1
 *                   name:
 *                     type: string
 *                     example: Verfügbar
 */
router.get('/', statusController.getAllStatus);

/**
 * @swagger
 * /api/status/{id}:
 *   get:
 *     tags: [Status]
 *     summary: Einen Status abrufen
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Status gefunden
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 name:
 *                   type: string
 *       404:
 *         description: Status nicht gefunden
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/:id', statusController.getStatusById);

/**
 * @swagger
 * /api/status:
 *   post:
 *     tags: [Status]
 *     summary: Neuen Status anlegen
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name:
 *                 type: string
 *                 example: Defekt
 *     responses:
 *       201:
 *         description: Status erfolgreich angelegt
 *       500:
 *         description: Interner Serverfehler
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/', statusController.createStatus);

/**
 * @swagger
 * /api/status/{id}:
 *   put:
 *     tags: [Status]
 *     summary: Status aktualisieren
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
 *             type: object
 *             required: [name]
 *             properties:
 *               name:
 *                 type: string
 *                 example: Reserviert
 *     responses:
 *       200:
 *         description: Status erfolgreich aktualisiert
 *       404:
 *         description: Status nicht gefunden
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.put('/:id', statusController.updateStatus);

/**
 * @swagger
 * /api/status/{id}:
 *   delete:
 *     tags: [Status]
 *     summary: Status löschen
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Status erfolgreich gelöscht
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessMessage'
 *       404:
 *         description: Status nicht gefunden
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.delete('/:id', statusController.deleteStatus);

module.exports = router;
