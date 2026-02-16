const express = require('express');
const router = express.Router();
const {
    createProject,
    getProjects,
    getProjectById
} = require('../controllers/projectController');

const { protect } = require('../middleware/authMiddleware');

router.route('/')
    .get(protect, getProjects)
    .post(protect, createProject);

router.route('/:id')
    .get(protect, getProjectById);

module.exports = router;
