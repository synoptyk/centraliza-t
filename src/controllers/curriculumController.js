const CurriculumConfig = require('../models/CurriculumConfig');
const Applicant = require('../models/Applicant');
const asyncHandler = require('express-async-handler');
const { upload } = require('../config/cloudinary');

// @desc    Get curriculum configuration
// @route   GET /api/curriculum/config
const getCurriculumConfig = asyncHandler(async (req, res) => {
    const companyId = req.user.companyId || null;

    let config = await CurriculumConfig.findOne({ companyId });

    const defaultCourses = [
        { code: 'IHN-001', name: 'Inducción de Seguridad Hombre Nuevo', category: 'Seguridad', description: 'Inducción general de seguridad para personal nuevo.' },
        { code: 'RIOHS-001', name: 'Reglamento Interno (RIOHS)', category: 'Seguridad', description: 'Recepción y conocimiento del Reglamento Interno.' },
        { code: 'DAS-001', name: 'Derecho a Saber (DAS)', category: 'Seguridad', description: 'Información sobre riesgos laborales y medidas preventivas.' },
        { code: 'MAN-DEF', name: 'Curso de Manejo Defensivo', category: 'Seguridad', description: 'Capacitación para conducción segura de vehículos.' },
        { code: 'IND-ESP', name: 'Inducción Específica del Cargo', category: 'Seguridad', description: 'Riesgos y procedimientos específicos según la función.' }
    ];

    const defaultExams = [
        { code: 'ALT-FIS', name: 'Altura Física', category: 'Médico', validityMonths: 12 },
        { code: 'AUD-MET', name: 'Audiometría', category: 'Médico', validityMonths: 12 },
        { code: 'GRA-ALT', name: 'Gran Altura Geográfica', category: 'Médico', validityMonths: 12 },
        { code: 'ORI-COM', name: 'Orina Completa', category: 'Médico', validityMonths: 12 },
        { code: 'SIL-ICE', name: 'Sílice', category: 'Médico', validityMonths: 12 },
        { code: 'DRO-ANF', name: 'Anfetaminas Técnica rápida', category: 'Médico', validityMonths: 12 },
        { code: 'DRO-BEN', name: 'Benzodiacepinas Técnica rápida', category: 'Médico', validityMonths: 12 },
        { code: 'DRO-COC', name: 'Cocaína Técnica Rápida', category: 'Médico', validityMonths: 12 },
        { code: 'DRO-MAR', name: 'Marihuana Técnica Rápida', category: 'Médico', validityMonths: 12 },
        { code: 'DRO-OPI', name: 'Opiáceos Técnica Rápida', category: 'Médico', validityMonths: 12 },
        { code: 'PRE-OCU', name: 'Examen Preocupacional (Básico)', category: 'Médico', validityMonths: 12 },
        { code: 'PSI-LOG', name: 'Evaluación Psicológica', category: 'Psicológico', validityMonths: 12 },
        { code: 'AV-RIES', name: 'Evaluación Aversión al Riesgo', category: 'Psicológico', validityMonths: 12 },
        { code: 'PSI-SEN', name: 'Examen Psicosensotécnico', category: 'Técnico', validityMonths: 12 }
    ];

    const defaultHiringDocs = [
        { code: 'CV', name: '1. Currículum Vitae', category: 'Legal' },
        { code: 'PREOC', name: '2. Examen Preocupacional (Básico, Altura Geográfica)', category: 'Legal' },
        { code: 'PSIC', name: '3. Evaluación psicológica (si aplica)', category: 'Personal' },
        { code: 'AVER', name: '4. Evaluación aversión al riesgo (si aplica)', category: 'Personal' },
        { code: 'ANT', name: '5. Certificado de Antecedentes Original Vigente (Art. 2 Código del Trabajo)', category: 'Legal' },
        { code: 'AFP', name: '6. Certificado Afiliación AFP - Últimas 12 cotizaciones', category: 'Social' },
        { code: 'SAL', name: '7. Certificado Isapre o Fonasa (Indicando valor del plan)', category: 'Social' },
        { code: 'EST', name: '8. Certificado de estudios Enseñanza Media o Superior (Fotocopia)', category: 'Educacional' },
        { code: 'FOT', name: '9. 2 Fotografías color fondo blanco (Tamaño pasaporte)', category: 'Personal' },
        { code: 'FIN', name: '10. Finiquito último empleador o carta renuncia (Fotocopias)', category: 'Legal' },
        { code: 'CI', name: '11. Fotocopia Carné de Identidad (Ambos lados)', category: 'Personal' },
        { code: 'COMP', name: '12. Fotocopias de competencias (Títulos o cursos)', category: 'Educacional' },
        { code: 'ASIG', name: '13. Certificados de Asignación familiar', category: 'Personal' },
        { code: 'RES', name: '14. Certificado de Residencia (Junta de Vecinos, Notaría o Comprobante)', category: 'Personal' },
        { code: 'CHV', name: 'a) Certificado Hoja de Vida del Conductor', category: 'Otros', description: 'Si va a conducir' },
        { code: 'LIC', name: 'b) Fotocopia Licencia de Conducir', category: 'Otros', description: 'Si va a conducir' },
        { code: 'PST', name: 'c) Examen Psicosensotécnico', category: 'Otros', description: 'Si va a conducir' }
    ];

    if (!config) {
        config = await CurriculumConfig.create({
            companyId,
            masterCourses: defaultCourses,
            masterExams: defaultExams,
            masterHiringDocs: defaultHiringDocs,
            positionCurriculum: []
        });
    } else {
        // Seed if empty or missing defaults
        let modified = false;
        if (config.masterCourses.length === 0) {
            config.masterCourses = defaultCourses;
            modified = true;
        }
        if (config.masterExams.length < defaultExams.length) {
            config.masterExams = defaultExams;
            modified = true;
        }
        if (!config.masterHiringDocs || config.masterHiringDocs.length < defaultHiringDocs.length) {
            config.masterHiringDocs = defaultHiringDocs;
            modified = true;
        }
        if (modified) await config.save();
    }

    res.json(config);
});


// @desc    Add course to master catalog
// @route   POST /api/curriculum/courses
const addMasterCourse = asyncHandler(async (req, res) => {
    const { code, name, category, description, validityMonths } = req.body;

    const config = await CurriculumConfig.findOne({ companyId: req.user.companyId || null });

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

    const config = await CurriculumConfig.findOne({ companyId: req.user.companyId || null });

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
// @desc    Add hiring document to master catalog
// @route   POST /api/curriculum/hiring-docs
const addHiringDocToMaster = asyncHandler(async (req, res) => {
    const { code, name, category, description } = req.body;

    const config = await CurriculumConfig.findOne({ companyId: req.user.companyId || null });

    if (!config) {
        res.status(404);
        throw new Error('Configuración no encontrada');
    }

    // Check if code already exists
    const exists = config.masterHiringDocs.find(d => d.code === code);
    if (exists) {
        res.status(400);
        throw new Error('El código de documento ya existe');
    }

    config.masterHiringDocs.push({
        code,
        name,
        category: category || 'Legal',
        description,
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

    const config = await CurriculumConfig.findOne({ companyId: req.user.companyId || null });

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

    const config = await CurriculumConfig.findOne({ companyId: req.user.companyId || null });

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

    const config = await CurriculumConfig.findOne({ companyId: req.user.companyId || null });

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
    const config = await CurriculumConfig.findOne({ companyId: req.user.companyId || null });

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

    const hiringDocs = (positionConfig.requiredHiringDocs || []).map(code =>
        config.masterHiringDocs.find(d => d.code === code)
    ).filter(Boolean);

    res.json({
        position: positionConfig.position,
        courses,
        exams,
        hiringDocs,
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

    // Assign Hiring Documents
    if (positionConfig.requiredHiringDocs && positionConfig.requiredHiringDocs.length > 0) {
        positionConfig.requiredHiringDocs.forEach(docCode => {
            const masterDoc = config.masterHiringDocs.find(d => d.code === docCode);
            if (masterDoc) {
                const exists = applicant.contractDocuments.find(d => d.docType === masterDoc.name);
                if (!exists) {
                    applicant.contractDocuments.push({
                        docType: masterDoc.name,
                        status: 'Pendiente'
                    });
                }
            }
        });
    }

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
    }

    await applicant.save();
    res.json(applicant);
});

// @desc    Assign BAT Standard (BAT 1 or BAT 2)
// @route   POST /api/applicants/:id/prevention/bat/:type
const assignBATStandard = asyncHandler(async (req, res) => {
    const { type } = req.params; // 'BAT1' or 'BAT2'
    const applicant = await Applicant.findById(req.params.id);

    if (!applicant) {
        res.status(404);
        throw new Error('Postulante no encontrado');
    }

    const bat1Exams = [
        { code: 'ALT-FIS', name: 'Altura Física', category: 'Médico' },
        { code: 'AUD-MET', name: 'Audiometría', category: 'Médico' },
        { code: 'GRA-ALT', name: 'Gran Altura Geográfica', category: 'Médico' },
        { code: 'ORI-COM', name: 'Orina Completa', category: 'Médico' },
        { code: 'SIL-ICE', name: 'Sílice', category: 'Médico' },
        { code: 'DRO-BAT', name: 'Examen de Drogas (Anfetaminas, Benzodiacepinas, Cocaína, Marihuana, Opiáceos)', category: 'Médico' }
    ];

    const bat2Exams = [
        { code: 'GRA-ALT', name: 'Gran Altura Geográfica', category: 'Médico' },
        { code: 'ORI-COM', name: 'Orina Completa', category: 'Médico' },
        { code: 'AUD-MET', name: 'Audiometría', category: 'Médico' },
        { code: 'DRO-BAT', name: 'Examen de Drogas (Anfetaminas, Benzodiacepinas, Cocaína, Marihuana, Opiáceos)', category: 'Médico' }
    ];

    const targetExams = type === 'BAT1' ? bat1Exams : bat2Exams;

    // Merge logic: Add only if not already present
    if (!applicant.preventionDocuments) {
        applicant.preventionDocuments = { courses: [], exams: [] };
    }

    targetExams.forEach(exam => {
        const exists = applicant.preventionDocuments.exams.find(e => e.examCode === exam.code);
        if (!exists) {
            applicant.preventionDocuments.exams.push({
                examCode: exam.code,
                examName: exam.name,
                category: exam.category,
                status: 'Pendiente'
            });
        }
    });

    applicant.preventionDocuments.assignedAt = new Date();
    applicant.preventionDocuments.assignedBy = req.user.name;

    await applicant.save();
    res.json(applicant);
});

module.exports = {
    getCurriculumConfig,
    addMasterCourse,
    addMasterExam,
    addHiringDocToMaster,
    updateMasterCourse,
    updateMasterExam,
    configurePositionCurriculum,
    getPositionCurriculum,
    assignCurriculumToApplicant,
    uploadCurriculumDocument,
    updateCurriculumItemStatus,
    assignBATStandard
};
