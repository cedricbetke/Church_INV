const express = require('express');
const router = express.Router();
const geraetController = require('../controllers/geraetController');

/**
 * @swagger
 * tags:
 *   - name: Gerät
 *     description: Endpoints zur Verwaltung von Geräten
 */

/**
 * @swagger
 * /api/geraet:
 *   get:
 *     tags:
 *       - Gerät
 *     description: Alle Geräte abrufen
 *     responses:
 *       200:
 *         description: Erfolgreich alle Geräte abgerufen
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
 *                   seriennummer:
 *                     type: string
 *                   status_id:
 *                     type: integer
 *                   standort_id:
 *                     type: integer
 *                   objekttyp_id:
 *                     type: integer
 */
router.get('/', geraetController.getAllGeraete);

router.get('/max-id',geraetController.getMaxId);
router.post('/upload-photo', geraetController.uploadGeraetFoto);
/**
 * @swagger
 * /api/geraet/{id}:
 *   get:
 *     tags:
 *       - Gerät
 *     description: Gerät mit einer bestimmten ID abrufen
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Die ID des Geräts
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Gerät erfolgreich abgerufen
 *       404:
 *         description: Gerät mit dieser ID nicht gefunden
 */
router.get('/:id', geraetController.getGeraetById);


/**
 * @swagger
 * /api/geraet:
 *   post:
 *     tags:
 *       - Gerät
 *     description: Neues Gerät erstellen
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - seriennummer
 *               - status_id
 *               - standort_id
 *               - objekttyp_id
 *             properties:
 *               name:
 *                 type: string
 *               seriennummer:
 *                 type: string
 *               status_id:
 *                 type: integer
 *               standort_id:
 *                 type: integer
 *               objekttyp_id:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Gerät erfolgreich erstellt
 */
router.post('/', geraetController.createGeraet);

/**
 * @swagger
 * /api/geraet/{id}:
 *   put:
 *     tags:
 *       - Gerät
 *     description: Gerät mit einer bestimmten ID aktualisieren
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Die ID des Geräts
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
 *               - seriennummer
 *               - status_id
 *               - standort_id
 *               - objekttyp_id
 *             properties:
 *               name:
 *                 type: string
 *               seriennummer:
 *                 type: string
 *               status_id:
 *                 type: integer
 *               standort_id:
 *                 type: integer
 *               objekttyp_id:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Gerät erfolgreich aktualisiert
 */
router.put('/:id', geraetController.updateGeraet);

/**
 * @swagger
 * /api/geraet/{id}:
 *   delete:
 *     tags:
 *       - Gerät
 *     description: Gerät mit einer bestimmten ID löschen
 */
router.delete('/:id', geraetController.deleteGeraet);

module.exports = router;
