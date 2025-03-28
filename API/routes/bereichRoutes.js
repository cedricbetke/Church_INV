const express = require('express');
const router = express.Router();
const bereichController = require('../controllers/bereichController');

/**
 * @swagger
 * tags:
 *   - name: Bereich
 *     description: Endpoints zum Verwalten der Bereiche
 */

/**
 * @swagger
 * /api/bereich:
 *   get:
 *     tags:
 *       - Bereich
 *     description: Alle Bereiche abrufen
 *     responses:
 *       200:
 *         description: Erfolgreich alle Bereiche abgerufen
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   name:
 *                     type: string
 */
router.get('/', bereichController.getAllBereiche);

/**
 * @swagger
 * /api/bereich/{id}:
 *   get:
 *     tags:
 *       - Bereich
 *     description: Bereich mit einer bestimmten ID abrufen
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Die ID des Bereichs
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Bereich erfolgreich abgerufen
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
 *         description: Bereich mit dieser ID nicht gefunden
 */
router.get('/:id', bereichController.getBereichById);

/**
 * @swagger
 * /api/bereich:
 *   post:
 *     tags:
 *       - Bereich
 *     description: Neuen Bereich erstellen
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *     responses:
 *       201:
 *         description: Bereich erfolgreich erstellt
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 name:
 *                   type: string
 */
router.post('/', bereichController.createBereich);

/**
 * @swagger
 * /api/bereich/{id}:
 *   put:
 *     tags:
 *       - Bereich
 *     description: Bereich mit einer bestimmten ID aktualisieren
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Die ID des Bereichs
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *     responses:
 *       200:
 *         description: Bereich erfolgreich aktualisiert
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
 *         description: Bereich mit dieser ID nicht gefunden
 */
router.put('/:id', bereichController.updateBereich);

/**
 * @swagger
 * /api/bereich/{id}:
 *   delete:
 *     tags:
 *       - Bereich
 *     description: Bereich mit einer bestimmten ID löschen
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Die ID des Bereichs
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Bereich erfolgreich gelöscht
 *       404:
 *         description: Bereich mit dieser ID nicht gefunden
 */
router.delete('/:id', bereichController.deleteBereich);

module.exports = router;
