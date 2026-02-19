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
        config = new Config({ managers, admins, smtp: req.body.smtp });
    } else {
        if (managers) config.managers = managers;
        if (admins) config.admins = admins;
        if (req.body.smtp) {
            const newSmtp = req.body.smtp;
            // If new password is empty or placeholder, keep existing password
            if ((!newSmtp.password || newSmtp.password.trim() === '') && config.smtp && config.smtp.password) {
                console.log('--- [DEBUG] Keeping existing SMTP password ---');
                newSmtp.password = config.smtp.password;
            } else if (newSmtp.password && newSmtp.password.trim() !== '') {
                console.log('--- [DEBUG] Updating SMTP password with new value ---');
            }
            config.smtp = newSmtp;
        }
    }

    const updatedConfig = await config.save();
    res.json(updatedConfig);
});

// @desc    Test Email Configuration
// @route   POST /api/config/test-email
const testEmail = asyncHandler(async (req, res) => {
    const { email } = req.body;
    const sendEmail = require('../utils/sendEmail');

    try {
        await sendEmail({
            email: email,
            subject: 'Prueba de Configuración SMTP - Centraliza-T',
            message: 'Si estás leyendo esto, tu configuración de correo funciona correctamente.',
            html: `
                <div style="font-family: sans-serif; padding: 20px; text-align: center;">
                    <h1 style="color: #4f46e5;">Configuración Exitosa</h1>
                    <p>El sistema de correo está funcionando correctamente.</p>
                    <p style="font-size: 12px; color: #666;">Enviado desde Centraliza-T Server</p>
                </div>
            `
        });
        res.json({ message: 'Correo de prueba enviado exitosamente' });
    } catch (error) {
        console.error('Test Email Failed:', error);
        res.status(400); // Bad Request implies config error
        throw new Error(error.message);
    }
});

module.exports = {
    getConfig,
    updateConfig,
    testEmail
};
