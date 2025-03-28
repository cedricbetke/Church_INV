const express = require('express');
const router = express.Router();
const dokumenteController = require('../controllers/dokumenteController');

/**
 * @swagger
 * tags:
 *   - name: Dokumente
 *     description: Endpoints zum Verwalten der Dokumente
 */

/**
 * @swagger
 * /dokumente:
 *   get:
 *     tags:
 *       - Dokumente
 *     description: Alle Dokumente abrufen
 *     responses:
 *       200:
 *         description: Erfolgreich alle Dokumente abgerufen
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
 *                   url:
 *                     type: string
 *                   geraete_id:
 *                     type: integer
 */
router.get('/', dokumenteController.getAllDokumente);

/**
 * @swagger
 * /dokumente/{id}:
 *   get:
 *     tags:
 *       - Dokumente
 *     description: Dokument mit einer bestimmten ID abrufen
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Die ID des Dokuments
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Dokument erfolgreich abgerufen
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 name:
 *                   type: string
 *                 url:
 *                   type: string
 *                 geraete_id:
 *                   type: integer
 *       404:
 *         description: Dokument mit dieser ID nicht gefunden
 */
router.get('/:id', dokumenteController.getDokumentById);

/**
 * @swagger
 * /dokumente:
 *   post:
 *     tags:
 *       - Dokumente
 *     description: Neues Dokument erstellen
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - url
 *               - geraete_id
 *             properties:
 *               name:
 *                 type: string
 *               url:
 *                 type: string
 *               geraete_id:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Dokument erfolgreich erstellt
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 name:
 *                   type: string
 *                 url:
 *                   type: string
 *                 geraete_id:
 *                   type: integer
 */
router.post('/', dokumenteController.createDokument);

/**
 * @swagger
 * /dokumente/{id}:
 *   put:
 *     tags:
 *       - Dokumente
 *     description: Dokument mit einer bestimmten ID aktualisieren
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Die ID des Dokuments
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
 *               - url
 *               - geraete_id
 *             properties:
 *               name:
 *                 type: string
 *               url:
 *                 type: string
 *               geraete_id:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Dokument erfolgreich aktualisiert
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 name:
 *                   type: string
 *                 url:
 *                   type: string
 *                 geraete_id:
 *                   type: integer
 *       404:
 *         description: Dokument mit dieser ID nicht gefunden
 */
router.put('/:id', dokumenteController.updateDokument);

/**
 * @swagger
 * /dokumente/{id}:
 *   delete:
 *     tags:
 *       - Dokumente
 *     description: Dokument mit einer bestimmten ID löschen
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Die ID des Dokuments
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Dokument erfolgreich gelöscht
 *       404:
 *         description: Dokument mit dieser ID nicht gefunden
 */
router.delete('/:id', dokumenteController.deleteDokument);

module.exports = router;
