const mongoose = require('mongoose');

const commendationSchema = new mongoose.Schema({
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
    title: {
        type: String,
        required: true
    },
    category: {
        type: String,
        enum: ['Productividad', 'Valores', 'Seguridad', 'Innovación', 'Compañerismo', 'Otro'],
        default: 'Valores'
    },
    reason: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now,
        required: true
    },
    isPublic: {
        type: Boolean,
        default: true
    },
    attachments: [{
        url: String,
        publicId: String,
        fileName: String
    }]
}, { timestamps: true });

// Index for performance
commendationSchema.index({ companyId: 1, date: -1 });

module.exports = mongoose.model('Commendation', commendationSchema);
