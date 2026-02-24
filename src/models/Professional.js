const mongoose = require('mongoose');

const professionalSchema = new mongoose.Schema({
    rut: {
        type: String,
        required: true,
        index: true
    },
    fullName: {
        type: String,
        required: true
    },
    birthDate: {
        type: Date,
        required: true
    },
    studies: {
        type: String,
        required: true
    },
    specialty: {
        type: String,
        required: true
    },
    nationality: {
        type: String,
        required: true
    },
    gender: {
        type: String,
        required: true
    },
    region: {
        type: String,
        required: true
    },
    commune: {
        type: String,
        required: true
    },
    workingStatus: {
        type: String,
        enum: ['Trabajando', 'Disponibilidad Inmediata'],
        required: true
    },
    email: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    cvUrl: {
        type: String
    },
    observations: {
        type: String
    },
    companyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Company',
        required: true,
        index: true
    }
}, { timestamps: true });

// Ensure uniqueness of RUT per Company (Agency)
professionalSchema.index({ rut: 1, companyId: 1 }, { unique: true });

module.exports = mongoose.model('Professional', professionalSchema);
