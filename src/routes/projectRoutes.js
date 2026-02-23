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
const { validate, createProjectSchema } = require('../middleware/validators');

router.route('/')
    .get(protect, getProjects)
    .post(protect, checkSubscriptionStatus, checkResourceLimits('projects'), validate(createProjectSchema), createProject);

router.route('/:id')
    .get(protect, getProjectById)
    .put(protect, updateProject)
    .delete(protect, deleteProject);

module.exports = router;
