const { Router } = require('express');
const {
  listSectionImages,
  uploadSectionImage,
  resetSectionImage,
} = require('../../controllers/admin/section-images.controller');
const authMiddleware = require('../../middlewares/auth');
const { uploadSectionImage: uploadSectionImageMiddleware } = require('../../config/multer');

const router = Router();

router.use(authMiddleware);

router.get('/', listSectionImages);
router.put('/:pagina/:clave', uploadSectionImageMiddleware.single('imagen'), uploadSectionImage);
router.delete('/:pagina/:clave', resetSectionImage);

module.exports = router;
