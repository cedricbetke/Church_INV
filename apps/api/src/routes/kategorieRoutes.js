const express = require('express');
const router = express.Router();
const kategorieController = require('../controllers/kategorieController');

/**
 * @swagger
 * /api/kategorie:
 *   get:
 *     tags: [Kategorie]
 *     summary: Alle Kategorien abrufen
 *     responses:
 *       200:
 *         description: Kategorienliste
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
 *                     example: Video
 *                   bereich_id:
 *                     type: integer
 *                     example: 2
 */
router.get('/', kategorieController.getAllKategorie);

/**
 * @swagger
 * /api/kategorie/{id}:
 *   get:
 *     tags: [Kategorie]
 *     summary: Eine Kategorie abrufen
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Kategorie gefunden
 *       404:
 *         description: Kategorie nicht gefunden
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/:id', kategorieController.getKategorieById);

/**
 * @swagger
 * /api/kategorie:
 *   post:
 *     tags: [Kategorie]
 *     summary: Neue Kategorie anlegen
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, bereich_id]
 *             properties:
 *               name:
 *                 type: string
 *                 example: Audio
 *               bereich_id:
 *                 type: integer
 *                 example: 1
 *     responses:
 *       201:
 *         description: Kategorie erfolgreich angelegt
 */
router.post('/', kategorieController.createKategorie);

/**
 * @swagger
 * /api/kategorie/{id}:
 *   put:
 *     tags: [Kategorie]
 *     summary: Kategorie aktualisieren
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
 *             required: [name, bereich_id]
 *             properties:
 *               name:
 *                 type: string
 *                 example: Kamera
 *               bereich_id:
 *                 type: integer
 *                 example: 1
 *     responses:
 *       200:
 *         description: Kategorie erfolgreich aktualisiert
 *       404:
 *         description: Kategorie nicht gefunden
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.put('/:id', kategorieController.updateKategorie);

/**
 * @swagger
 * /api/kategorie/{id}:
 *   delete:
 *     tags: [Kategorie]
 *     summary: Kategorie löschen
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Kategorie erfolgreich gelöscht
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessMessage'
 *       404:
 *         description: Kategorie nicht gefunden
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.delete('/:id', kategorieController.deleteKategorie);

module.exports = router;
