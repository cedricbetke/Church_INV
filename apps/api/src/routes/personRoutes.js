const express = require('express');
const router = express.Router();
const personController = require('../controllers/personController');

/**
 * @swagger
 * /api/person:
 *   get:
 *     tags: [Person]
 *     summary: Alle Personen abrufen
 *     responses:
 *       200:
 *         description: Personenliste
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
 *                   vorname:
 *                     type: string
 *                     example: Cedric
 *                   nachname:
 *                     type: string
 *                     example: Betke
 */
router.get('/', personController.getAllPersonen);

/**
 * @swagger
 * /api/person/{id}:
 *   get:
 *     tags: [Person]
 *     summary: Eine Person abrufen
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Person gefunden
 *       404:
 *         description: Person nicht gefunden
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/:id', personController.getPersonById);

/**
 * @swagger
 * /api/person:
 *   post:
 *     tags: [Person]
 *     summary: Neue Person anlegen
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [vorname, nachname]
 *             properties:
 *               vorname:
 *                 type: string
 *                 example: Cedric
 *               nachname:
 *                 type: string
 *                 example: Betke
 *     responses:
 *       201:
 *         description: Person erfolgreich angelegt
 */
router.post('/', personController.createPerson);

/**
 * @swagger
 * /api/person/{id}:
 *   put:
 *     tags: [Person]
 *     summary: Person aktualisieren
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
 *             required: [vorname, nachname]
 *             properties:
 *               vorname:
 *                 type: string
 *                 example: Cedric
 *               nachname:
 *                 type: string
 *                 example: Betke
 *     responses:
 *       200:
 *         description: Person erfolgreich aktualisiert
 *       404:
 *         description: Person nicht gefunden
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.put('/:id', personController.updatePerson);

/**
 * @swagger
 * /api/person/{id}:
 *   delete:
 *     tags: [Person]
 *     summary: Person löschen
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Person erfolgreich gelöscht
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessMessage'
 *       404:
 *         description: Person nicht gefunden
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.delete('/:id', personController.deletePerson);

module.exports = router;
