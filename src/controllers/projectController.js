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

    try {
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
            companyId: req.user.companyId || null // Handle potential null
        });

        res.status(201).json(project);
    } catch (error) {
        console.error('Project Creation Error:', error);
        res.status(400);
        throw new Error(error.message);
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

// @desc    Update project
// @route   PUT /api/projects/:id
const updateProject = asyncHandler(async (req, res) => {
    const project = await Project.findById(req.params.id);

    if (project) {
        project.name = req.body.name || project.name;
        project.clientB2BName = req.body.clientB2BName || project.clientB2BName;
        project.clientB2BRut = req.body.clientB2BRut || project.clientB2BRut;
        project.mainMandante = req.body.mainMandante || project.mainMandante;
        project.durationMonths = req.body.durationMonths || project.durationMonths;
        project.startDate = req.body.startDate || project.startDate;
        project.regions = req.body.regions || project.regions;
        project.locations = req.body.locations || project.locations;
        project.requirements = req.body.requirements || project.requirements;
        project.status = req.body.status || project.status;

        const updatedProject = await project.save();
        res.json(updatedProject);
    } else {
        res.status(404);
        throw new Error('Project not found');
    }
});

// @desc    Delete project
// @route   DELETE /api/projects/:id
const deleteProject = asyncHandler(async (req, res) => {
    const project = await Project.findById(req.params.id);

    if (project) {
        await project.deleteOne();
        res.json({ message: 'Project removed' });
    } else {
        res.status(404);
        throw new Error('Project not found');
    }
});

module.exports = {
    createProject,
    getProjects,
    getProjectById,
    updateProject,
    deleteProject
};
