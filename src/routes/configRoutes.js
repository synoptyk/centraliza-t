const express = require('express');
const router = express.Router();
const { getConfig, updateConfig } = require('../controllers/configController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/')
    .get(protect, authorize('Ceo_Centralizat', 'Admin_Centralizat'), getConfig)
    .put(protect, authorize('Ceo_Centralizat'), updateConfig);

module.exports = router;
