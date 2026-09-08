const { Router } = require('express');
const { getImages, getPdfs, downloadPdf, viewPdf } = require('../controllers/home.controller');

const router = Router();

router.get('/images', getImages);
router.get('/pdfs', getPdfs);
router.get('/pdfs/:id/download', downloadPdf);
router.get('/pdfs/:id/view', viewPdf);

module.exports = router;
