const CurriculumConfig = require('../models/CurriculumConfig');
const Applicant = require('../models/Applicant');
const asyncHandler = require('express-async-handler');
const { upload } = require('../config/cloudinary');

// @desc    Get curriculum configuration
// @route   GET /api/curriculum/config
const getCurriculumConfig = asyncHandler(async (req, res) => {
    let config = await CurriculumConfig.findOne({ companyId: req.user.companyId });

    if (!config) {
        // Create default config if doesn't exist
        config = await CurriculumConfig.create({
            companyId: req.user.companyId,
            masterCourses: [],
            masterExams: [],
            positionCurriculum: []
        });
    }

    res.json(config);
});

// @desc    Add course to master catalog
// @route   POST /api/curriculum/courses
const addMasterCourse = asyncHandler(async (req, res) => {
    const { code, name, category, description, validityMonths } = req.body;

    const config = await CurriculumConfig.findOne({ companyId: req.user.companyId });

    if (!config) {
        res.status(404);
        throw new Error('Configuración no encontrada');
    }

    // Check if code already exists
    const exists = config.masterCourses.find(c => c.code === code);
    if (exists) {
        res.status(400);
        throw new Error('El código de curso ya existe');
    }

    config.masterCourses.push({
        code,
        name,
        category: category || 'Técnico',
        description,
        validityMonths: validityMonths || 12,
        isActive: true
    });

    await config.save();
    res.json(config);
});

// @desc    Add exam to master catalog
// @route   POST /api/curriculum/exams
const addMasterExam = asyncHandler(async (req, res) => {
    const { code, name, category, description, validityMonths } = req.body;

    const config = await CurriculumConfig.findOne({ companyId: req.user.companyId });

    if (!config) {
        res.status(404);
        throw new Error('Configuración no encontrada');
    }

    // Check if code already exists
    const exists = config.masterExams.find(e => e.code === code);
    if (exists) {
        res.status(400);
        throw new Error('El código de examen ya existe');
    }

    config.masterExams.push({
        code,
        name,
        category: category || 'Médico',
        description,
        validityMonths: validityMonths || 12,
        isActive: true
    });

    await config.save();
    res.json(config);
});

// @desc    Update course in master catalog
// @route   PUT /api/curriculum/courses/:code
const updateMasterCourse = asyncHandler(async (req, res) => {
    const { code } = req.params;
    const { name, category, description, validityMonths, isActive } = req.body;

    const config = await CurriculumConfig.findOne({ companyId: req.user.companyId });

    const courseIndex = config.masterCourses.findIndex(c => c.code === code);
    if (courseIndex === -1) {
        res.status(404);
        throw new Error('Curso no encontrado');
    }

    if (name) config.masterCourses[courseIndex].name = name;
    if (category) config.masterCourses[courseIndex].category = category;
    if (description !== undefined) config.masterCourses[courseIndex].description = description;
    if (validityMonths) config.masterCourses[courseIndex].validityMonths = validityMonths;
    if (isActive !== undefined) config.masterCourses[courseIndex].isActive = isActive;

    await config.save();
    res.json(config);
});

// @desc    Update exam in master catalog
// @route   PUT /api/curriculum/exams/:code
const updateMasterExam = asyncHandler(async (req, res) => {
    const { code } = req.params;
    const { name, category, description, validityMonths, isActive } = req.body;

    const config = await CurriculumConfig.findOne({ companyId: req.user.companyId });

    const examIndex = config.masterExams.findIndex(e => e.code === code);
    if (examIndex === -1) {
        res.status(404);
        throw new Error('Examen no encontrado');
    }

    if (name) config.masterExams[examIndex].name = name;
    if (category) config.masterExams[examIndex].category = category;
    if (description !== undefined) config.masterExams[examIndex].description = description;
    if (validityMonths) config.masterExams[examIndex].validityMonths = validityMonths;
    if (isActive !== undefined) config.masterExams[examIndex].isActive = isActive;

    await config.save();
    res.json(config);
});

// @desc    Configure position curriculum
// @route   POST /api/curriculum/position
const configurePositionCurriculum = asyncHandler(async (req, res) => {
    const { position, requiredCourses, requiredExams, additionalDocs, notes } = req.body;

    const config = await CurriculumConfig.findOne({ companyId: req.user.companyId });

    if (!config) {
        res.status(404);
        throw new Error('Configuración no encontrada');
    }

    // Validate that all course codes exist
    if (requiredCourses && requiredCourses.length > 0) {
        const invalidCourses = requiredCourses.filter(code =>
            !config.masterCourses.find(c => c.code === code && c.isActive)
        );
        if (invalidCourses.length > 0) {
            res.status(400);
            throw new Error(`Códigos de curso inválidos: ${invalidCourses.join(', ')}`);
        }
    }

    // Validate that all exam codes exist
    if (requiredExams && requiredExams.length > 0) {
        const invalidExams = requiredExams.filter(code =>
            !config.masterExams.find(e => e.code === code && e.isActive)
        );
        if (invalidExams.length > 0) {
            res.status(400);
            throw new Error(`Códigos de examen inválidos: ${invalidExams.join(', ')}`);
        }
    }

    // Check if position already exists
    const existingIndex = config.positionCurriculum.findIndex(p => p.position === position);

    if (existingIndex >= 0) {
        // Update existing
        config.positionCurriculum[existingIndex] = {
            position,
            requiredCourses: requiredCourses || [],
            requiredExams: requiredExams || [],
            additionalDocs: additionalDocs || [],
            notes,
            updatedAt: new Date()
        };
    } else {
        // Add new
        config.positionCurriculum.push({
            position,
            requiredCourses: requiredCourses || [],
            requiredExams: requiredExams || [],
            additionalDocs: additionalDocs || [],
            notes
        });
    }

    await config.save();
    res.json(config);
});

// @desc    Get position curriculum
// @route   GET /api/curriculum/position/:position
const getPositionCurriculum = asyncHandler(async (req, res) => {
    const { position } = req.params;
    const config = await CurriculumConfig.findOne({ companyId: req.user.companyId });

    if (!config) {
        res.status(404);
        throw new Error('Configuración no encontrada');
    }

    const positionConfig = config.positionCurriculum.find(p => p.position === position);

    if (!positionConfig) {
        return res.json({
            position,
            requiredCourses: [],
            requiredExams: [],
            additionalDocs: []
        });
    }

    // Populate with full course and exam details
    const courses = positionConfig.requiredCourses.map(code =>
        config.masterCourses.find(c => c.code === code)
    ).filter(Boolean);

    const exams = positionConfig.requiredExams.map(code =>
        config.masterExams.find(e => e.code === code)
    ).filter(Boolean);

    res.json({
        position: positionConfig.position,
        courses,
        exams,
        additionalDocs: positionConfig.additionalDocs,
        notes: positionConfig.notes
    });
});

// @desc    Assign curriculum to applicant based on position
// @route   POST /api/applicants/:id/curriculum/assign
const assignCurriculumToApplicant = asyncHandler(async (req, res) => {
    const applicant = await Applicant.findById(req.params.id);

    if (!applicant) {
        res.status(404);
        throw new Error('Postulante no encontrado');
    }

    const config = await CurriculumConfig.findOne({ companyId: applicant.companyId });

    if (!config) {
        res.status(404);
        throw new Error('Configuración de mallas no encontrada');
    }

    // Find position curriculum
    const positionConfig = config.positionCurriculum.find(p => p.position === applicant.position);

    if (!positionConfig) {
        res.status(404);
        throw new Error(`No se encontró configuración de malla para el cargo: ${applicant.position}`);
    }

    // Assign courses
    applicant.preventionDocuments.courses = positionConfig.requiredCourses.map(courseCode => {
        const course = config.masterCourses.find(c => c.code === courseCode);
        return {
            courseCode,
            courseName: course.name,
            category: course.category,
            status: 'Pendiente'
        };
    });

    // Assign exams
    applicant.preventionDocuments.exams = positionConfig.requiredExams.map(examCode => {
        const exam = config.masterExams.find(e => e.code === examCode);
        return {
            examCode,
            examName: exam.name,
            category: exam.category,
            status: 'Pendiente'
        };
    });

    applicant.preventionDocuments.assignedAt = new Date();
    applicant.preventionDocuments.assignedBy = req.user.name;
    applicant.preventionDocuments.assignedPosition = applicant.position;

    await applicant.save();
    res.json(applicant);
});

// @desc    Upload curriculum document (certificate or exam result)
// @route   POST /api/applicants/:id/curriculum/upload
const uploadCurriculumDocument = asyncHandler(async (req, res) => {
    const { type, itemCode } = req.body; // type: 'course' or 'exam'

    if (!req.file) {
        res.status(400);
        throw new Error('No se proporcionó archivo');
    }

    const applicant = await Applicant.findById(req.params.id);

    if (!applicant) {
        res.status(404);
        throw new Error('Postulante no encontrado');
    }

    if (type === 'course') {
        const courseIndex = applicant.preventionDocuments.courses.findIndex(c => c.courseCode === itemCode);
        if (courseIndex === -1) {
            res.status(404);
            throw new Error('Curso no encontrado en la malla asignada');
        }

        applicant.preventionDocuments.courses[courseIndex].certificateUrl = req.file.path;
        applicant.preventionDocuments.courses[courseIndex].certificatePublicId = req.file.filename;
        applicant.preventionDocuments.courses[courseIndex].uploadedAt = new Date();
        applicant.preventionDocuments.courses[courseIndex].status = 'En Proceso';

    } else if (type === 'exam') {
        const examIndex = applicant.preventionDocuments.exams.findIndex(e => e.examCode === itemCode);
        if (examIndex === -1) {
            res.status(404);
            throw new Error('Examen no encontrado en la malla asignada');
        }

        applicant.preventionDocuments.exams[examIndex].resultUrl = req.file.path;
        applicant.preventionDocuments.exams[examIndex].resultPublicId = req.file.filename;
        applicant.preventionDocuments.exams[examIndex].uploadedAt = new Date();
        applicant.preventionDocuments.exams[examIndex].status = 'En Proceso';
    } else {
        res.status(400);
        throw new Error('Tipo inválido. Debe ser "course" o "exam"');
    }

    await applicant.save();
    res.json(applicant);
});

// @desc    Update curriculum item status
// @route   PUT /api/applicants/:id/curriculum/:type/:itemCode/status
const updateCurriculumItemStatus = asyncHandler(async (req, res) => {
    const { type, itemCode } = req.params;
    const { status, completionDate, expiryDate, score, rejectionReason } = req.body;

    const applicant = await Applicant.findById(req.params.id);

    if (!applicant) {
        res.status(404);
        throw new Error('Postulante no encontrado');
    }

    if (type === 'course') {
        const courseIndex = applicant.preventionDocuments.courses.findIndex(c => c.courseCode === itemCode);
        if (courseIndex === -1) {
            res.status(404);
            throw new Error('Curso no encontrado');
        }

        applicant.preventionDocuments.courses[courseIndex].status = status;
        if (completionDate) applicant.preventionDocuments.courses[courseIndex].issueDate = completionDate;
        if (expiryDate) applicant.preventionDocuments.courses[courseIndex].expiryDate = expiryDate;
        if (rejectionReason) applicant.preventionDocuments.courses[courseIndex].rejectionReason = rejectionReason;

        if (status === 'Completado') {
            applicant.preventionDocuments.courses[courseIndex].approvedBy = req.user.name;
            applicant.preventionDocuments.courses[courseIndex].approvedAt = new Date();
        }

    } else if (type === 'exam') {
        const examIndex = applicant.preventionDocuments.exams.findIndex(e => e.examCode === itemCode);
        if (examIndex === -1) {
            res.status(404);
            throw new Error('Examen no encontrado');
        }

        applicant.preventionDocuments.exams[examIndex].status = status;
        if (completionDate) applicant.preventionDocuments.exams[examIndex].examDate = completionDate;
        if (expiryDate) applicant.preventionDocuments.exams[examIndex].expiryDate = expiryDate;
        if (score) applicant.preventionDocuments.exams[examIndex].score = score;
        if (rejectionReason) applicant.preventionDocuments.exams[examIndex].rejectionReason = rejectionReason;

        if (status === 'Completado') {
            applicant.preventionDocuments.exams[examIndex].approvedBy = req.user.name;
            applicant.preventionDocuments.exams[examIndex].approvedAt = new Date();
        }
    } else {
        res.status(400);
        throw new Error('Tipo inválido');
    }

    await applicant.save();
    res.json(applicant);
});

module.exports = {
    getCurriculumConfig,
    addMasterCourse,
    addMasterExam,
    updateMasterCourse,
    updateMasterExam,
    configurePositionCurriculum,
    getPositionCurriculum,
    assignCurriculumToApplicant,
    uploadCurriculumDocument,
    updateCurriculumItemStatus
};
