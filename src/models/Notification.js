const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    companyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Company',
        required: true
    },
    title: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['PROGRESS', 'PENDING', 'APPROVAL', 'ALERT'],
        default: 'PROGRESS'
    },
    applicantId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Applicant'
    },
    projectId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project'
    },
    readBy: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    isActive: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

// Index for performance
notificationSchema.index({ companyId: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
