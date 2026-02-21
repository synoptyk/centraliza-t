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
    const {
        nombreEmpresa,
        rutEmpresa,
        nombreUsuario,
        rutUsuario,
        email,
        celular,
        password,
        planId, // Optional now, since we had trial default
        country // Added country
    } = req.body;

    // 1. Validations
    if (!nombreEmpresa || !rutEmpresa || !nombreUsuario || !rutUsuario || !email || !password || !country) {
        res.status(400);
        throw new Error('Todos los campos son obligatorios.');
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
        res.status(400);
        throw new Error('El correo electrónico ya está registrado.');
    }

    const companyExists = await Company.findOne({ rut: rutEmpresa });
    if (companyExists) {
        res.status(400);
        throw new Error('Ya existe una empresa registrada con ese RUT.');
    }

    // 2. Initial Plan Check (Default to Trial if not provided)
    let selectedPlanId = planId;
    if (!selectedPlanId) {
        const trialPlan = await SubscriptionPlan.findOne({ isTrial: true });
        if (trialPlan) selectedPlanId = trialPlan._id;
    }

    // 3. Create Company (Status: Pending)
    const company = await Company.create({
        name: nombreEmpresa,
        rut: rutEmpresa,
        email: email,
        phone: celular,
        status: 'Pending',
        country: country || 'CL'
    });

    // 4. Create Admin User (Status: Pending)
    const user = await User.create({
        name: nombreUsuario,
        rut: rutUsuario,
        email: email,
        cellphone: celular,
        password: password,
        role: 'Admin_Empresa',
        companyId: company._id,
        permissions: [{ module: 'all', actions: { create: true, read: true, update: true, delete: true } }],
        status: 'Pending',
        country: country || 'CL'
    });

    // 5. Create Subscription (Status: Pending)
    if (selectedPlanId) {
        await Subscription.create({
            companyId: company._id,
            planId: selectedPlanId,
            status: 'Pending',
            endDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000) // 15 Days trial default
        });
    }

    // 6. Notify CEO
    const sendEmail = require('../utils/sendEmail');
    try {
        await sendEmail({
            email: 'centraliza-t@synoptyk.cl',
            subject: 'Solicitud de nueva Alta usuario nuevo',
            message: `Nueva solicitud de registro:
            Empresa: ${nombreEmpresa} (RUT: ${rutEmpresa})
            Usuario: ${nombreUsuario} (RUT: ${rutUsuario})
            Email: ${email}
            Celular: ${celular}
            
            Por favor, ingrese al panel de administración para autorizar esta cuenta.`,
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; color: #1e293b;">
                    <h2 style="color: #4f46e5; border-bottom: 2px solid #f1f5f9; padding-bottom: 10px;">Nueva Solicitud de Alta</h2>
                    <p>Se ha registrado una nueva empresa en el ecosistema <strong>Centraliza-T</strong> y requiere aprobación manual.</p>
                    
                    <div style="background: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0;">
                        <h3 style="font-size: 14px; text-transform: uppercase; color: #64748b; margin-bottom: 10px;">Detalles de la Empresa</h3>
                        <p style="margin: 5px 0;"><strong>Nombre:</strong> ${nombreEmpresa}</p>
                        <p style="margin: 5px 0;"><strong>RUT:</strong> ${rutEmpresa}</p>
                        
                        <h3 style="font-size: 14px; text-transform: uppercase; color: #64748b; margin: 15px 0 10px 0;">Detalles del Administrador</h3>
                        <p style="margin: 5px 0;"><strong>Nombre:</strong> ${nombreUsuario}</p>
                        <p style="margin: 5px 0;"><strong>RUT:</strong> ${rutUsuario}</p>
                        <p style="margin: 5px 0;"><strong>Email:</strong> ${email}</p>
                        <p style="margin: 5px 0;"><strong>Celular:</strong> ${celular}</p>
                    </div>
                    
                    <p style="font-size: 14px; color: #475569;">Acceda al Mando Comercial para autorizar, bloquear o suspender este registro.</p>
                    <div style="margin-top: 30px; font-size: 12px; color: #94a3b8; text-align: center;">
                        © 2026 Centraliza-T | Empresa Synoptyk
                    </div>
                </div>
            `
        });
    } catch (emailError) {
        console.error('Error sending CEO notification email:', emailError);
        // We don't fail the registration if email fails, but it's recorded
    }

    res.status(201).json({
        success: true,
        message: 'Registro exitoso. Su cuenta ha sido creada y está pendiente de activación. Un administrador lo contactará a la brevedad para autorizar su acceso.'
    });
});

module.exports = { registerTrial };
