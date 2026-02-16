const Comment = require('../models/Comment');
const Notification = require('../models/Notification');
const User = require('../models/User');
const asyncHandler = require('express-async-handler');

// @desc    Add a comment
// @route   POST /api/comments
const addComment = asyncHandler(async (req, res) => {
    const { targetType, targetId, text } = req.body;

    if (!text) {
        res.status(400);
        throw new Error('Comment text is required');
    }

    const comment = await Comment.create({
        companyId: req.user.companyId,
        authorId: req.user._id,
        targetType,
        targetId,
        text
    });

    // Create notifications for other users in the same company
    // Usually, we want to notify "Administrativas" or whoever is managing the target
    // For now, we notify all users of the company except the author
    const usersToNotify = await User.find({
        companyId: req.user.companyId,
        _id: { $ne: req.user._id }
    });

    for (const user of usersToNotify) {
        await Notification.create({
            companyId: req.user.companyId,
            title: `Nuevo comentario de supervisión`,
            message: `${req.user.name} comentó: "${text.substring(0, 50)}${text.length > 50 ? '...' : ''}"`,
            type: 'ALERT',
            applicantId: targetType === 'Applicant' ? targetId : undefined,
            projectId: targetType === 'Project' ? targetId : undefined
        });
    }

    res.status(201).json(comment);
});

// @desc    Get comments for a target
// @route   GET /api/comments/:targetType/:targetId
const getComments = asyncHandler(async (req, res) => {
    const { targetType, targetId } = req.params;

    const comments = await Comment.find({
        targetType,
        targetId,
        companyId: req.user.companyId
    }).populate('authorId', 'name role');

    res.json(comments);
});

module.exports = { addComment, getComments };
