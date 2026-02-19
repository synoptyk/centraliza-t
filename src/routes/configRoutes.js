const express = require('express');
const router = express.Router();
const { getConfig, updateConfig, testEmail } = require('../controllers/configController');

const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/')
    .get(protect, getConfig)
    .put(protect, authorize('Ceo_Centralizat', 'Admin_Centralizat'), updateConfig);

router.post('/test-email', protect, authorize('Ceo_Centralizat', 'Admin_Centralizat'), testEmail);

module.exports = router;
