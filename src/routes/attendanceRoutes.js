const express = require('express');
const router = express.Router();
const {
    registerAttendance,
    getMyAttendance,
    getCompanyAttendance
} = require('../controllers/attendanceController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/register', protect, registerAttendance);
router.get('/my-history', protect, getMyAttendance);
router.get('/company', protect, authorize('Ceo_Centralizat', 'Admin_Centralizat', 'Admin_Empresa'), getCompanyAttendance);

module.exports = router;
