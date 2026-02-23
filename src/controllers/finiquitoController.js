const Finiquito = require('../models/Finiquito');
const Applicant = require('../models/Applicant');
const asyncHandler = require('express-async-handler');
const { createInternalNotification } = require('./notificationController');

// @desc    Create a new Finiquito record
// @route   POST /api/finiquitos
const createFiniquito = asyncHandler(async (req, res) => {
    const {
        applicantId, causal, method, desglose,
        contractStartDate, contractEndDate, observations
    } = req.body;

    const applicant = await Applicant.findById(applicantId);
    if (!applicant) {
        res.status(404);
        throw new Error('Colaborador no encontrado.');
    }

    const finiquito = await Finiquito.create({
        applicantId,
        companyId: req.user.companyId,
        processedBy: req.user._id,
        causal,
        method: method || 'Notaría',
        desglose: desglose || {},
        contractStartDate: contractStartDate || applicant.workerData?.contract?.startDate,
        contractEndDate: contractEndDate || new Date(),
        observations,
        history: [{
            action: 'Finiquito creado',
            changedBy: req.user.name,
            details: `Causal: ${causal}`
        }]
    });

    // Also update the Applicant embedded finiquito for backwards compatibility
    if (applicant.workerData) {
        applicant.workerData.finiquito = {
            method: method || 'Notaría',
            observations,
            processedDate: new Date(),
            totalAPagar: desglose?.totalNeto || 0,
            causal,
            desglose
        };
        await applicant.save();
    }

    await createInternalNotification({
        companyId: req.user.companyId,
        title: 'Nuevo Finiquito Registrado',
        message: `Se ha registrado un finiquito para ${applicant.fullName} por causal "${causal}".`,
        type: 'ALERT',
        applicantId: applicant._id
    });

    res.status(201).json(finiquito);
});

// @desc    Get all finiquitos for a company
// @route   GET /api/finiquitos
const getFiniquitos = asyncHandler(async (req, res) => {
    const filter = { companyId: req.user.companyId };
    if (req.query.status) filter.status = req.query.status;
    if (req.query.causal) filter.causal = req.query.causal;

    // Date range filter
    if (req.query.from || req.query.to) {
        filter.processedDate = {};
        if (req.query.from) filter.processedDate.$gte = new Date(req.query.from);
        if (req.query.to) filter.processedDate.$lte = new Date(req.query.to);
    }

    const finiquitos = await Finiquito.find(filter)
        .populate('applicantId', 'fullName rut position')
        .populate('processedBy', 'name')
        .sort({ processedDate: -1 });

    res.json(finiquitos);
});

// @desc    Get single finiquito
// @route   GET /api/finiquitos/:id
const getFiniquitoById = asyncHandler(async (req, res) => {
    const finiquito = await Finiquito.findById(req.params.id)
        .populate('applicantId', 'fullName rut position email phone workerData')
        .populate('processedBy', 'name email');

    if (!finiquito) {
        res.status(404);
        throw new Error('Finiquito no encontrado.');
    }

    res.json(finiquito);
});

// @desc    Update finiquito status
// @route   PUT /api/finiquitos/:id/status
const updateFiniquitoStatus = asyncHandler(async (req, res) => {
    const { status, notarizedDate } = req.body;
    const finiquito = await Finiquito.findById(req.params.id);

    if (!finiquito) {
        res.status(404);
        throw new Error('Finiquito no encontrado.');
    }

    finiquito.status = status;
    if (notarizedDate) finiquito.notarizedDate = notarizedDate;
    finiquito.history.push({
        action: `Estado actualizado a "${status}"`,
        changedBy: req.user.name,
        details: notarizedDate ? `Fecha notaría: ${new Date(notarizedDate).toLocaleDateString()}` : ''
    });

    await finiquito.save();
    res.json(finiquito);
});

// @desc    Get finiquito report (totals, costs)
// @route   GET /api/finiquitos/report
const getFiniquitoReport = asyncHandler(async (req, res) => {
    const filter = { companyId: req.user.companyId };
    if (req.query.year) {
        const year = parseInt(req.query.year);
        filter.processedDate = {
            $gte: new Date(year, 0, 1),
            $lte: new Date(year, 11, 31)
        };
    }

    const finiquitos = await Finiquito.find(filter).lean();

    const report = {
        total: finiquitos.length,
        totalCostoBruto: finiquitos.reduce((sum, f) => sum + (f.desglose?.totalBruto || 0), 0),
        totalCostoNeto: finiquitos.reduce((sum, f) => sum + (f.desglose?.totalNeto || 0), 0),
        porCausal: {},
        porEstado: {},
        porMes: {}
    };

    finiquitos.forEach(f => {
        // By causal
        report.porCausal[f.causal] = (report.porCausal[f.causal] || 0) + 1;
        // By status
        report.porEstado[f.status] = (report.porEstado[f.status] || 0) + 1;
        // By month
        if (f.processedDate) {
            const month = new Date(f.processedDate).toISOString().slice(0, 7);
            report.porMes[month] = (report.porMes[month] || 0) + 1;
        }
    });

    res.json(report);
});

module.exports = {
    createFiniquito,
    getFiniquitos,
    getFiniquitoById,
    updateFiniquitoStatus,
    getFiniquitoReport
};
