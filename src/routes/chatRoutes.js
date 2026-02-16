const express = require('express');
const router = express.Router();
const { getMessages, saveMessage, updateMessage } = require('../controllers/chatController');
const { protect } = require('../middleware/authMiddleware');

router.get('/:room', protect, getMessages);
router.post('/', protect, saveMessage);
router.put('/:id', protect, updateMessage);

module.exports = router;
