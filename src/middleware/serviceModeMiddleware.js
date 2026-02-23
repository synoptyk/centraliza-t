const asyncHandler = require('express-async-handler');
const Company = require('../models/Company');

/**
 * @desc    Middleware to block RECRUITMENT_ONLY companies from accessing HR 360 features.
 *          Must be used AFTER the 'protect' middleware (which sets req.user).
 */
const requireFullHR = asyncHandler(async (req, res, next) => {
    // SuperAdmins always pass
    if (req.user.role === 'Ceo_Centralizat' || req.user.role === 'Admin_Centralizat') {
        return next();
    }

    // Users without a company pass (shouldn't happen if 'protect' ran, but just in case)
    if (!req.user.companyId) {
        return next();
    }

    const company = await Company.findById(req.user.companyId).select('serviceMode').lean();

    if (!company) {
        res.status(403);
        throw new Error('Empresa no encontrada.');
    }

    if (company.serviceMode === 'RECRUITMENT_ONLY') {
        res.status(403);
        throw new Error('Esta funcionalidad no está disponible para cuentas de tipo Agencia de Reclutamiento. Actualice su plan a HR 360 para acceder.');
    }

    next();
});

module.exports = { requireFullHR };
