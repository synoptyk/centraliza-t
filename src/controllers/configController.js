const Config = require('../models/Config');
const asyncHandler = require('express-async-handler');

// @desc    Get global config
// @route   GET /api/config
const getConfig = asyncHandler(async (req, res) => {
    let config = await Config.findOne();
    if (!config) {
        config = await Config.create({ managers: [], admins: [] });
    }
    res.json(config);
});

// @desc    Update global config
// @route   PUT /api/config
const updateConfig = asyncHandler(async (req, res) => {
    let config = await Config.findOne();
    if (!config) {
        config = await Config.create({});
    }

    if (req.body.managers) config.managers = req.body.managers;
    if (req.body.admins) config.admins = req.body.admins;
    if (req.body.smtp) config.smtp = req.body.smtp;

    const updatedConfig = await config.save();
    res.json(updatedConfig);
});

module.exports = { getConfig, updateConfig };
