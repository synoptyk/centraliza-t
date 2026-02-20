const Subscription = require('../models/Subscription');
const User = require('../models/User');
const Project = require('../models/Project');
const asyncHandler = require('express-async-handler');

/**
 * @desc    Middleware para validar que la empresa tenga una suscripción activa
 */
const checkSubscriptionStatus = asyncHandler(async (req, res, next) => {
    // Si es SuperAdmin, saltar validación
    if (req.user.role === 'Ceo_Centralizat' || req.user.role === 'Admin_Centralizat') {
        return next();
    }

    if (!req.user.companyId) {
        res.status(403);
        throw new Error('El usuario no pertenece a ninguna empresa vinculada.');
    }

    const subscription = await Subscription.findOne({ companyId: req.user.companyId }).populate('planId');

    if (!subscription) {
        res.status(403);
        throw new Error('Su empresa no cuenta con una suscripción activa para operar.');
    }

    // Validar status: Solo 'Active' y 'Trial' pueden operar
    const allowedStatuses = ['Active', 'Trial'];
    if (!allowedStatuses.includes(subscription.status)) {
        res.status(403);
        throw new Error(`Suscripción Bloqueada: El estado actual es '${subscription.status}'. Por favor, regularice su cuenta comercial.`);
    }

    // Validar fecha de expiración
    if (new Date(subscription.endDate) < new Date()) {
        res.status(403);
        throw new Error('Suscripción Expirada: La fecha de vigencia ha caducado. Favor de renovar su plan.');
    }

    // Inyectar suscripción en el objeto req para uso posterior en limites
    req.subscription = subscription;
    next();
});

/**
 * @desc    Middleware para validar límites de recursos (Proyectos, Usuarios)
 */
const checkResourceLimits = (resourceType) => asyncHandler(async (req, res, next) => {
    // Si es SuperAdmin, saltar validación
    if (req.user.role === 'Ceo_Centralizat' || req.user.role === 'Admin_Centralizat') {
        return next();
    }

    const { subscription } = req;
    if (!subscription || !subscription.planId) {
        res.status(403);
        throw new Error('No se pudo validar el plan de suscripción.');
    }

    const limits = subscription.planId.limits;

    if (resourceType === 'users') {
        const userCount = await User.countDocuments({ companyId: req.user.companyId });
        if (userCount >= limits.adminUsers) {
            res.status(403);
            throw new Error(`Límite Alcanzado: Su plan '${subscription.planId.name}' solo permite ${limits.adminUsers} usuarios. Favor de realizar un Upgrade.`);
        }
    }

    if (resourceType === 'projects') {
        const projectCount = await Project.countDocuments({ companyId: req.user.companyId });
        if (projectCount >= (limits.projects || 10)) {
            res.status(403);
            throw new Error(`Límite Alcanzado: Su plan '${subscription.planId.name}' solo permite ${limits.projects || 10} proyectos activos. Favor de realizar un Upgrade.`);
        }
    }

    if (resourceType === 'applicants') {
        const Applicant = require('../models/Applicant'); // Carga dinámica para evitar dependencias circulares si aplica
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);

        const applicantCount = await Applicant.countDocuments({
            companyId: req.user.companyId,
            createdAt: { $gte: startOfMonth }
        });

        if (applicantCount >= limits.monthlyApplicants) {
            res.status(403);
            throw new Error(`Cuota Mensual Agotada: Su plan '${subscription.planId.name}' permite ${limits.monthlyApplicants} postulantes al mes. Ha alcanzado el límite para el periodo actual.`);
        }
    }

    next();
});

module.exports = { checkSubscriptionStatus, checkResourceLimits };
