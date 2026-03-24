const express = require('express');
const router = express.Router();
const modellController = require('../controllers/modellController');

/**
 * @swagger
 * tags:
 *   - name: Modell
 *     description: Endpoints zum Verwalten der Modelle
 */

/**
 * @swagger
 * /api/modell:
 *   get:
 *     tags:
 *       - Modell
 *     description: Alle Modelle abrufen
 *     responses:
 *       200:
 *         description: Erfolgreich alle Modelle abgerufen
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
 *                   beschreibung:
 *                     type: string
 */
router.get('/', modellController.getAllModelle);

/**
 * @swagger
 * /api/modell/{id}:
 *   get:
 *     tags:
 *       - Modell
 *     description: Modell mit einer bestimmten ID abrufen
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Die ID des Modells
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Modell erfolgreich abgerufen
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 name:
 *                   type: string
 *                 beschreibung:
 *                   type: string
 *       404:
 *         description: Modell mit dieser ID nicht gefunden
 */
router.get('/:id', modellController.getModellById);

/**
 * @swagger
 * /api/modell:
 *   post:
 *     tags:
 *       - Modell
 *     description: Neues Modell erstellen
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
 *               beschreibung:
 *                 type: string
 *     responses:
 *       201:
 *         description: Modell erfolgreich erstellt
 */
router.post('/', modellController.createModell);

/**
 * @swagger
 * /api/modell/{id}:
 *   put:
 *     tags:
 *       - Modell
 *     description: Modell mit einer bestimmten ID aktualisieren
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Die ID des Modells
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
 *               beschreibung:
 *                 type: string
 *     responses:
 *       200:
 *         description: Modell erfolgreich aktualisiert
 */
router.put('/:id', modellController.updateModell);

/**
 * @swagger
 * /api/modell/{id}:
 *   delete:
 *     tags:
 *       - Modell
 *     description: Modell mit einer bestimmten ID löschen
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Die ID des Modells
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Modell erfolgreich gelöscht
 */
router.delete('/:id', modellController.deleteModell);

module.exports = router;
