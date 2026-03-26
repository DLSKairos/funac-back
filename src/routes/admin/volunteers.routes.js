const { Router } = require('express');
const {
  listVolunteers,
  getVolunteer,
  downloadVolunteerCV,
  updateVolunteerStatus,
  deleteVolunteer,
} = require('../../controllers/admin/volunteers.controller');
const authMiddleware = require('../../middlewares/auth');

const router = Router();

router.use(authMiddleware);

router.get('/', listVolunteers);
router.get('/:id', getVolunteer);
router.get('/:id/cv/download', downloadVolunteerCV);
router.put('/:id/status', updateVolunteerStatus);
router.delete('/:id', deleteVolunteer);

module.exports = router;
