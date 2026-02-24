const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
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
    timestamp: {
        type: Date,
        required: true,
        default: Date.now
    },
    type: {
        type: String,
        enum: ['Entrada', 'Salida', 'Inicio Colación', 'Fin Colación'],
        required: true
    },
    location: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point'
        },
        coordinates: {
            type: [Number], // [longitude, latitude]
            required: true
        }
    },
    deviceInfo: {
        ip: String,
        userAgent: String,
        platform: String
    },
    hash: {
        type: String,
        required: true
    },
    receiptSent: {
        type: Boolean,
        default: false
    },
    transactionId: {
        type: String,
        unique: true
    }
}, {
    timestamps: true
});

// Index for georeferencing
attendanceSchema.index({ location: '2dsphere' });

const Attendance = mongoose.model('Attendance', attendanceSchema);

module.exports = Attendance;
