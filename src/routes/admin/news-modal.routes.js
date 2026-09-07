const { Router } = require('express');
const {
  getNewsModal,
  updateNewsModal,
  uploadNewsModalImage,
  deleteNewsModalImage,
} = require('../../controllers/admin/news-modal.controller');
const authMiddleware = require('../../middlewares/auth');
const { uploadNewsModalImage: uploadNewsModalImageMiddleware } = require('../../config/multer');

const router = Router();

router.use(authMiddleware);

router.get('/', getNewsModal);
router.put('/', updateNewsModal);
router.post('/imagen', uploadNewsModalImageMiddleware.single('imagen'), uploadNewsModalImage);
router.delete('/imagen', deleteNewsModalImage);

module.exports = router;
