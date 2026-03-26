const express = require('express');
const router = express.Router();
const objekttypController = require('../controllers/objekttypController');

/**
 * @swagger
 * /api/objekttyp:
 *   get:
 *     tags: [Objekttyp]
 *     summary: Alle Objekttypen abrufen
 *     responses:
 *       200:
 *         description: Objekttypenliste
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Objekttyp'
 */
router.get('/', objekttypController.getAllObjekttypen);

/**
 * @swagger
 * /api/objekttyp/{id}:
 *   get:
 *     tags: [Objekttyp]
 *     summary: Einen Objekttyp abrufen
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Objekttyp gefunden
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Objekttyp'
 *       404:
 *         description: Objekttyp nicht gefunden
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/:id', objekttypController.getObjekttypById);

/**
 * @swagger
 * /api/objekttyp:
 *   post:
 *     tags: [Objekttyp]
 *     summary: Neuen Objekttyp anlegen
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ObjekttypWritePayload'
 *     responses:
 *       201:
 *         description: Objekttyp erfolgreich angelegt
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Objekttyp'
 *       500:
 *         description: Interner Serverfehler
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/', objekttypController.createObjekttyp);

/**
 * @swagger
 * /api/objekttyp/{id}:
 *   put:
 *     tags: [Objekttyp]
 *     summary: Objekttyp aktualisieren
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
 *             $ref: '#/components/schemas/ObjekttypWritePayload'
 *     responses:
 *       200:
 *         description: Objekttyp erfolgreich aktualisiert
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Objekttyp'
 *       404:
 *         description: Objekttyp nicht gefunden
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.put('/:id', objekttypController.updateObjekttyp);

/**
 * @swagger
 * /api/objekttyp/{id}:
 *   delete:
 *     tags: [Objekttyp]
 *     summary: Objekttyp löschen
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Objekttyp erfolgreich gelöscht
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessMessage'
 *       404:
 *         description: Objekttyp nicht gefunden
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.delete('/:id', objekttypController.deleteObjekttyp);

module.exports = router;
