const DisciplinaryAction = require('../models/DisciplinaryAction');
const Commendation = require('../models/Commendation');
const Applicant = require('../models/Applicant');
const asyncHandler = require('express-async-handler');
const { createInternalNotification } = require('./notificationController');

// @desc    Create a new disciplinary action
// @route   POST /api/records/disciplinary
const createDisciplinaryAction = asyncHandler(async (req, res) => {
    const { applicantId, type, severity, reason, incidentDetails, internalRegArticle, fineAmount, date, observations } = req.body;

    const applicant = await Applicant.findById(applicantId);
    if (!applicant) {
        res.status(404);
        throw new Error('Colaborador no encontrado');
    }

    const action = await DisciplinaryAction.create({
        applicantId,
        companyId: req.user.companyId,
        managerId: req.user._id,
        type,
        severity,
        reason,
        incidentDetails,
        internalRegArticle,
        fineAmount: type === 'Multa' ? fineAmount : 0,
        date: date || new Date(),
        observations
    });

    // Notify employee (Internal Notification System)
    await createInternalNotification({
        companyId: req.user.companyId,
        title: `Nueva ${type}`,
        message: `Se ha registrado una ${type.toLowerCase()} (${severity}) con fecha ${new Date(date || new Date()).toLocaleDateString()}. Por favor revise su expediente.`,
        type: 'ALERT',
        applicantId: applicant._id
    });

    res.status(201).json(action);
});

// @desc    Get all disciplinary actions for a company (or filtered by applicant)
// @route   GET /api/records/disciplinary
const getDisciplinaryActions = asyncHandler(async (req, res) => {
    const filter = { companyId: req.user.companyId };
    if (req.query.applicantId) filter.applicantId = req.query.applicantId;
    if (req.query.status) filter.status = req.query.status;

    const actions = await DisciplinaryAction.find(filter)
        .populate('applicantId', 'fullName rut position')
        .populate('managerId', 'name')
        .sort({ date: -1 });

    res.json(actions);
});

// @desc    Create a new commendation
// @route   POST /api/records/commendations
const createCommendation = asyncHandler(async (req, res) => {
    const { applicantId, title, category, reason, date, isPublic } = req.body;

    const applicant = await Applicant.findById(applicantId);
    if (!applicant) {
        res.status(404);
        throw new Error('Colaborador no encontrado');
    }

    const commendation = await Commendation.create({
        applicantId,
        companyId: req.user.companyId,
        managerId: req.user._id,
        title,
        category,
        reason,
        date: date || new Date(),
        isPublic: isPublic !== undefined ? isPublic : true
    });

    // Notify employee (Internal Notification System)
    await createInternalNotification({
        companyId: req.user.companyId,
        title: '¡Felicitaciones! ✨',
        message: `Has recibido un reconocimiento por "${title}" en la categoría ${category}. ¡Buen trabajo, ${applicant.fullName.split(' ')[0]}!`,
        type: 'APPROVAL',
        applicantId: applicant._id
    });

    res.status(201).json(commendation);
});

// @desc    Get all commendations for a company
// @route   GET /api/records/commendations
const getCommendations = asyncHandler(async (req, res) => {
    const filter = { companyId: req.user.companyId };
    if (req.query.applicantId) filter.applicantId = req.query.applicantId;
    if (req.query.isPublic) filter.isPublic = req.query.isPublic === 'true';

    const commendations = await Commendation.find(filter)
        .populate('applicantId', 'fullName rut position')
        .populate('managerId', 'name')
        .sort({ date: -1 });

    res.json(commendations);
});

// @desc    Acknowledge/Sign disciplinary action
// @route   PUT /api/records/disciplinary/:id/sign
const signDisciplinaryAction = asyncHandler(async (req, res) => {
    const action = await DisciplinaryAction.findById(req.params.id);
    if (!action) {
        res.status(404);
        throw new Error('Registro no encontrado');
    }

    action.status = 'Firmado';
    action.signatures.employee = {
        signedAt: new Date(),
        ipAddress: req.ip || 'Local',
        userAgent: req.get('user-agent')
    };

    await action.save();
    res.json(action);
});

module.exports = {
    createDisciplinaryAction,
    getDisciplinaryActions,
    createCommendation,
    getCommendations,
    signDisciplinaryAction
};
