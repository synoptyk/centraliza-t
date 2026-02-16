const asyncHandler = require('express-async-handler');
const Message = require('../models/Message');

// @desc    Get messages for a room (company or support)
// @route   GET /api/chat/:room
// @access  Private
const getMessages = asyncHandler(async (req, res) => {
    const { room } = req.params;
    let query = {};

    const mongoose = require('mongoose');
    if (room.startsWith('company_')) {
        const companyId = room.split('_')[1];
        if (!mongoose.Types.ObjectId.isValid(companyId)) {
            return res.json([]); // Return empty if invalid ID
        }
        query = { companyId, target: 'internal' };
    } else if (room.startsWith('support_')) {
        const companyId = room.split('_')[1];
        if (!mongoose.Types.ObjectId.isValid(companyId)) {
            // If ID is invalid (e.g. 'undefined' or 'all'), maybe return all support messages if SuperAdmin?
            // For now, let's safe return empty to avoid crash
            return res.json([]);
        }
        query = { companyId, target: 'support' };
    }

    const messages = await Message.find(query).sort({ createdAt: 1 }).limit(100); // Last 100 messages
    res.json(messages);
});

// @desc    Save a new message
// @route   POST /api/chat
// @access  Private
const saveMessage = asyncHandler(async (req, res) => {
    const { senderId, senderName, companyId, target, content, type } = req.body;

    const message = await Message.create({
        senderId,
        senderName,
        companyId,
        target,
        content,
        type
    });

    res.status(201).json(message);
});

// @desc    Update message (e.g. for call status)
// @route   PUT /api/chat/:id
// @access  Private
const updateMessage = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { callStatus } = req.body;

    const message = await Message.findById(id);

    if (message) {
        message.callStatus = callStatus || message.callStatus;
        const updatedMessage = await message.save();
        res.json(updatedMessage);
    } else {
        res.status(404);
        throw new Error('Message not found');
    }
});

module.exports = { getMessages, saveMessage, updateMessage };
