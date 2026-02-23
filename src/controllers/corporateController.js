const asyncHandler = require('express-async-handler');
const CompanyRequest = require('../models/CompanyRequest');
const Company = require('../models/Company');

const validateRut = (rut) => {
    if (!rut || typeof rut !== 'string') return false;
    const cleaned = rut.replace(/[^0-9kK]/g, '').toUpperCase();
    if (cleaned.length < 8) return false;
    const body = cleaned.slice(0, -1);
    const dv = cleaned.slice(-1);
    let sum = 0;
    let multiplier = 2;
    for (let i = body.length - 1; i >= 0; i--) {
        sum += parseInt(body.charAt(i)) * multiplier;
        multiplier = multiplier === 7 ? 2 : multiplier + 1;
    }
    const expectedDv = 11 - (sum % 11);
    const dvString = expectedDv === 11 ? '0' : expectedDv === 10 ? 'K' : expectedDv.toString();
    return dv === dvString;
};

// @desc    Register a new corporate request (Public)
// @route   POST /api/professionals/public/corporate-register
// @access  Public
const registerCorporateRequest = asyncHandler(async (req, res) => {
    const {
        companyRut,
        companyName,
        companyRegion,
        projectOrArea,
        requiredPosition,
        workRegion,
        workCommune,
        hrContact,
        hrEmail,
        projectedHiringDate,
        companyId
    } = req.body;

    if (!companyId) {
        res.status(400);
        throw new Error('ID de Agencia no proporcionado');
    }

    if (!validateRut(companyRut)) {
        res.status(400);
        throw new Error('RUT de Empresa no válido');
    }

    const corporateRequest = await CompanyRequest.create({
        companyRut,
        companyName,
        companyRegion,
        projectOrArea,
        requiredPosition,
        workRegion,
        workCommune,
        hrContact,
        hrEmail,
        projectedHiringDate,
        companyId
    });

    if (corporateRequest) {
        res.status(201).json({
            message: 'Solicitud enviada con éxito. Un ejecutivo se contactará con ustedes.',
            id: corporateRequest._id
        });
    } else {
        res.status(400);
        throw new Error('Error al enviar la solicitud');
    }
});

// @desc    Get all corporate requests for an agency
// @route   GET /api/professionals/corporate
// @access  Private (Agency only)
const getCorporateRequests = asyncHandler(async (req, res) => {
    const requests = await CompanyRequest.find({ companyId: req.user.companyId }).sort({ createdAt: -1 });
    res.json(requests);
});

module.exports = {
    registerCorporateRequest,
    getCorporateRequests
};
