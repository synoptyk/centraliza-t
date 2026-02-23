const express = require('express');
const { getSettings, updateSettings } = require('../controllers/settingsController');
const { protect } = require('../middleware/authMiddleware');
const { runManualSync } = require('../utils/indicatorSyncService');

const router = express.Router();

// Only Admins can modify global payroll settings
router.route('/').get(protect, getSettings).put(protect, updateSettings);

// Admin-triggered force sync of all economic indicators
router.post('/force-sync', protect, async (req, res) => {
    try {
        const settings = await runManualSync();
        res.json({ success: true, message: 'Sincronización forzada completada', ufValue: settings.ufValue, dolarValue: settings.dolarValue });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;

