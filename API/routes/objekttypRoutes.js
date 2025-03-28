const express = require('express');
const router = express.Router();
const objekttypController = require('../controllers/objekttypController');

/**
 * @swagger
 * tags:
 *   - name: Objekttyp
 *     description: Endpoints zur Verwaltung von Objekttypen
 */

/**
 * @swagger
 * /api/objekttyp:
 *   get:
 *     tags:
 *       - Objekttyp
 *     description: Alle Objekttypen abrufen
 *     responses:
 *       200:
 *         description: Erfolgreich alle Objekttypen abgerufen
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
router.get('/', objekttypController.getAllObjekttypen);

/**
 * @swagger
 * /api/objekttyp/{id}:
 *   get:
 *     tags:
 *       - Objekttyp
 *     description: Objekttyp mit einer bestimmten ID abrufen
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Die ID des Objekttyps
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Objekttyp erfolgreich abgerufen
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
 *         description: Objekttyp mit dieser ID nicht gefunden
 */
router.get('/:id', objekttypController.getObjekttypById);

/**
 * @swagger
 * /api/objekttyp:
 *   post:
 *     tags:
 *       - Objekttyp
 *     description: Neuen Objekttyp erstellen
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
 *         description: Objekttyp erfolgreich erstellt
 */
router.post('/', objekttypController.createObjekttyp);

/**
 * @swagger
 * /api/objekttyp/{id}:
 *   put:
 *     tags:
 *       - Objekttyp
 *     description: Objekttyp mit einer bestimmten ID aktualisieren
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Die ID des Objekttyps
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
 *         description: Objekttyp erfolgreich aktualisiert
 *       404:
 *         description: Objekttyp nicht gefunden
 */
router.put('/:id', objekttypController.updateObjekttyp);

/**
 * @swagger
 * /api/objekttyp/{id}:
 *   delete:
 *     tags:
 *       - Objekttyp
 *     description: Objekttyp mit einer bestimmten ID löschen
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Die ID des Objekttyps
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Objekttyp erfolgreich gelöscht
 *       404:
 *         description: Objekttyp nicht gefunden
 */
router.delete('/:id', objekttypController.deleteObjekttyp);

module.exports = router;
