const express = require('express');
const router = express.Router();
const modellController = require('../controllers/modellController');

/**
 * @swagger
 * /api/modell:
 *   get:
 *     tags: [Modell]
 *     summary: Alle Modelle abrufen
 *     responses:
 *       200:
 *         description: Modellliste
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Modell'
 */
router.get('/', modellController.getAllModelle);

/**
 * @swagger
 * /api/modell/{id}:
 *   get:
 *     tags: [Modell]
 *     summary: Ein Modell abrufen
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Modell gefunden
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Modell'
 *       404:
 *         description: Modell nicht gefunden
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/:id', modellController.getModellById);

/**
 * @swagger
 * /api/modell:
 *   post:
 *     tags: [Modell]
 *     summary: Neues Modell anlegen
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ModellWritePayload'
 *     responses:
 *       201:
 *         description: Modell erfolgreich angelegt
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Modell'
 *       500:
 *         description: Interner Serverfehler
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/', modellController.createModell);

/**
 * @swagger
 * /api/modell/{id}:
 *   put:
 *     tags: [Modell]
 *     summary: Modell aktualisieren
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
 *             $ref: '#/components/schemas/ModellWritePayload'
 *     responses:
 *       200:
 *         description: Modell erfolgreich aktualisiert
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Modell'
 *       404:
 *         description: Modell nicht gefunden
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.put('/:id', modellController.updateModell);

/**
 * @swagger
 * /api/modell/{id}:
 *   delete:
 *     tags: [Modell]
 *     summary: Modell löschen
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Modell erfolgreich gelöscht
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessMessage'
 *       404:
 *         description: Modell nicht gefunden
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.delete('/:id', modellController.deleteModell);

module.exports = router;
