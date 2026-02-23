const Vacation = require('../models/Vacation');
const Applicant = require('../models/Applicant');
const asyncHandler = require('express-async-handler');
const mongoose = require('mongoose');
const { createInternalNotification } = require('./notificationController');

// Helper to calculate business days between two dates (excluding weekends)
const calculateBusinessDays = (startDate, endDate) => {
    let count = 0;
    const curDate = new Date(startDate);
    while (curDate <= endDate) {
        const dayOfWeek = curDate.getDay();
        if (dayOfWeek !== 0 && dayOfWeek !== 6) count++;
        curDate.setDate(curDate.getDate() + 1);
    }
    return count;
};

// @desc    Calculate and update vacation balance for an employee
// @route   POST /api/vacations/sync/:applicantId
const syncVacationBalance = asyncHandler(async (req, res) => {
    const applicant = await Applicant.findById(req.params.applicantId);
    if (!applicant) {
        res.status(404);
        throw new Error('Colaborador no encontrado');
    }

    const startDate = applicant.workerData?.contract?.startDate;
    if (!startDate) {
        res.status(400);
        throw new Error('El colaborador no tiene fecha de inicio de contrato definida');
    }

    const today = new Date();
    const start = new Date(startDate);

    // Total months worked
    let months = (today.getFullYear() - start.getFullYear()) * 12 + (today.getMonth() - start.getMonth());
    if (today.getDate() < start.getDate()) months--;

    const accruedTotal = months * 1.25;

    // Get all approved vacations to calculate taken days
    const approvedVacations = await Vacation.find({
        applicantId: applicant._id,
        status: 'Aprobado'
    });

    const takenDays = approvedVacations.reduce((acc, v) => acc + v.daysRequested, 0);

    applicant.workerData.vacations = {
        accruedDays: accruedTotal,
        takenDays: takenDays,
        pendingDays: accruedTotal - takenDays,
        lastCalculationDate: new Date()
    };

    await applicant.save();
    res.json(applicant.workerData.vacations);
});

// @desc    Request new vacation
// @route   POST /api/vacations
const requestVacation = asyncHandler(async (req, res) => {
    const { applicantId, startDate, endDate, type, observations } = req.body;

    const applicant = await Applicant.findById(applicantId);
    if (!applicant) {
        res.status(404);
        throw new Error('Colaborador no encontrado');
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    const daysRequested = calculateBusinessDays(start, end);

    const vacation = await Vacation.create({
        applicantId,
        companyId: applicant.companyId,
        startDate: start,
        endDate: end,
        daysRequested,
        type: type || 'Legal',
        observations
    });

    // Notify admins
    await createInternalNotification({
        companyId: applicant.companyId,
        title: 'Nueva Solicitud de Vacaciones',
        message: `${applicant.fullName} ha solicitado ${daysRequested} días de vacaciones (${type || 'Legal'}) del ${start.toLocaleDateString()} al ${end.toLocaleDateString()}.`,
        type: 'PENDING',
        applicantId: applicant._id
    });

    res.status(201).json(vacation);
});

// @desc    Get vacations for a company
// @route   GET /api/vacations
const getVacations = asyncHandler(async (req, res) => {
    const filter = { companyId: req.user.companyId };
    if (req.query.applicantId) filter.applicantId = req.query.applicantId;
    if (req.query.status) filter.status = req.query.status;

    // Filter by month (YYYY-MM) if provided
    if (req.query.month) {
        const [year, month] = req.query.month.split('-');
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0); // Last day of month

        filter.$or = [
            { startDate: { $gte: startDate, $lte: endDate } },
            { endDate: { $gte: startDate, $lte: endDate } },
            { startDate: { $lte: startDate }, endDate: { $gte: endDate } }
        ];
    }

    const vacations = await Vacation.find(filter)
        .populate('applicantId', 'fullName rut position')
        .sort({ startDate: -1 });

    res.json(vacations);
});

// @desc    Approve/Reject vacation request
// @route   PUT /api/vacations/:id/status
const updateVacationStatus = asyncHandler(async (req, res) => {
    const { status, rejectionReason } = req.body;
    const vacation = await Vacation.findById(req.params.id);

    if (!vacation) {
        res.status(404);
        throw new Error('Solicitud no encontrada');
    }

    vacation.status = status;
    if (status === 'Aprobado') {
        vacation.approvedBy = req.user._id;
        vacation.approvalDate = new Date();
    } else if (status === 'Rechazado') {
        vacation.rejectionReason = rejectionReason;
    }

    await vacation.save();

    // Re-sync balance for the applicant
    const applicant = await Applicant.findById(vacation.applicantId);

    // Notify about decision
    await createInternalNotification({
        companyId: vacation.companyId,
        title: `Solicitud de Vacaciones ${status}`,
        message: `La solicitud de vacaciones de ${applicant?.fullName || 'Colaborador'} para el período ${new Date(vacation.startDate).toLocaleDateString()} - ${new Date(vacation.endDate).toLocaleDateString()} ha sido ${status.toLowerCase()}. ${rejectionReason ? 'Motivo: ' + rejectionReason : ''}`,
        type: status === 'Aprobado' ? 'APPROVAL' : 'ALERT',
        applicantId: vacation.applicantId
    });

    if (applicant) {
        // Simple sync logic repeated here or call the sync function
        const start = new Date(applicant.workerData.contract.startDate);
        const today = new Date();
        let months = (today.getFullYear() - start.getFullYear()) * 12 + (today.getMonth() - start.getMonth());
        if (today.getDate() < start.getDate()) months--;
        const accruedTotal = months * 1.25;

        const allApproved = await Vacation.find({ applicantId: applicant._id, status: 'Aprobado' });
        const taken = allApproved.reduce((acc, v) => acc + v.daysRequested, 0);

        applicant.workerData.vacations = {
            accruedDays: accruedTotal,
            takenDays: taken,
            pendingDays: accruedTotal - taken,
            lastCalculationDate: new Date()
        };
        await applicant.save();
    }

    res.json(vacation);
});

module.exports = {
    syncVacationBalance,
    requestVacation,
    getVacations,
    updateVacationStatus
};
