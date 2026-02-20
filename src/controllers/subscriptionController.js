const SubscriptionPlan = require('../models/SubscriptionPlan');
const Subscription = require('../models/Subscription');
const Company = require('../models/Company');
const PromoCode = require('../models/PromoCode');
const asyncHandler = require('express-async-handler');

// @desc    Get all active plans (Public)
// @route   GET /api/subscriptions/plans
const getActivePlans = asyncHandler(async (req, res) => {
    console.log('--- GET /api/subscriptions/plans ---');
    const plans = await SubscriptionPlan.find({ isActive: true, isPublic: true });
    res.json(plans);
});

// @desc    Get subscription for my company
// @route   GET /api/subscriptions/my-subscription
const getMySubscription = asyncHandler(async (req, res) => {
    console.log(`--- GET /api/subscriptions/my-subscription for user ${req.user?._id} ---`);
    const subscription = await Subscription.findOne({ companyId: req.user.companyId })
        .populate('planId')
        .populate('companyId', 'name rut logo');

    if (!subscription) {
        return res.json(null);
    }

    res.json(subscription);
});

// @desc    Get Commercial Stats (CEO Only)
// @route   GET /api/subscriptions/stats
const getCommercialStats = asyncHandler(async (req, res) => {
    const activeSubscriptions = await Subscription.countDocuments({ status: 'Active' });
    const trialUsers = await Subscription.countDocuments({ status: 'Trial' });

    // Calcular ingresos reales en UF (Suma de precios de planes activos)
    const activeSubsData = await Subscription.find({ status: 'Active' }).populate('planId');
    const totalRevenueUF = activeSubsData.reduce((sum, sub) => sum + (sub.planId?.priceUF || 0), 0);

    // Tasa de conversión (de Trial a Active) - Cálculo simplificado para reporte
    const totalEver = await Subscription.countDocuments();
    const conversionRate = totalEver > 0 ? ((activeSubscriptions / totalEver) * 100).toFixed(1) + '%' : '0%';

    res.json({
        totalRevenueUF,
        activeSubscriptions,
        trialUsers,
        conversionRate
    });
});

// @desc    Get All Subscriptions (CEO Only)
// @route   GET /api/subscriptions/all
const getAllSubscriptions = asyncHandler(async (req, res) => {
    const subscriptions = await Subscription.find({})
        .populate('planId', 'name priceUF')
        .populate('companyId', 'name rut logo');
    res.json(subscriptions);
});

// @desc    Create a new plan (SuperAdmin Only)
// @route   POST /api/subscriptions/plans
const createPlan = asyncHandler(async (req, res) => {
    const { name, description, priceUF, limits, features, isTrial, isPublic } = req.body;

    const planExists = await SubscriptionPlan.findOne({ name });
    if (planExists) {
        res.status(400);
        throw new Error('Ya existe un plan con ese nombre');
    }

    const plan = await SubscriptionPlan.create({
        name,
        description,
        priceUF,
        limits,
        features,
        isTrial,
        isPublic
    });

    res.status(201).json(plan);
});

// @desc    Update a plan (SuperAdmin Only)
// @route   PUT /api/subscriptions/plans/:id
const updatePlan = asyncHandler(async (req, res) => {
    const plan = await SubscriptionPlan.findById(req.params.id);
    if (!plan) {
        res.status(404);
        throw new Error('Plan no encontrado');
    }

    const updatedPlan = await SubscriptionPlan.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true }
    );

    res.json(updatedPlan);
});

// @desc    Delete a plan (SuperAdmin Only)
// @route   DELETE /api/subscriptions/plans/:id
const deletePlan = asyncHandler(async (req, res) => {
    const plan = await SubscriptionPlan.findById(req.params.id);
    if (!plan) {
        res.status(404);
        throw new Error('Plan no encontrado');
    }

    await SubscriptionPlan.findByIdAndDelete(req.params.id);
    res.json({ message: 'Plan eliminado' });
});

// @desc    Update Subscription Status (CEO Only)
// @route   PUT /api/subscriptions/:id/status
const updateSubscriptionStatus = asyncHandler(async (req, res) => {
    const { status } = req.body;
    const subscription = await Subscription.findById(req.params.id);

    if (!subscription) {
        res.status(404);
        throw new Error('Suscripción no encontrada');
    }

    subscription.status = status;
    await subscription.save();

    res.json(subscription);
});

// @desc    Notify Client about Payment (CEO Only)
// @route   POST /api/subscriptions/:id/notify
const notifyClientPayment = asyncHandler(async (req, res) => {
    const subscription = await Subscription.findById(req.params.id)
        .populate('companyId')
        .populate('planId');

    if (!subscription) {
        res.status(404);
        throw new Error('Suscripción no encontrada');
    }

    // Buscar el administrador de la empresa para enviarle el correo
    const User = require('../models/User');
    const adminUser = await User.findOne({ companyId: subscription.companyId._id, role: 'Admin_Empresa' });

    if (!adminUser) {
        res.status(404);
        throw new Error('No se encontró un administrador para esta empresa');
    }

    const sendEmail = require('../utils/sendEmail');
    await sendEmail({
        email: adminUser.email,
        subject: `Recordatorio de Pago - Centraliza-T - ${subscription.companyId.name}`,
        message: `Estimado ${adminUser.name}, le recordamos que su suscripción al plan ${subscription.planId.name} vence el ${subscription.endDate.toLocaleDateString()}.`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 10px;">
                <h1 style="color: #4f46e5;">Recordatorio de Pago</h1>
                <p>Hola <strong>${adminUser.name}</strong>,</p>
                <p>Te escribimos de <strong>Centraliza-T</strong> para recordarte que tu suscripción está próxima a vencer.</p>
                <div style="background-color: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0;">
                    <p style="margin: 5px 0;"><strong>Empresa:</strong> ${subscription.companyId.name}</p>
                    <p style="margin: 5px 0;"><strong>Plan:</strong> ${subscription.planId.name}</p>
                    <p style="margin: 5px 0;"><strong>Vencimiento:</strong> ${subscription.endDate.toLocaleDateString()}</p>
                    <p style="margin: 5px 0;"><strong>Monto:</strong> ${subscription.planId.priceUF} UF</p>
                </div>
                <p>Para evitar interrupciones en el servicio, por favor gestionar el pago antes de la fecha indicada.</p>
                <p style="font-size: 12px; color: #64748b; margin-top: 30px;">Equipo Comercial Centraliza-T</p>
            </div>
        `
    });

    res.json({ message: 'Notificación enviada con éxito' });
});

// @desc    Initialize Trial for a Company
// @route   POST /api/subscriptions/init-trial/:companyId
const initializeTrial = asyncHandler(async (req, res) => {
    const companyId = req.params.companyId;

    // Check if trial plan exists
    const trialPlan = await SubscriptionPlan.findOne({ isTrial: true });
    if (!trialPlan) {
        res.status(404);
        throw new Error('Plan de Trial no configurado en el sistema');
    }

    // Check if company already has a subscription
    const existingSub = await Subscription.findOne({ companyId });
    if (existingSub) {
        res.status(400);
        throw new Error('La empresa ya tiene una suscripción o trial previo');
    }

    const subscription = await Subscription.create({
        companyId,
        planId: trialPlan._id,
        status: 'Trial',
        endDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000) // 15 Days
    });

    res.status(201).json(subscription);
});

// @desc    Simulate Payment / Integration with Mercado Pago (Skeleton)
// @route   POST /api/subscriptions/checkout
const createCheckoutSession = asyncHandler(async (req, res) => {
    const { planId, promoCode } = req.body;

    const plan = await SubscriptionPlan.findById(planId);
    if (!plan) {
        res.status(404);
        throw new Error('Plan no encontrado');
    }

    // Lógica de Descuento
    let finalPrice = plan.priceUF;
    if (promoCode === 'CENTRALIZA20') {
        finalPrice = finalPrice * 0.8;
    }

    // --- INTEGRACIÓN PRODUCCIÓN: MERCADO PAGO ---
    // En producción, aquí se generaría la preferencia real usando el SDK de Mercado Pago:
    // const preference = await mercadopago.preferences.create({ ... });
    // const checkoutUrl = preference.body.init_point;

    res.json({
        success: true,
        message: 'Sesión de Pago Generada Correctamente',
        plan: plan.name,
        amountUF: finalPrice,
        checkoutUrl: 'https://www.mercadopago.cl/checkout/simulado', // Reemplazar por init_point en producción
        isSimulation: process.env.NODE_ENV !== 'production'
    });
});

// --- PROMO CODES MANAGEMENT ---

// @desc    Get all promo codes (SuperAdmin Only)
// @route   GET /api/subscriptions/promos
const getPromoCodes = asyncHandler(async (req, res) => {
    const promos = await PromoCode.find({});
    res.json(promos);
});

// @desc    Create a promo code (SuperAdmin Only)
// @route   POST /api/subscriptions/promos
const createPromoCode = asyncHandler(async (req, res) => {
    const { code, discountValue, expiryDate, description } = req.body;

    const promoExists = await PromoCode.findOne({ code });
    if (promoExists) {
        res.status(400);
        throw new Error('El código ya existe');
    }

    const promo = await PromoCode.create({
        code,
        discountValue,
        expiryDate,
        description
    });

    res.status(201).json(promo);
});

module.exports = {
    getActivePlans,
    getMySubscription,
    getCommercialStats,
    getAllSubscriptions,
    createPlan,
    updatePlan,
    deletePlan,
    updateSubscriptionStatus,
    notifyClientPayment,
    initializeTrial,
    createCheckoutSession,
    getPromoCodes,
    createPromoCode
};
