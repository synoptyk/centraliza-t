const asyncHandler = require('express-async-handler');
const Config = require('../models/Config');

// @desc    Get configuration settings
// @route   GET /api/config
const getConfig = asyncHandler(async (req, res) => {
    let config = await Config.findOne();

    if (!config) {
        // Create initial empty config if none exists
        config = await Config.create({ managers: [], admins: [] });
    }

    res.json(config);
});

// @desc    Update configuration settings
// @route   PUT /api/config
const updateConfig = asyncHandler(async (req, res) => {
    const { managers, admins } = req.body;

    let config = await Config.findOne();

    if (!config) {
        config = new Config({ managers, admins });
    } else {
        if (managers) config.managers = managers;
        if (admins) config.admins = admins;
    }

    const updatedConfig = await config.save();
    res.json(updatedConfig);
});

module.exports = {
    getConfig,
    updateConfig
};
