const mongoose = require('mongoose');

const disciplinaryActionSchema = new mongoose.Schema({
    applicantId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Applicant',
        required: true
    },
    companyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Company',
        required: true,
        index: true
    },
    managerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    type: {
        type: String,
        enum: ['Amonestación Verbal', 'Amonestación Escrita', 'Multa'],
        required: true
    },
    severity: {
        type: String,
        enum: ['Leve', 'Grave', 'Gravísima'],
        default: 'Leve'
    },
    date: {
        type: Date,
        default: Date.now,
        required: true
    },
    reason: {
        type: String,
        required: true
    },
    incidentDetails: {
        type: String,
        required: true
    },
    internalRegArticle: {
        type: String,
        required: true,
        default: 'Art. 154 Reglamento Interno'
    },
    fineAmount: {
        type: Number,
        default: 0
    },
    attachments: [{
        url: String,
        publicId: String,
        fileName: String,
        uploadDate: { type: Date, default: Date.now }
    }],
    status: {
        type: String,
        enum: ['Borrador', 'Notificado', 'Firmado', 'Apelado', 'Anulado'],
        default: 'Notificado'
    },
    signatures: {
        employee: {
            signedAt: Date,
            ipAddress: String,
            userAgent: String
        },
        manager: {
            signedAt: { type: Date, default: Date.now }
        }
    },
    notifiedAt: Date,
    observations: String
}, { timestamps: true });

// Index for reporting
disciplinaryActionSchema.index({ applicantId: 1, date: -1 });

module.exports = mongoose.model('DisciplinaryAction', disciplinaryActionSchema);
