const express = require('express');
const router = express.Router();
const {
    getActivePlans,
    getMySubscription,
    createPlan,
    updatePlan,
    deletePlan,
    initializeTrial,
    createCheckoutSession,
    getPromoCodes,
    createPromoCode,
    getCommercialStats,
    getAllSubscriptions,
    updateSubscriptionStatus,
    notifyClientPayment
} = require('../controllers/subscriptionController');
const { protect, authorize } = require('../middleware/authMiddleware');

console.log('--- SUBSCRIPTION ROUTES LOADED ---');

// Public / Authenticated Routes
router.get('/v2-ping', (req, res) => res.json({ status: 'OK', version: '2.0', subscriptions_active: true }));
router.get('/test', (req, res) => res.json({ message: 'Rutas de suscripción activas' }));
router.get('/plans', protect, getActivePlans);
router.get('/my-subscription', protect, getMySubscription);
router.post('/checkout', protect, createCheckoutSession);

// Admin Routes (CEO Centralizat Only)
router.get('/stats', protect, authorize('Ceo_Centralizat'), getCommercialStats);
router.get('/all', protect, authorize('Ceo_Centralizat'), getAllSubscriptions);
router.get('/promos', protect, authorize('Ceo_Centralizat'), getPromoCodes);
router.post('/promos', protect, authorize('Ceo_Centralizat'), createPromoCode);
router.post('/plans', protect, authorize('Ceo_Centralizat'), createPlan);
router.put('/plans/:id', protect, authorize('Ceo_Centralizat'), updatePlan);
router.delete('/plans/:id', protect, authorize('Ceo_Centralizat'), deletePlan);
router.put('/:id/status', protect, authorize('Ceo_Centralizat'), updateSubscriptionStatus);
router.post('/:id/notify', protect, authorize('Ceo_Centralizat'), notifyClientPayment);
router.post('/init-trial/:companyId', protect, authorize('Ceo_Centralizat'), initializeTrial);

module.exports = router;
