const express = require('express');
const router = express.Router();
const {
    createProject,
    getProjects,
    getProjectById,
    updateProject,
    deleteProject
} = require('../controllers/projectController');

const { protect } = require('../middleware/authMiddleware');
const { checkSubscriptionStatus, checkResourceLimits } = require('../middleware/subscriptionMiddleware');

router.route('/')
    .get(protect, getProjects)
    .post(protect, checkSubscriptionStatus, checkResourceLimits('projects'), createProject);

router.route('/:id')
    .get(protect, getProjectById)
    .put(protect, updateProject)
    .delete(protect, deleteProject);

module.exports = router;
