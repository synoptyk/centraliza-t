const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    senderName: { type: String, required: true },
    companyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Company',
        required: true
    },
    target: {
        type: String,
        enum: ['internal', 'support'],
        default: 'internal'
    },
    content: { type: String, required: true },
    type: {
        type: String,
        enum: ['text', 'video_call', 'file'],
        default: 'text'
    },
    callStatus: {
        type: String,
        enum: ['active', 'ended'],
        default: 'active'
    },
    readBy: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }]
}, { timestamps: true });

messageSchema.index({ companyId: 1, createdAt: -1 });

module.exports = mongoose.model('Message', messageSchema);
