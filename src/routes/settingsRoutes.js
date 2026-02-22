const express = require('express');
const { getSettings, updateSettings } = require('../controllers/settingsController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Only Admins can modify global payroll settings (using the 'Admin' role placeholder)
router.route('/').get(protect, getSettings).put(protect, updateSettings);

module.exports = router;
