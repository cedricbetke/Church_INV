const express = require('express');
const router = express.Router();
const standortController = require('../controllers/standortController');

/**
 * @swagger
 * tags:
 *   - name: Standort
 *     description: Endpoints zur Verwaltung von Standorten
 */

/**
 * @swagger
 * /api/standort:
 *   get:
 *     tags:
 *       - Standort
 *     description: Alle Standorte abrufen
 *     responses:
 *       200:
 *         description: Erfolgreich alle Standorte abgerufen
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
 *                   adresse:
 *                     type: string
 */
router.get('/', standortController.getAllStandorte);

/**
 * @swagger
 * /api/standort/{id}:
 *   get:
 *     tags:
 *       - Standort
 *     description: Standort mit einer bestimmten ID abrufen
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Die ID des Standorts
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Standort erfolgreich abgerufen
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 name:
 *                   type: string
 *                 adresse:
 *                   type: string
 *       404:
 *         description: Standort mit dieser ID nicht gefunden
 */
router.get('/:id', standortController.getStandortById);

/**
 * @swagger
 * /api/standort:
 *   post:
 *     tags:
 *       - Standort
 *     description: Neuen Standort erstellen
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - adresse
 *             properties:
 *               name:
 *                 type: string
 *               adresse:
 *                 type: string
 *     responses:
 *       201:
 *         description: Standort erfolgreich erstellt
 */
router.post('/', standortController.createStandort);

/**
 * @swagger
 * /api/standort/{id}:
 *   put:
 *     tags:
 *       - Standort
 *     description: Standort mit einer bestimmten ID aktualisieren
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Die ID des Standorts
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
 *               - adresse
 *             properties:
 *               name:
 *                 type: string
 *               adresse:
 *                 type: string
 *     responses:
 *       200:
 *         description: Standort erfolgreich aktualisiert
 *       404:
 *         description: Standort nicht gefunden
 */
router.put('/:id', standortController.updateStandort);

/**
 * @swagger
 * /api/standort/{id}:
 *   delete:
 *     tags:
 *       - Standort
 *     description: Standort mit einer bestimmten ID löschen
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Die ID des Standorts
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Standort erfolgreich gelöscht
 *       404:
 *         description: Standort nicht gefunden
 */
router.delete('/:id', standortController.deleteStandort);

module.exports = router;
