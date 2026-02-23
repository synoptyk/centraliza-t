const mongoose = require('mongoose');

const companyRequestSchema = new mongoose.Schema({
    companyRut: {
        type: String,
        required: true,
        index: true
    },
    companyName: {
        type: String,
        required: true
    },
    companyRegion: {
        type: String,
        required: true
    },
    projectOrArea: {
        type: String,
        required: true
    },
    requiredPosition: {
        type: String,
        required: true
    },
    workRegion: {
        type: String,
        required: true
    },
    workCommune: {
        type: String,
        required: true
    },
    hrContact: {
        type: String,
        required: true
    },
    hrEmail: {
        type: String,
        required: true
    },
    projectedHiringDate: {
        type: Date,
        required: true
    },
    companyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Company',
        required: true,
        index: true
    },
    status: {
        type: String,
        enum: ['Nuevo', 'Contactado', 'Cerrado'],
        default: 'Nuevo'
    }
}, { timestamps: true });

module.exports = mongoose.model('CompanyRequest', companyRequestSchema);
