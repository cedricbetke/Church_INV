const express = require('express');
const router = express.Router();
const standortController = require('../controllers/standortController');

/**
 * @swagger
 * /api/standort:
 *   get:
 *     tags: [Standort]
 *     summary: Alle Standorte abrufen
 *     responses:
 *       200:
 *         description: Standortliste
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
 *                     example: Studio
 */
router.get('/', standortController.getAllStandorte);

/**
 * @swagger
 * /api/standort/{id}:
 *   get:
 *     tags: [Standort]
 *     summary: Einen Standort abrufen
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Standort gefunden
 *       404:
 *         description: Standort nicht gefunden
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/:id', standortController.getStandortById);

/**
 * @swagger
 * /api/standort:
 *   post:
 *     tags: [Standort]
 *     summary: Neuen Standort anlegen
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
 *                 example: Regie
 *     responses:
 *       201:
 *         description: Standort erfolgreich angelegt
 */
router.post('/', standortController.createStandort);

/**
 * @swagger
 * /api/standort/{id}:
 *   put:
 *     tags: [Standort]
 *     summary: Standort aktualisieren
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
 *                 example: Gemeindesaal
 *     responses:
 *       200:
 *         description: Standort erfolgreich aktualisiert
 *       404:
 *         description: Standort nicht gefunden
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.put('/:id', standortController.updateStandort);

/**
 * @swagger
 * /api/standort/{id}:
 *   delete:
 *     tags: [Standort]
 *     summary: Standort löschen
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Standort erfolgreich gelöscht
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessMessage'
 *       404:
 *         description: Standort nicht gefunden
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.delete('/:id', standortController.deleteStandort);

module.exports = router;
