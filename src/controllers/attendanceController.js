const Attendance = require('../models/Attendance');
const Applicant = require('../models/Applicant');
const asyncHandler = require('express-async-handler');
const crypto = require('crypto');
const sendEmail = require('../utils/sendEmail');

// Helper to generate hash for data integrity
const generateAttendanceHash = (data) => {
    const salt = process.env.ATTENDANCE_SALT || 'centralizat_secure_salt';
    return crypto
        .createHash('sha256')
        .update(JSON.stringify(data) + salt)
        .digest('hex');
};

// @desc    Register worker attendance
// @route   POST /api/attendance/register
// @access  Private (Worker)
const registerAttendance = asyncHandler(async (req, res) => {
    const { type, coordinates, deviceInfo } = req.body;
    const workerId = req.user._id;
    const companyId = req.user.companyId;

    if (!type || !coordinates) {
        res.status(400);
        throw new Error('Tipo de marca y coordenadas son requeridos');
    }

    const timestamp = new Date();
    const transactionId = `${workerId}-${timestamp.getTime()}`;

    // Prepare data for hashing
    const hashData = {
        workerId,
        companyId,
        timestamp,
        type,
        coordinates,
        transactionId
    };

    const hash = generateAttendanceHash(hashData);

    const attendance = await Attendance.create({
        workerId,
        companyId,
        timestamp,
        type,
        location: {
            type: 'Point',
            coordinates: coordinates // [long, lat]
        },
        deviceInfo: {
            ip: req.ip,
            userAgent: req.headers['user-agent'],
            ...deviceInfo
        },
        hash,
        transactionId
    });

    if (attendance) {
        // Find worker to get email
        const worker = await Applicant.findById(workerId);

        if (worker && worker.email) {
            try {
                // Send automated receipt (DT requirement)
                await sendEmail({
                    email: worker.email,
                    subject: `Comprobante de Asistencia: ${type}`,
                    html: `
                        <div style="font-family: sans-serif; max-width: 500px; margin: auto; border: 1px solid #eee; padding: 20px; border-radius: 15px;">
                            <h2 style="color: #4f46e5; text-align: center;">Comprobante de Asistencia</h2>
                            <p>Estimado/a <strong>${worker.fullName}</strong>,</p>
                            <p>Se ha registrado exitosamente tu marca en el sistema.</p>
                            <div style="background: #f8fafc; padding: 15px; border-radius: 10px; margin: 20px 0;">
                                <p><strong>Tipo:</strong> ${type}</p>
                                <p><strong>Fecha/Hora:</strong> ${timestamp.toLocaleString('es-CL')}</p>
                                <p><strong>ID Transacción:</strong> <span style="font-size: 10px; color: #64748b;">${transactionId}</span></p>
                            </div>
                            <p style="font-size: 11px; color: #94a3b8; text-align: center;">Este es un comprobante automático generado por Centraliza-T para fines legales.</p>
                        </div>
                    `
                });
                attendance.receiptSent = true;
                await attendance.save();
            } catch (err) {
                console.error('Error sending attendance email:', err);
            }
        }

        res.status(201).json(attendance);
    } else {
        res.status(400);
        throw new Error('Error al registrar asistencia');
    }
});

// @desc    Get current worker attendance history
// @route   GET /api/attendance/my-history
// @access  Private (Worker)
const getMyAttendance = asyncHandler(async (req, res) => {
    const attendance = await Attendance.find({ workerId: req.user._id })
        .sort({ timestamp: -1 })
        .limit(30);
    res.json(attendance);
});

// @desc    Get company attendance (Admin/CEO)
// @route   GET /api/attendance/company
// @access  Private (Admin/CEO)
const getCompanyAttendance = asyncHandler(async (req, res) => {
    let query = {};
    if (req.user.role !== 'Ceo_Centralizat' && req.user.role !== 'Admin_Centralizat') {
        query.companyId = req.user.companyId;
    }

    const { startDate, endDate, workerId } = req.query;
    if (startDate && endDate) {
        query.timestamp = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }
    if (workerId) {
        query.workerId = workerId;
    }

    const attendance = await Attendance.find(query)
        .populate('workerId', 'fullName rut position')
        .sort({ timestamp: -1 });

    res.json(attendance);
});

module.exports = {
    registerAttendance,
    getMyAttendance,
    getCompanyAttendance
};
