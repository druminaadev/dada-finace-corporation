const express = require('express');
const documentController = require('./document.controller');
const upload = require('../../middlewares/upload');
const { authenticate, authorize } = require('../../middlewares/auth');

const router = express.Router();

router.use(authenticate);

router.post('/upload', authorize('ADMIN', 'EMPLOYEE'), upload.single('file'), documentController.upload);
router.get('/:entityType/:entityId', documentController.getByEntity);
router.get('/download/:id', documentController.download);
router.delete('/:id', authorize('ADMIN', 'EMPLOYEE'), documentController.delete);

module.exports = router;
