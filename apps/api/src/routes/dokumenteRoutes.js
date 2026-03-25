const express = require('express');
const router = express.Router();
const dokumenteController = require('../controllers/dokumenteController');
const requireAdmin = require('../middleware/requireAdmin');

router.get('/', dokumenteController.getAllDokumente);
router.post('/upload', requireAdmin, dokumenteController.uploadDokument);
router.get('/:id', dokumenteController.getDokumentById);
router.post('/', requireAdmin, dokumenteController.createDokument);
router.put('/:id', requireAdmin, dokumenteController.updateDokument);
router.delete('/:id', requireAdmin, dokumenteController.deleteDokument);

module.exports = router;
