const express = require('express');
const router = express.Router();
const buchungController = require('../controllers/buchungController');
const requireAdmin = require('../middleware/requireAdmin');

/**
 * @swagger
 * /api/buchung:
 *   get:
 *     tags: [Buchung]
 *     summary: Alle Buchungen abrufen
 *     responses:
 *       200:
 *         description: Liste aller Buchungen
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Booking'
 *       500:
 *         description: Interner Serverfehler
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/', buchungController.getAllBuchungen);

/**
 * @swagger
 * /api/buchung:
 *   post:
 *     tags: [Buchung]
 *     summary: Neue Mehrgeraete-Buchung anlegen
 *     security:
 *       - AdminPassword: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/BookingWritePayload'
 *     responses:
 *       201:
 *         description: Buchung erfolgreich erstellt
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Booking'
 *       400:
 *         description: Pflichtfelder fehlen oder Zeitraum ist ungueltig
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Admin-Berechtigung fehlt
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       409:
 *         description: Mindestens ein Geraet ist im Zeitraum bereits gebucht
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ErrorResponse'
 *                 - type: object
 *                   properties:
 *                     conflicts:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                           titel:
 *                             type: string
 *                           geraet_inv_nr:
 *                             type: integer
 *       500:
 *         description: Interner Serverfehler
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/', requireAdmin, buchungController.createBuchung);

/**
 * @swagger
 * /api/buchung/{id}:
 *   delete:
 *     tags: [Buchung]
 *     summary: Buchung loeschen
 *     security:
 *       - AdminPassword: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Buchung erfolgreich geloescht
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessMessage'
 *       403:
 *         description: Admin-Berechtigung fehlt
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Interner Serverfehler
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.delete('/:id', requireAdmin, buchungController.deleteBuchung);

module.exports = router;
