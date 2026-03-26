const { Router } = require('express');
const {
  uploadCarouselImages,
  reorderCarouselImages,
  deleteCarouselImage,
  toggleCarouselImage,
  listCarouselImages,
  uploadPdf,
  deletePdf,
  togglePdf,
  listPdfs,
} = require('../../controllers/admin/content.controller');
const authMiddleware = require('../../middlewares/auth');
const { uploadCarousel, uploadPDF } = require('../../config/multer');

const router = Router();

router.use(authMiddleware);

// Carrusel
router.get('/carousel/images', listCarouselImages);
router.post('/carousel/images', uploadCarousel.array('images', 10), uploadCarouselImages);
router.put('/carousel/images/reorder', reorderCarouselImages);
router.patch('/carousel/images/:id/toggle', toggleCarouselImage);
router.delete('/carousel/images/:id', deleteCarouselImage);

// PDFs
router.get('/pdfs', listPdfs);
router.post('/pdfs', uploadPDF.single('pdf'), uploadPdf);
router.patch('/pdfs/:id/toggle', togglePdf);
router.delete('/pdfs/:id', deletePdf);

module.exports = router;
