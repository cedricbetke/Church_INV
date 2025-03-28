const express = require('express');
const router = express.Router();
const personController = require('../controllers/personController');

/**
 * @swagger
 * tags:
 *   - name: Person
 *     description: Endpoints zur Verwaltung von Personen
 */

/**
 * @swagger
 * /api/person:
 *   get:
 *     tags:
 *       - Person
 *     description: Alle Personen abrufen
 *     responses:
 *       200:
 *         description: Erfolgreich alle Personen abgerufen
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   vorname:
 *                     type: string
 *                   nachname:
 *                     type: string
 *                   email:
 *                     type: string
 */
router.get('/', personController.getAllPersonen);

/**
 * @swagger
 * /api/person/{id}:
 *   get:
 *     tags:
 *       - Person
 *     description: Person mit einer bestimmten ID abrufen
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Die ID der Person
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Person erfolgreich abgerufen
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 vorname:
 *                   type: string
 *                 nachname:
 *                   type: string
 *                 email:
 *                   type: string
 *       404:
 *         description: Person mit dieser ID nicht gefunden
 */
router.get('/:id', personController.getPersonById);

/**
 * @swagger
 * /api/person:
 *   post:
 *     tags:
 *       - Person
 *     description: Neue Person erstellen
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - vorname
 *               - nachname
 *               - email
 *             properties:
 *               vorname:
 *                 type: string
 *               nachname:
 *                 type: string
 *               email:
 *                 type: string
 *     responses:
 *       201:
 *         description: Person erfolgreich erstellt
 */
router.post('/', personController.createPerson);

/**
 * @swagger
 * /api/person/{id}:
 *   put:
 *     tags:
 *       - Person
 *     description: Person mit einer bestimmten ID aktualisieren
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Die ID der Person
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - vorname
 *               - nachname
 *               - email
 *             properties:
 *               vorname:
 *                 type: string
 *               nachname:
 *                 type: string
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: Person erfolgreich aktualisiert
 *       404:
 *         description: Person nicht gefunden
 */
router.put('/:id', personController.updatePerson);

/**
 * @swagger
 * /api/person/{id}:
 *   delete:
 *     tags:
 *       - Person
 *     description: Person mit einer bestimmten ID löschen
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Die ID der Person
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Person erfolgreich gelöscht
 *       404:
 *         description: Person nicht gefunden
 */
router.delete('/:id', personController.deletePerson);

module.exports = router;
