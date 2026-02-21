const User = require('../models/User');
const asyncHandler = require('express-async-handler');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const sendEmail = require('../utils/sendEmail');

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d'
    });
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
const authUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).populate('companyId');

    if (!user) {
        console.log(`Auth Failed: User ${email} not found`);
        res.status(401);
        throw new Error('Email no registrado en el sistema');
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
        console.log(`Auth Failed: Password mismatch for ${email}`);
        res.status(401);
        throw new Error('Contraseña incorrecta');
    }

    if (user.status !== 'Active' && user.role !== 'Ceo_Centralizat') {
        res.status(401);
        throw new Error('Su cuenta está pendiente de activación o ha sido suspendida. Por favor, contacte al administrador.');
    }

    res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        company: user.companyId,
        permissions: user.permissions,
        country: user.country,
        token: generateToken(user._id)
    });
});

// @desc    Forgot Password
// @route   POST /api/auth/forgotpassword
const forgotPassword = asyncHandler(async (req, res) => {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
        res.status(404);
        throw new Error('No existe usuario con ese email');
    }

    // Generate Request Token
    const resetToken = crypto.randomBytes(20).toString('hex');

    // Hash token and set to resetPasswordToken field
    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    // Set expire
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 Minutes

    await user.save();

    // Create reset url
    // Assumes frontend is running on same host/port or needs FE_URL env var
    // In dev usually port 3000. Let's assume standard behavior or use referer.
    const resetUrl = `${req.protocol}://${req.get('host')}/resetpassword/${resetToken}`;
    // BETTER: Use a FRONTEND_URL env var or deduce from origin
    // For now, let's assume localhost:3000 for dev if not set
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const cleanResetUrl = `${frontendUrl}/resetpassword/${resetToken}`;

    const message = `
        <h1>Has solicitado restablecer tu contraseña</h1>
        <p>Por favor ve al siguiente enlace para restablecer tu contraseña:</p>
        <a href=${cleanResetUrl} clicktracking=off>${cleanResetUrl}</a>
        <p>Si no solicitaste este correo, por favor ignóralo.</p>
    `;

    try {
        await sendEmail({
            email: user.email,
            subject: 'Restablecimiento de Contraseña - CENTRALIZA-T',
            message: `Para restablecer tu contraseña ve a este link: ${cleanResetUrl}`,
            html: message
        });

        res.status(200).json({ success: true, data: 'Email enviado' });
    } catch (error) {
        console.log(error);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save();
        res.status(500);
        throw new Error('El email no pudo ser enviado');
    }
});

// @desc    Reset Password
// @route   PUT /api/auth/resetpassword/:resettoken
const resetPassword = asyncHandler(async (req, res) => {
    // Get hashed token
    const resetPasswordToken = crypto.createHash('sha256').update(req.params.resettoken).digest('hex');

    const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
        res.status(400);
        throw new Error('Token inválido o expirado');
    }

    // Set new password
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.status(200).json({
        success: true,
        data: 'Contraseña actualizada exitosamente',
        token: generateToken(user._id)
    });
});

module.exports = { authUser, forgotPassword, resetPassword };
