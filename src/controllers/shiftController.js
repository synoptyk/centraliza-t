const Shift = require('../models/Shift');
const Schedule = require('../models/Schedule');
const asyncHandler = require('express-async-handler');

// @desc    Create a new shift
// @route   POST /api/shifts
// @access  Private (Admin)
const createShift = asyncHandler(async (req, res) => {
    const { name, startTime, endTime, breakTime, isDefault } = req.body;
    const companyId = req.user.companyId;

    if (!name || !startTime || !endTime) {
        res.status(400);
        throw new Error('Nombre, hora de inicio y término son requeridos');
    }

    // If setting as default, unset other defaults for this company
    if (isDefault) {
        await Shift.updateMany({ companyId }, { isDefault: false });
    }

    const shift = await Shift.create({
        companyId,
        name,
        startTime,
        endTime,
        breakTime,
        isDefault
    });

    res.status(201).json(shift);
});

// @desc    Get all shifts for a company
// @route   GET /api/shifts
// @access  Private
const getShifts = asyncHandler(async (req, res) => {
    const companyId = req.user.companyId;
    const shifts = await Shift.find({ companyId });
    res.json(shifts);
});

// @desc    Assign a schedule to a worker
// @route   POST /api/shifts/assign
// @access  Private (Admin)
const assignSchedule = asyncHandler(async (req, res) => {
    const { workerId, shifts, validFrom, validTo } = req.body;
    const companyId = req.user.companyId;

    if (!workerId || !shifts || shifts.length === 0) {
        res.status(400);
        throw new Error('Colaborador y turnos son requeridos');
    }

    // Deactivate previous schedules
    await Schedule.updateMany({ workerId, companyId, isActive: true }, { isActive: false, validTo: new Date() });

    const schedule = await Schedule.create({
        workerId,
        companyId,
        shifts,
        validFrom: validFrom || new Date(),
        validTo,
        isActive: true
    });

    res.status(201).json(schedule);
});

// @desc    Get schedule for a specific worker
// @route   GET /api/shifts/schedule/:workerId
// @access  Private
const getWorkerSchedule = asyncHandler(async (req, res) => {
    const { workerId } = req.params;
    const companyId = req.user.companyId;

    const schedule = await Schedule.findOne({ workerId, companyId, isActive: true })
        .populate('shifts.shiftId');

    res.json(schedule);
});

module.exports = {
    createShift,
    getShifts,
    assignSchedule,
    getWorkerSchedule
};
