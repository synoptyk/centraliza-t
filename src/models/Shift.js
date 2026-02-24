const mongoose = require('mongoose');

const shiftSchema = new mongoose.Schema({
    companyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Company',
        required: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    startTime: {
        type: String, // format "HH:mm"
        required: true
    },
    endTime: {
        type: String, // format "HH:mm"
        required: true
    },
    breakTime: {
        type: Number, // duration in minutes
        default: 0
    },
    isDefault: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

const Shift = mongoose.model('Shift', shiftSchema);

module.exports = Shift;
