const User = require('../models/User');
const Company = require('../models/Company');
const Subscription = require('../models/Subscription');
const SubscriptionPlan = require('../models/SubscriptionPlan');
const asyncHandler = require('express-async-handler');
const jwt = require('jsonwebtoken');

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d'
    });
};

// @desc    Register a new company and admin user for Trial
// @route   POST /api/auth/register-trial
const registerTrial = asyncHandler(async (req, res) => {
    const { name, email, password, companyName, rut } = req.body;

    // 1. Validations
    const userExists = await User.findOne({ email });
    if (userExists) {
        res.status(400);
        throw new Error('El correo electrónico ya está registrado.');
    }

    const companyExists = await Company.findOne({ rut });
    if (companyExists) {
        res.status(400);
        throw new Error('Ya existe una empresa registrada con ese RUT.');
    }

    // 2. Initial Plan Check
    const trialPlan = await SubscriptionPlan.findOne({ isTrial: true });
    if (!trialPlan) {
        res.status(500);
        throw new Error('El sistema no tiene configurado un plan de prueba (Trial). Contacte a soporte.');
    }

    // 3. Create Company
    const company = await Company.create({
        name: companyName,
        rut: rut,
        email: email,
        status: 'Active'
    });

    // 4. Create Admin User
    const user = await User.create({
        name,
        email,
        password,
        role: 'Admin_Empresa',
        companyId: company._id,
        permissions: ['all'] // Full permissions for the first admin
    });

    // 5. Create Subscription
    await Subscription.create({
        companyId: company._id,
        planId: trialPlan._id,
        status: 'Trial',
        endDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000) // 15 Days
    });

    if (user) {
        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            company: company,
            token: generateToken(user._id)
        });
    } else {
        res.status(400);
        throw new Error('Error al crear la cuenta de usuario.');
    }
});

module.exports = { registerTrial };
