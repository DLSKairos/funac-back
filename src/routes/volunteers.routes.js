const { Router } = require('express');
const { registerVolunteer, uploadCV: uploadCVController } = require('../controllers/volunteers.controller');
const { uploadCV } = require('../config/multer');

const router = Router();

router.post('/', registerVolunteer);
router.post('/:id/cv', uploadCV.single('cv'), uploadCVController);

module.exports = router;
