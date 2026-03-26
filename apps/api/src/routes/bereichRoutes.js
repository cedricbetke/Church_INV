const express = require('express');
const router = express.Router();
const bereichController = require('../controllers/bereichController');

/**
 * @swagger
 * /api/bereich:
 *   get:
 *     tags: [Bereich]
 *     summary: Alle Bereiche abrufen
 *     responses:
 *       200:
 *         description: Bereichsliste
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
 *                     example: Medientechnik
 */
router.get('/', bereichController.getAllBereiche);

/**
 * @swagger
 * /api/bereich/{id}:
 *   get:
 *     tags: [Bereich]
 *     summary: Einen Bereich abrufen
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Bereich gefunden
 *       404:
 *         description: Bereich nicht gefunden
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/:id', bereichController.getBereichById);

/**
 * @swagger
 * /api/bereich:
 *   post:
 *     tags: [Bereich]
 *     summary: Neuen Bereich anlegen
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
 *                 example: Handwerker
 *     responses:
 *       201:
 *         description: Bereich erfolgreich angelegt
 */
router.post('/', bereichController.createBereich);

/**
 * @swagger
 * /api/bereich/{id}:
 *   put:
 *     tags: [Bereich]
 *     summary: Bereich aktualisieren
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
 *                 example: Videoregie
 *     responses:
 *       200:
 *         description: Bereich erfolgreich aktualisiert
 *       404:
 *         description: Bereich nicht gefunden
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.put('/:id', bereichController.updateBereich);

/**
 * @swagger
 * /api/bereich/{id}:
 *   delete:
 *     tags: [Bereich]
 *     summary: Bereich löschen
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Bereich erfolgreich gelöscht
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessMessage'
 *       404:
 *         description: Bereich nicht gefunden
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.delete('/:id', bereichController.deleteBereich);

module.exports = router;
