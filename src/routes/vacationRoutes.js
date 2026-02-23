const express = require('express');
const router = express.Router();
const {
    syncVacationBalance,
    requestVacation,
    getVacations,
    updateVacationStatus
} = require('../controllers/vacationController');
const { protect } = require('../middleware/authMiddleware');
const { requireFullHR } = require('../middleware/serviceModeMiddleware');
const { validate, createVacationSchema } = require('../middleware/validators');

router.use(protect, requireFullHR);

router.route('/')
    .get(getVacations)
    .post(validate(createVacationSchema), requestVacation);

router.route('/sync/:applicantId')
    .post(syncVacationBalance);

router.route('/:id/status')
    .put(updateVacationStatus);

module.exports = router;

