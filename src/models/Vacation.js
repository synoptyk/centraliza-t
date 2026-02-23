const mongoose = require('mongoose');

const vacationSchema = new mongoose.Schema({
    applicantId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Applicant',
        required: true,
        index: true
    },
    companyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Company',
        required: true,
        index: true
    },
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },
    daysRequested: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['Pendiente', 'Aprobado', 'Rechazado', 'Cancelado'],
        default: 'Pendiente'
    },
    type: {
        type: String,
        enum: ['Legal', 'Progresiva', 'Administrativo', 'Sin Goce de Sueldo'],
        default: 'Legal'
    },
    observations: String,
    approvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    approvalDate: Date,
    rejectionReason: String
}, { timestamps: true });

module.exports = mongoose.model('Vacation', vacationSchema);
