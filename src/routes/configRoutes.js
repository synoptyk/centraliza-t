const express = require('express');
const router = express.Router();
const { getConfig, updateConfig, testEmail, resetSmtp } = require('../controllers/configController');

const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/')
    .get(protect, getConfig)
    .put(protect, authorize('Ceo_Centralizat', 'Admin_Centralizat'), updateConfig);

router.post('/test-email', protect, authorize('Ceo_Centralizat', 'Admin_Centralizat'), testEmail);
router.post('/reset-smtp', protect, authorize('Ceo_Centralizat', 'Admin_Centralizat'), resetSmtp);

module.exports = router;
