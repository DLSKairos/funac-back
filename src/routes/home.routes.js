const { Router } = require('express');
const { getImages, getPdfs, downloadPdf } = require('../controllers/home.controller');

const router = Router();

router.get('/images', getImages);
router.get('/pdfs', getPdfs);
router.get('/pdfs/:id/download', downloadPdf);

module.exports = router;
