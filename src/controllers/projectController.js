const Project = require('../models/Project');
const asyncHandler = require('express-async-handler');

// @desc    Create a new project
// @route   POST /api/projects
const createProject = asyncHandler(async (req, res) => {
    const {
        clientB2BName,
        clientB2BRut,
        mainMandante,
        name,
        durationMonths,
        startDate,
        regions,
        locations,
        requirements
    } = req.body;

    const project = await Project.create({
        clientB2BName,
        clientB2BRut,
        mainMandante,
        name,
        durationMonths,
        startDate,
        regions,
        locations,
        requirements,
        companyId: req.user.companyId
    });

    if (project) {
        res.status(201).json(project);
    } else {
        res.status(400);
        throw new Error('Invalid project data');
    }
});

// @desc    Get all projects
// @route   GET /api/projects
const getProjects = asyncHandler(async (req, res) => {
    let query = { companyId: req.user.companyId };

    if (req.user.role === 'Ceo_Centralizat' || req.user.role === 'Admin_Centralizat') {
        query = {}; // God access
    }

    const projects = await Project.find(query);
    res.json(projects);
});

// @desc    Get project by ID
// @route   GET /api/projects/:id
const getProjectById = asyncHandler(async (req, res) => {
    const project = await Project.findById(req.params.id);

    if (project) {
        res.json(project);
    } else {
        res.status(404);
        throw new Error('Project not found');
    }
});

module.exports = {
    createProject,
    getProjects,
    getProjectById
};
