const asyncHandler = require('express-async-handler');
const Professional = require('../models/Professional');
const Company = require('../models/Company');

// @desc    Register a new professional (Public)
// @route   POST /api/professionals/public/register
// @access  Public
const registerProfessional = asyncHandler(async (req, res) => {
    const {
        rut,
        fullName,
        birthDate,
        studies,
        specialty,
        nationality,
        gender,
        region,
        email,
        phone,
        cvUrl,
        companyId
    } = req.body;

    if (!companyId) {
        res.status(400);
        throw new Error('ID de Agencia no proporcionado');
    }

    // Verify company exists and is a recruitment agency
    const company = await Company.findById(companyId);
    if (!company || company.serviceMode !== 'RECRUITMENT_ONLY') {
        res.status(404);
        throw new Error('Agencia no válida o no autorizada para captación');
    }

    // Check if professional already registered for this agency
    const existing = await Professional.findOne({ rut, companyId });
    if (existing) {
        res.status(400);
        throw new Error('Este RUT ya está registrado en nuestra cartera');
    }

    const professional = await Professional.create({
        rut,
        fullName,
        birthDate,
        studies,
        specialty,
        nationality,
        gender,
        region,
        email,
        phone,
        cvUrl,
        companyId
    });

    if (professional) {
        res.status(201).json({
            message: 'Registro exitoso. ¡Gracias por unirte a nuestra cartera!',
            id: professional._id
        });
    } else {
        res.status(400);
        throw new Error('Error al registrar el profesional');
    }
});

// @desc    Get all professionals for an agency
// @route   GET /api/professionals
// @access  Private (Agency only)
const getProfessionals = asyncHandler(async (req, res) => {
    const { specialty, region, search } = req.query;

    let query = { companyId: req.user.companyId };

    if (specialty) query.specialty = { $regex: specialty, $options: 'i' };
    if (region) query.region = region;
    if (search) {
        query.$or = [
            { fullName: { $regex: search, $options: 'i' } },
            { rut: { $regex: search, $options: 'i' } }
        ];
    }

    const professionals = await Professional.find(query).sort({ createdAt: -1 });
    res.json(professionals);
});

// @desc    Delete a professional from portfolio
// @route   DELETE /api/professionals/:id
// @access  Private (Agency only)
const deleteProfessional = asyncHandler(async (req, res) => {
    const professional = await Professional.findOne({
        _id: req.params.id,
        companyId: req.user.companyId
    });

    if (professional) {
        await professional.deleteOne();
        res.json({ message: 'Profesional eliminado de la cartera' });
    } else {
        res.status(404);
        throw new Error('Profesional no encontrado');
    }
});

module.exports = {
    registerProfessional,
    getProfessionals,
    deleteProfessional
};
