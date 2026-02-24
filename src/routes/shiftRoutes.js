const express = require('express');
const router = express.Router();
const {
    createShift,
    getShifts,
    assignSchedule,
    getWorkerSchedule
} = require('../controllers/shiftController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/')
    .post(protect, authorize('Ceo_Centralizat', 'Admin_Centralizat', 'Admin_Empresa'), createShift)
    .get(protect, getShifts);

router.post('/assign', protect, authorize('Ceo_Centralizat', 'Admin_Centralizat', 'Admin_Empresa'), assignSchedule);
router.get('/schedule/:workerId', protect, getWorkerSchedule);

module.exports = router;
