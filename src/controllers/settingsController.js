const GlobalSettings = require('../models/GlobalSettings');
const asyncHandler = require('express-async-handler');
const axios = require('axios');

// Helper to check if date is older than X hours
const isOlderThanHours = (date, hours) => {
    if (!date) return true;
    const pastDate = new Date(date).getTime();
    const now = new Date().getTime();
    return (now - pastDate) > (hours * 60 * 60 * 1000);
};

// @desc    Get global settings
// @route   GET /api/settings
// @access  Private/Admin
exports.getSettings = asyncHandler(async (req, res) => {
    let settings = await GlobalSettings.findOne({ id: 'UNIQUE_CONFIG_DOCUMENT' });

    if (!settings) {
        settings = await GlobalSettings.create({ id: 'UNIQUE_CONFIG_DOCUMENT' });
    }

    // Attempt to sync with MIndicador (Banco Central wrapper) if cache is older than 6 hours
    if (isOlderThanHours(settings.lastIndicatorsUpdate, 6)) {
        try {
            const apiRes = await axios.get('https://mindicador.cl/api', { timeout: 5000 });
            const data = apiRes.data;

            if (data.uf?.valor) settings.ufValue = data.uf.valor;
            if (data.utm?.valor) settings.utmValue = data.utm.valor;
            if (data.dolar?.valor) settings.dolarValue = data.dolar.valor;

            settings.lastIndicatorsUpdate = new Date();
            await settings.save();
        } catch (error) {
            console.error('Error fetching MIndicador API. Falling back to cached values.', error.message);
            // It's okay, we gracefully degrade to the last mapped values or defaults
        }
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
