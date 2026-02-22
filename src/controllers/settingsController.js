const GlobalSettings = require('../models/GlobalSettings');
const asyncHandler = require('express-async-handler');

// @desc    Get global settings
// @route   GET /api/settings
// @access  Private/Admin
exports.getSettings = asyncHandler(async (req, res) => {
    let settings = await GlobalSettings.findOne({ id: 'UNIQUE_CONFIG_DOCUMENT' });

    if (!settings) {
        // Create initial default settings if none exist
        settings = await GlobalSettings.create({ id: 'UNIQUE_CONFIG_DOCUMENT' });
    }

    res.json(settings);
});

// @desc    Update global settings
// @route   PUT /api/settings
// @access  Private/Admin
exports.updateSettings = asyncHandler(async (req, res) => {
    let settings = await GlobalSettings.findOne({ id: 'UNIQUE_CONFIG_DOCUMENT' });

    if (!settings) {
        settings = new GlobalSettings({ id: 'UNIQUE_CONFIG_DOCUMENT' });
    }

    // Update allowable fields
    if (req.body.sueldoMinimo !== undefined) settings.sueldoMinimo = req.body.sueldoMinimo;
    if (req.body.topeImponibleAFP !== undefined) settings.topeImponibleAFP = req.body.topeImponibleAFP;
    if (req.body.topeImponibleAFC !== undefined) settings.topeImponibleAFC = req.body.topeImponibleAFC;
    if (req.body.sisRate !== undefined) settings.sisRate = req.body.sisRate;
    if (req.body.mutualBaseRate !== undefined) settings.mutualBaseRate = req.body.mutualBaseRate;
    if (req.body.manualUfValue !== undefined) settings.manualUfValue = req.body.manualUfValue;
    if (req.body.manualUtmValue !== undefined) settings.manualUtmValue = req.body.manualUtmValue;
    if (req.body.afpRates) settings.afpRates = req.body.afpRates;

    const updatedSettings = await settings.save();
    res.json(updatedSettings);
});
