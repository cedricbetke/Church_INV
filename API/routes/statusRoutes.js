const express = require('express');
const router = express.Router();
const statusController = require('../controllers/statusController');

/**
 * @swagger
 * tags:
 *   - name: Status
 *     description: Endpoints zur Verwaltung von Status
 */

/**
 * @swagger
 * /api/status:
 *   get:
 *     tags:
 *       - Status
 *     description: Alle Status abrufen
 *     responses:
 *       200:
 *         description: Erfolgreich alle Status abgerufen
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
router.get('/', statusController.getAllStatus);

/**
 * @swagger
 * /api/status/{id}:
 *   get:
 *     tags:
 *       - Status
 *     description: Status mit einer bestimmten ID abrufen
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Die ID des Status
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Status erfolgreich abgerufen
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
 *         description: Status mit dieser ID nicht gefunden
 */
router.get('/:id', statusController.getStatusById);

/**
 * @swagger
 * /api/status:
 *   post:
 *     tags:
 *       - Status
 *     description: Neuen Status erstellen
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
 *         description: Status erfolgreich erstellt
 */
router.post('/', statusController.createStatus);

/**
 * @swagger
 * /api/status/{id}:
 *   put:
 *     tags:
 *       - Status
 *     description: Status mit einer bestimmten ID aktualisieren
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Die ID des Status
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
 *         description: Status erfolgreich aktualisiert
 *       404:
 *         description: Status nicht gefunden
 */
router.put('/:id', statusController.updateStatus);

/**
 * @swagger
 * /api/status/{id}:
 *   delete:
 *     tags:
 *       - Status
 *     description: Status mit einer bestimmten ID löschen
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Die ID des Status
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Status erfolgreich gelöscht
 *       404:
 *         description: Status nicht gefunden
 */
router.delete('/:id', statusController.deleteStatus);

module.exports = router;
