const mongoose = require('mongoose');

const scheduleSchema = new mongoose.Schema({
    workerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Applicant',
        required: true
    },
    companyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Company',
        required: true
    },
    shifts: [{
        day: {
            type: String,
            enum: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'],
            required: true
        },
        shiftId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Shift',
            required: true
        }
    }],
    validFrom: {
        type: Date,
        required: true,
        default: Date.now
    },
    validTo: {
        type: Date
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Ensure a worker doesn't have overlapping active schedules per company
scheduleSchema.index({ workerId: 1, companyId: 1, isActive: 1 });

const Schedule = mongoose.model('Schedule', scheduleSchema);

module.exports = Schedule;
