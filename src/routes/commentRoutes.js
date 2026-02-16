const express = require('express');
const router = express.Router();
const { addComment, getComments } = require('../controllers/commentController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.route('/')
    .post(addComment);

router.route('/:targetType/:targetId')
    .get(getComments);

module.exports = router;
