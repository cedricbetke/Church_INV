const express = require('express');
const router = express.Router();
const kategorieController = require('../controllers/kategorieController');

/**
 * @swagger
 * tags:
 *   - name: Kategorie
 *     description: Endpoints zum Verwalten der Kategorien
 */

/**
 * @swagger
 * /api/kategorie:
 *   get:
 *     tags:
 *       - Kategorie
 *     description: Alle Kategorien abrufen
 *     responses:
 *       200:
 *         description: Erfolgreich alle Kategorien abgerufen
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
 *                   bereich_id:
 *                     type: integer
 */
router.get('/', kategorieController.getAllKategorie);

/**
 * @swagger
 * /api/kategorie/{id}:
 *   get:
 *     tags:
 *       - Kategorie
 *     description: Eine Kategorie anhand ihrer ID abrufen
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Die ID der Kategorie
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Kategorie erfolgreich abgerufen
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 name:
 *                   type: string
 *                 bereich_id:
 *                   type: integer
 *       404:
 *         description: Kategorie mit dieser ID nicht gefunden
 */
router.get('/:id', kategorieController.getKategorieById);

/**
 * @swagger
 * /api/kategorie:
 *   post:
 *     tags:
 *       - Kategorie
 *     description: Eine neue Kategorie erstellen
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - bereich_id
 *             properties:
 *               name:
 *                 type: string
 *               bereich_id:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Kategorie erfolgreich erstellt
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 name:
 *                   type: string
 *                 bereich_id:
 *                   type: integer
 */
router.post('/', kategorieController.createKategorie);

/**
 * @swagger
 * /api/kategorie/{id}:
 *   put:
 *     tags:
 *       - Kategorie
 *     description: Eine Kategorie anhand ihrer ID aktualisieren
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Die ID der Kategorie
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
 *               - bereich_id
 *             properties:
 *               name:
 *                 type: string
 *               bereich_id:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Kategorie erfolgreich aktualisiert
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 name:
 *                   type: string
 *                 bereich_id:
 *                   type: integer
 *       404:
 *         description: Kategorie mit dieser ID nicht gefunden
 */
router.put('/:id', kategorieController.updateKategorie);

/**
 * @swagger
 * /api/kategorie/{id}:
 *   delete:
 *     tags:
 *       - Kategorie
 *     description: Eine Kategorie anhand ihrer ID löschen
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Die ID der Kategorie
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Kategorie erfolgreich gelöscht
 *       404:
 *         description: Kategorie mit dieser ID nicht gefunden
 */
router.delete('/:id', kategorieController.deleteKategorie);

module.exports = router;
