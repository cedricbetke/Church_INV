const express = require('express');
const router = express.Router();
const herstellerController = require('../controllers/herstellerController');

/**
 * @swagger
 * tags:
 *   - name: Hersteller
 *     description: Endpoints zum Verwalten der Hersteller
 */

/**
 * @swagger
 * /api/hersteller:
 *   get:
 *     tags:
 *       - Hersteller
 *     description: Alle Hersteller abrufen
 *     responses:
 *       200:
 *         description: Erfolgreich alle Hersteller abgerufen
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
router.get('/', herstellerController.getAllHersteller);

/**
 * @swagger
 * /api/hersteller/{id}:
 *   get:
 *     tags:
 *       - Hersteller
 *     description: Hersteller mit einer bestimmten ID abrufen
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Die ID des Herstellers
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Hersteller erfolgreich abgerufen
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
 *         description: Hersteller mit dieser ID nicht gefunden
 */
router.get('/:id', herstellerController.getHerstellerById);

/**
 * @swagger
 * /api/hersteller:
 *   post:
 *     tags:
 *       - Hersteller
 *     description: Neuen Hersteller erstellen
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
 *         description: Hersteller erfolgreich erstellt
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
router.post('/', herstellerController.createHersteller);

/**
 * @swagger
 * /api/hersteller/{id}:
 *   put:
 *     tags:
 *       - Hersteller
 *     description: Hersteller mit einer bestimmten ID aktualisieren
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Die ID des Herstellers
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
 *         description: Hersteller erfolgreich aktualisiert
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
 *         description: Hersteller mit dieser ID nicht gefunden
 */
router.put('/:id', herstellerController.updateHersteller);

/**
 * @swagger
 * /api/hersteller/{id}:
 *   delete:
 *     tags:
 *       - Hersteller
 *     description: Hersteller mit einer bestimmten ID löschen
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Die ID des Herstellers
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Hersteller erfolgreich gelöscht
 *       404:
 *         description: Hersteller mit dieser ID nicht gefunden
 */
router.delete('/:id', herstellerController.deleteHersteller);

module.exports = router;
