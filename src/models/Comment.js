const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
    companyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Company',
        required: true
    },
    authorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    targetType: {
        type: String,
        enum: ['Applicant', 'Project'],
        required: true
    },
    targetId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        refPath: 'targetType'
    },
    text: {
        type: String,
        required: true
    }
}, { timestamps: true });

// Index for performance
commentSchema.index({ targetId: 1, createdAt: -1 });

module.exports = mongoose.model('Comment', commentSchema);
