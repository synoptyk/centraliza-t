const mongoose = require('mongoose');

const CurriculumConfigSchema = new mongoose.Schema({
    companyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Company',
        required: true
    },

    // Master catalog of all available courses
    masterCourses: [{
        code: {
            type: String,
            required: true
        },
        name: {
            type: String,
            required: true
        },
        category: {
            type: String,
            enum: ['Seguridad', 'Técnico', 'Operacional', 'Administrativo', 'Salud'],
            default: 'Técnico'
        },
        description: String,
        validityMonths: {
            type: Number,
            default: 12
        },
        isActive: {
            type: Boolean,
            default: true
        },
        createdAt: {
            type: Date,
            default: Date.now
        }
    }],

    // Master catalog of all available exams
    masterExams: [{
        code: {
            type: String,
            required: true
        },
        name: {
            type: String,
            required: true
        },
        category: {
            type: String,
            enum: ['Médico', 'Psicológico', 'Técnico', 'Físico'],
            default: 'Médico'
        },
        description: String,
        validityMonths: {
            type: Number,
            default: 12
        },
        isActive: {
            type: Boolean,
            default: true
        },
        createdAt: {
            type: Date,
            default: Date.now
        }
    }],

    // Position-specific curriculum mapping
    positionCurriculum: [{
        position: {
            type: String,
            required: true
        },
        requiredCourses: [String], // Array of course codes
        requiredExams: [String],   // Array of exam codes
        additionalDocs: [String],  // Position-specific documents
        notes: String,
        createdAt: {
            type: Date,
            default: Date.now
        },
        updatedAt: {
            type: Date,
            default: Date.now
        }
    }]
}, {
    timestamps: true
});

// Index for faster queries
CurriculumConfigSchema.index({ companyId: 1 });
CurriculumConfigSchema.index({ 'positionCurriculum.position': 1 });

module.exports = mongoose.model('CurriculumConfig', CurriculumConfigSchema);
