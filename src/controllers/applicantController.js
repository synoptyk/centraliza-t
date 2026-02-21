const Applicant = require('../models/Applicant');
const Config = require('../models/Config');
const asyncHandler = require('express-async-handler');
const crypto = require('crypto');
const sendEmail = require('../utils/sendEmail');
const { createInternalNotification } = require('./notificationController');

// Helper to find applicant ensuring company isolation
const findScopedApplicant = async (id, user) => {
    let query = { _id: id };
    if (user.role !== 'Ceo_Centralizat' && user.role !== 'Admin_Centralizat') {
        query.companyId = user.companyId;
    }
    return await Applicant.findOne(query);
};

// @desc    Register a new applicant (Module 2)
// @route   POST /api/applicants
const registerApplicant = asyncHandler(async (req, res) => {
    const { rut, country } = req.body;

    const applicantExists = await Applicant.findOne({ rut });

    if (applicantExists) {
        res.status(400);
        throw new Error('Applicant already exists');
    }

    // Creating applicant with all fields + companyId
    const applicant = await Applicant.create({
        ...req.body,
        companyId: req.user.companyId
    });

    if (applicant) {
        // Notification: New Applicant
        await createInternalNotification({
            companyId: req.user.companyId,
            title: 'Nuevo Postulante Registrado',
            message: `Un nuevo postulante (${applicant.fullName}) ha iniciado el proceso para ${applicant.position}.`,
            type: 'PROGRESS',
            applicantId: applicant._id,
            projectId: applicant.projectId
        });
        res.status(201).json(applicant);
    } else {
        res.status(400);
        throw new Error('Invalid applicant data');
    }
});

// @desc    Get all applicants
// @route   GET /api/applicants
const getApplicants = asyncHandler(async (req, res) => {
    let query = { companyId: req.user.companyId };

    if (req.user.role === 'Ceo_Centralizat' || req.user.role === 'Admin_Centralizat') {
        query = {}; // God access
    }

    const applicants = await Applicant.find(query).populate('projectId');
    res.json(applicants);
});

// @desc    Update applicant status (Generic for all modules)
// @route   PUT /api/applicants/:id/status
const updateApplicantStatus = asyncHandler(async (req, res) => {
    const applicant = await findScopedApplicant(req.params.id, req.user);

    if (applicant) {
        const oldStatus = applicant.status;
        const newStatus = req.body.status;
        const note = req.body.comments || '';

        if (newStatus && newStatus !== oldStatus) {
            // BLINDAJE: Si pasa a aprobación de gerencia, validar que la ficha esté completa
            if (newStatus === 'Pendiente Aprobación Gerencia') {
                if (!applicant.workerData?.financial?.liquidSalary || applicant.workerData?.validationStatus !== 'Enviado para Aprobación') {
                    res.status(400);
                    throw new Error('No se puede enviar a aprobación sin completar la ficha administrativa de colaborador (Sueldo/Validación).');
                }
            }

            applicant.status = newStatus;

            // Add to history
            applicant.history.push({
                status: newStatus,
                changedBy: req.user.name || 'Usuario', // req.user comes from auth middleware
                comments: note || `Cambio de estado manual de ${oldStatus} a ${newStatus}`
            });
        }

        const updatedApplicant = await applicant.save();

        // Notification: Status Change logic remains...
        // Notification: Status Change
        let notifType = 'PROGRESS';
        let title = 'Cambio de Estado';
        let message = `El postulante ${applicant.fullName} ha pasado a estado: ${applicant.status}.`;

        if (applicant.status === 'Pendiente Aprobación Gerencia') {
            notifType = 'APPROVAL';
            title = 'Aprobación Requerida';
            message = `El postulante ${applicant.fullName} requiere aprobación final para contratación.`;

            // --- 🚀 AUTOMACIÓN DE APROBACIÓN ---
            // 1. Generar Token
            const token = crypto.randomBytes(32).toString('hex');
            applicant.hiring.approvalToken = token;
            applicant.hiring.approvalExpires = Date.now() + 48 * 60 * 60 * 1000; // 48h
            await applicant.save();

            // 2. Buscar Configuración de Gerentes
            const config = await Config.findOne();
            if (config && config.managers.length > 0) {
                const approvalUrl = `${process.env.FRONTEND_URL}/remote-approval?id=${applicant._id}&token=${token}`;

                // Track notification metadata
                applicant.hiring.notificationSentAt = new Date();
                applicant.hiring.notifiedManagersCount = config.managers.length;

                // Add system history log for email trigger
                applicant.history.push({
                    status: applicant.status,
                    changedBy: 'Sistema (Automatización)',
                    comments: `Solicitud de aprobación enviada a ${config.managers.length} gerentes.`
                });

                await applicant.save();

                for (const manager of config.managers) {
                    await sendEmail({
                        email: manager.email,
                        subject: `SOLICITUD DE APROBACIÓN: ${applicant.fullName}`,
                        html: `
                            <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px; border-radius: 20px; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1);">
                                <div style="background: linear-gradient(to right, #4f46e5, #7c3aed); padding: 30px; border-radius: 15px; text-align: center; color: white;">
                                    <h1 style="margin: 0; font-size: 24px; text-transform: uppercase; letter-spacing: 2px;">CENTRALIZA-T</h1>
                                    <p style="margin: 5px 0 0; opacity: 0.8; font-size: 10px; font-weight: bold; text-transform: uppercase;">Solicitud de Aprobación Final</p>
                                </div>
                                <div style="padding: 20px;">
                                    <p>Estimado/a <strong>${manager.name}</strong>,</p>
                                    <p>Se requiere su validación ejecutiva para formalizar la contratación del siguiente candidato:</p>
                                    <div style="background: #f8fafc; padding: 25px; border-radius: 15px; margin: 20px 0; border: 1px solid #f1f5f9;">
                                        <p style="margin: 5px 0;"><strong>Postulante:</strong> ${applicant.fullName}</p>
                                        <p style="margin: 5px 0;"><strong>Cargo:</strong> ${applicant.position}</p>
                                        <p style="margin: 5px 0;"><strong>RUT:</strong> ${applicant.rut}</p>
                                    </div>
                                    <div style="text-align: center; margin-top: 30px;">
                                        <a href="${approvalUrl}" style="background: #0f172a; color: white; padding: 18px 35px; text-decoration: none; border-radius: 12px; font-weight: 800; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; display: inline-block; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);">Revisar y Procesar</a>
                                    </div>
                                    <p style="font-size: 10px; color: #94a3b8; text-align: center; margin-top: 40px; font-style: italic;">
                                        Este es un canal de aprobación segura. El enlace expirará automáticamente en 48 horas.
                                    </p>
                                </div>
                            </div>
                        `
                    });
                }
            }
        }

        await createInternalNotification({
            companyId: applicant.companyId,
            title,
            message,
            type: notifType,
            applicantId: applicant._id,
            projectId: applicant.projectId
        });

        res.json(updatedApplicant);
    } else {
        res.status(404);
        throw new Error('Applicant not found');
    }
});

// @desc    Register/Update interview (Module 3 - Enhanced)
// @route   PUT /api/applicants/:id/interview
const registerInterview = asyncHandler(async (req, res) => {
    const applicant = await findScopedApplicant(req.params.id, req.user);

    if (applicant) {
        // Preserve existing interview data and merge with updates
        applicant.interview = {
            ...applicant.interview,
            scheduledDate: req.body.scheduledDate || applicant.interview.scheduledDate,
            location: req.body.location || applicant.interview.location,
            attended: req.body.attended !== undefined ? req.body.attended : applicant.interview.attended,
            result: req.body.result || applicant.interview.result,
            notes: req.body.notes || applicant.interview.notes,
            interviewStatus: req.body.interviewStatus || applicant.interview.interviewStatus || 'Agendada'
        };

        // Auto-update main status based on interview result
        if (req.body.result === 'OK') {
            applicant.status = 'En Test';
            applicant.interview.interviewStatus = 'Realizada';
        } else if (req.body.result === 'NOK') {
            applicant.status = 'Rechazado';
            applicant.interview.interviewStatus = 'Realizada';
        }

        const updatedApplicant = await applicant.save();

        // Notification: Interview Result
        await createInternalNotification({
            companyId: applicant.companyId,
            title: 'Resultado de Entrevista',
            message: `Entrevista completada para ${applicant.fullName}. Resultado: ${applicant.interview.result}.`,
            type: applicant.interview.result === 'OK' ? 'PROGRESS' : 'ALERT',
            applicantId: applicant._id,
            projectId: applicant.projectId
        });

        res.json(updatedApplicant);
    } else {
        res.status(404);
        throw new Error('Applicant not found');
    }
});

// @desc    Confirm interview
// @route   PUT /api/applicants/:id/interview/confirm
const confirmInterview = asyncHandler(async (req, res) => {
    const applicant = await findScopedApplicant(req.params.id, req.user);

    if (!applicant) {
        res.status(404);
        throw new Error('Applicant not found');
    }

    applicant.interview.interviewStatus = 'Confirmada';
    applicant.interview.confirmedBy = req.user.name;
    applicant.interview.confirmedAt = new Date();

    applicant.history.push({
        status: applicant.status,
        changedBy: req.user.name,
        comments: `Entrevista confirmada para el ${new Date(applicant.interview.scheduledDate).toLocaleDateString()}`
    });

    const updatedApplicant = await applicant.save();

    await createInternalNotification({
        companyId: applicant.companyId,
        title: 'Entrevista Confirmada',
        message: `La entrevista de ${applicant.fullName} ha sido confirmada.`,
        type: 'PROGRESS',
        applicantId: applicant._id,
        projectId: applicant.projectId
    });

    res.json(updatedApplicant);
});

// @desc    Reschedule interview
// @route   PUT /api/applicants/:id/interview/reschedule
const rescheduleInterview = asyncHandler(async (req, res) => {
    const { newDate, reason } = req.body;
    const applicant = await findScopedApplicant(req.params.id, req.user);

    if (!applicant) {
        res.status(404);
        throw new Error('Applicant not found');
    }

    const previousDate = applicant.interview.scheduledDate;

    // Add to reschedule history
    applicant.interview.rescheduleHistory.push({
        previousDate,
        newDate,
        reason,
        rescheduledBy: req.user.name,
        rescheduledAt: new Date()
    });

    applicant.interview.scheduledDate = newDate;
    applicant.interview.interviewStatus = 'Reprogramada';

    applicant.history.push({
        status: applicant.status,
        changedBy: req.user.name,
        comments: `Entrevista reprogramada de ${new Date(previousDate).toLocaleDateString()} a ${new Date(newDate).toLocaleDateString()}. Razón: ${reason}`
    });

    const updatedApplicant = await applicant.save();

    await createInternalNotification({
        companyId: applicant.companyId,
        title: 'Entrevista Reprogramada',
        message: `La entrevista de ${applicant.fullName} ha sido reprogramada.`,
        type: 'ALERT',
        applicantId: applicant._id,
        projectId: applicant.projectId
    });

    res.json(updatedApplicant);
});

// @desc    Cancel interview
// @route   PUT /api/applicants/:id/interview/cancel
const cancelInterview = asyncHandler(async (req, res) => {
    const { reason } = req.body;
    const applicant = await findScopedApplicant(req.params.id, req.user);

    if (!applicant) {
        res.status(404);
        throw new Error('Applicant not found');
    }

    applicant.interview.interviewStatus = 'Cancelada';
    applicant.interview.cancellationReason = reason;
    applicant.interview.cancelledBy = req.user.name;
    applicant.interview.cancelledAt = new Date();
    applicant.status = 'Rechazado';

    applicant.history.push({
        status: 'Rechazado',
        changedBy: req.user.name,
        comments: `Entrevista cancelada. Razón: ${reason}`
    });

    const updatedApplicant = await applicant.save();

    await createInternalNotification({
        companyId: applicant.companyId,
        title: 'Entrevista Cancelada',
        message: `La entrevista de ${applicant.fullName} ha sido cancelada.`,
        type: 'ALERT',
        applicantId: applicant._id,
        projectId: applicant.projectId
    });

    res.json(updatedApplicant);
});

// @desc    Suspend interview
// @route   PUT /api/applicants/:id/interview/suspend
const suspendInterview = asyncHandler(async (req, res) => {
    const { reason } = req.body;
    const applicant = await findScopedApplicant(req.params.id, req.user);

    if (!applicant) {
        res.status(404);
        throw new Error('Applicant not found');
    }

    applicant.interview.interviewStatus = 'Suspendida';
    applicant.interview.suspensionReason = reason;
    applicant.interview.suspendedBy = req.user.name;
    applicant.interview.suspendedAt = new Date();
    applicant.status = 'Rechazado';

    applicant.history.push({
        status: 'Rechazado',
        changedBy: req.user.name,
        comments: `Entrevista suspendida. Razón: ${reason}`
    });

    const updatedApplicant = await applicant.save();

    await createInternalNotification({
        companyId: applicant.companyId,
        title: 'Entrevista Suspendida',
        message: `La entrevista de ${applicant.fullName} ha sido suspendida.`,
        type: 'ALERT',
        applicantId: applicant._id,
        projectId: applicant.projectId
    });

    res.json(updatedApplicant);
});

// @desc    Get interviews for calendar view
// @route   GET /api/applicants/interviews/calendar
const getInterviewsCalendar = asyncHandler(async (req, res) => {
    let query = { companyId: req.user.companyId };

    if (req.user.role === 'Ceo_Centralizat' || req.user.role === 'Admin_Centralizat') {
        query = {}; // God access
    }

    // Find all applicants with scheduled interviews
    const applicants = await Applicant.find({
        ...query,
        'interview.scheduledDate': { $exists: true, $ne: null }
    }).populate('projectId');

    // Transform to calendar-friendly format
    const events = applicants.map(app => ({
        id: app._id,
        title: `${app.fullName} - ${app.position}`,
        start: app.interview.scheduledDate,
        end: app.interview.scheduledDate,
        status: app.interview.interviewStatus,
        location: app.interview.location,
        result: app.interview.result,
        applicant: {
            _id: app._id,
            fullName: app.fullName,
            email: app.email,
            phone: app.phone,
            position: app.position,
            rut: app.rut
        }
    }));

    res.json(events);
});


// @desc    Upload contract document (Module 5)
// @route   POST /api/applicants/:id/contract-docs
const uploadContractDocument = asyncHandler(async (req, res) => {
    const applicant = await findScopedApplicant(req.params.id, req.user);

    if (!applicant) {
        res.status(404);
        throw new Error('Applicant not found');
    }

    if (!req.file) {
        res.status(400);
        throw new Error('No file uploaded');
    }

    const newDocument = {
        docType: req.body.docType,
        url: req.file.path,
        publicId: req.file.filename,
        uploadDate: new Date(),
        status: 'Pendiente'
    };

    applicant.contractDocuments.push(newDocument);
    const updatedApplicant = await applicant.save();

    // Notification: Document Upload
    await createInternalNotification({
        companyId: applicant.companyId,
        title: 'Carga Documental',
        message: `Se ha cargado un nuevo documento (${req.body.docType}) para ${applicant.fullName}.`,
        type: 'PROGRESS',
        applicantId: applicant._id,
        projectId: applicant.projectId
    });

    res.json(updatedApplicant);
});

// @desc    Delete contract document (Module 5)
// @route   DELETE /api/applicants/:id/contract-docs/:docId
const deleteContractDocument = asyncHandler(async (req, res) => {
    const applicant = await findScopedApplicant(req.params.id, req.user);

    if (!applicant) {
        res.status(404);
        throw new Error('Applicant not found');
    }

    const docIndex = applicant.contractDocuments.findIndex(d => d._id.toString() === req.params.docId);

    if (docIndex === -1) {
        res.status(404);
        throw new Error('Document not found');
    }

    applicant.contractDocuments.splice(docIndex, 1);
    const updatedApplicant = await applicant.save();

    res.json(updatedApplicant);
});

// @desc    Create custom contract document requirement for applicant
// @route   POST /api/applicants/:id/contract-docs/custom
const createCustomContractDocument = asyncHandler(async (req, res) => {
    const applicant = await findScopedApplicant(req.params.id, req.user);
    const { docType } = req.body;

    if (!applicant) {
        res.status(404);
        throw new Error('Applicant not found');
    }

    if (!docType) {
        res.status(400);
        throw new Error('El nombre del documento es requerido');
    }

    const exists = applicant.contractDocuments.find(d => d.docType.toLowerCase() === docType.toLowerCase());

    if (exists) {
        res.status(400);
        throw new Error('Este documento ya existe en el expediente del postulante');
    }

    applicant.contractDocuments.push({
        docType: docType,
        status: 'Pendiente'
    });

    const updatedApplicant = await applicant.save();
    res.json(updatedApplicant);
});

// @desc    Update contract document status (Module 5)
// @route   PUT /api/applicants/:id/contract-docs/:docId/status
const updateContractDocStatus = asyncHandler(async (req, res) => {
    const applicant = await findScopedApplicant(req.params.id, req.user);

    if (!applicant) {
        res.status(404);
        throw new Error('Applicant not found');
    }

    const document = applicant.contractDocuments.id(req.params.docId);

    if (!document) {
        res.status(404);
        throw new Error('Document not found');
    }

    document.status = req.body.status;
    document.reviewedBy = req.user.name;
    document.reviewedAt = new Date();

    if (req.body.status === 'Rechazado' && req.body.rejectionReason) {
        document.rejectionReason = req.body.rejectionReason;
    }

    const updatedApplicant = await applicant.save();
    res.json(updatedApplicant);
});

// @desc    Update accreditation item (Module 6)
// @route   PUT /api/applicants/:id/accreditation/:type/:itemName
const updateAccreditationItem = asyncHandler(async (req, res) => {
    const applicant = await findScopedApplicant(req.params.id, req.user);

    if (!applicant) {
        res.status(404);
        throw new Error('Applicant not found');
    }

    const { type, itemName } = req.params;
    const { status, observation } = req.body;

    let items = type === 'physical' ? applicant.accreditation.physicalExams : applicant.accreditation.onlineExams;

    let item = items.find(i => i.name === itemName);

    if (!item) {
        // If it doesn't exist yet, we create it (needed for dynamic items like BAT)
        item = { name: itemName, status: 'Pendiente' };
        items.push(item);
    }

    if (status) item.status = status;
    if (observation !== undefined) item.observation = observation;

    // If status is 'No Aprobado', mark applicant as 'Rechazado' global
    if (status === 'No Aprobado') {
        applicant.status = 'Rechazado';
        applicant.history.push({
            status: 'Rechazado',
            changedBy: req.user.name,
            comments: `Rechazado en acreditación: ${itemName}. Razón: ${observation || 'Sin observaciones'}`
        });
    }

    if (req.file) {
        item.url = req.file.path;
        item.publicId = req.file.filename;
    }

    const updatedApplicant = await applicant.save();
    res.json(updatedApplicant);
});

// @desc    Update tests (Module 4)
// @route   PUT /api/applicants/:id/tests
const updateTests = asyncHandler(async (req, res) => {
    const applicant = await findScopedApplicant(req.params.id, req.user);

    if (applicant) {
        applicant.tests = {
            psychological: {
                ...applicant.tests.psychological,
                ...req.body.psychological,
                completed: req.body.psychological !== undefined
            },
            professional: {
                ...applicant.tests.professional,
                ...req.body.professional,
                completed: req.body.professional !== undefined
            }
        };

        // If both sections are interacted with (completed check)
        // For a more robust check, we see if they have scores
        if (applicant.tests.psychological.score !== undefined && applicant.tests.professional.score !== undefined) {
            // Check if professional test is "No Aprobado" or below a threshold if exists
            // Since there is no explicit result field shown in snippet beyond 'score' 
            // but the user mentions 'no aprueba', let's check for a 'result' string if present in body
            if (req.body.professional?.result === 'No Aprobado' || req.body.psychological?.result === 'No Aprobado') {
                applicant.status = 'Rechazado';
            } else {
                applicant.status = 'Carga Documental';
            }
        }

        const updatedApplicant = await applicant.save();
        res.json(updatedApplicant);
    } else {
        res.status(404);
        throw new Error('Applicant not found');
    }
});

// @desc    Update applicant general (Hiring Approval use case)
// @route   PUT /api/applicants/:id
const updateApplicant = asyncHandler(async (req, res) => {
    const applicant = await findScopedApplicant(req.params.id, req.user);

    if (applicant) {
        // Capture old state for history comparison
        const oldStatus = applicant.status;
        const oldApproval = applicant.hiring?.managerApproval;

        // Apply updates
        Object.assign(applicant, req.body);

        // Check for specific changes to log
        // 1. Status Change
        if (req.body.status && req.body.status !== oldStatus) {
            applicant.history.push({
                status: req.body.status,
                changedBy: req.user.name || 'Gerencia',
                comments: req.body.hiring?.managerNote || `Actualización general a ${req.body.status}`
            });
        }
        // 2. Approval Change (if status didn't change but approval did, unlikely but possible)
        else if (req.body.hiring?.managerApproval && req.body.hiring.managerApproval !== oldApproval) {
            applicant.history.push({
                status: applicant.status,
                changedBy: req.user.name || 'Gerencia',
                comments: `Decisión de Gerencia: ${req.body.hiring.managerApproval}. Nota: ${req.body.hiring?.managerNote || ''}`
            });
        }

        // If status changed to Pendiente Aprobación Gerencia, we should probably trigger the same logic
        // But the frontend HiringApproval sets it TO "Contratado". 
        // Let's assume this handles the manual approval from dashboard.

        // Trigger Email Notification to Admins if Manager Decision is made
        if (req.body.hiring?.managerApproval && req.body.hiring.managerApproval !== oldApproval) {
            const decision = req.body.hiring.managerApproval;
            const managerName = req.body.hiring.approvedBy || req.user.name || 'Gerencia';
            const note = req.body.hiring.managerNote;

            const config = await Config.findOne();
            if (config && config.admins && config.admins.length > 0) {
                for (const admin of config.admins) {
                    // Fire-and-forget to avoid blocking the UI
                    sendEmail({
                        email: admin.email,
                        subject: `RESOLUCIÓN DE CONTRATACIÓN: ${applicant.fullName} - ${decision}`,
                        html: `
                            <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px; border-radius: 20px; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1);">
                                <div style="background: linear-gradient(to right, ${decision === 'Aprobado' ? '#10b981, #059669' : '#ef4444, #dc2626'}); padding: 30px; border-radius: 15px; text-align: center; color: white;">
                                    <h1 style="margin: 0; font-size: 24px; text-transform: uppercase;">VEREDICTO DE GERENCIA</h1>
                                    <p style="margin: 5px 0 0; font-size: 14px; font-weight: bold; text-transform: uppercase;">Estado: ${decision}</p>
                                </div>
                                <div style="padding: 20px;">
                                    <p>Estimado/a Administrador/a <strong>${admin.name}</strong>,</p>
                                    <p>Se ha registrado una decisión ejecutiva respecto a una contratación en curso desde el Panel Centraliza-T.</p>
                                    <div style="background: #f8fafc; padding: 25px; border-radius: 15px; margin: 20px 0; border: 1px solid #f1f5f9;">
                                        <p style="margin: 5px 0;"><strong>Postulante:</strong> ${applicant.fullName}</p>
                                        <p style="margin: 5px 0;"><strong>Cargo / Rol:</strong> ${applicant.position}</p>
                                        <p style="margin: 5px 0;"><strong>Gerente Responsable:</strong> ${managerName}</p>
                                        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 15px 0;" />
                                        <p style="margin: 5px 0; font-style: italic; color: #475569;"><strong>Motivo / Nota del Gerente:</strong> ${note || 'Sin observaciones adicionales'}</p>
                                    </div>
                                    <p style="font-size: 12px; color: #64748b; text-align: center;">Por favor, proceda acorde a sus protocolos internos (emisión de contratos o aviso de rechazo del postulante).</p>
                                </div>
                            </div>
                        `
                    }).catch(err => console.error('Error enviando notificación a Admin:', err));
                }
            }
        }

        const updatedApplicant = await applicant.save();
        res.json(updatedApplicant);
    } else {
        res.status(404);
        throw new Error('Applicant not found');
    }
});

// @desc    Process remote approval/rejection (Public Link)
// @route   POST /api/applicants/:id/remote-approval
const processRemoteApproval = asyncHandler(async (req, res) => {
    const { token, decision, managerName, note } = req.body;
    const applicant = await Applicant.findById(req.params.id);

    if (!applicant) {
        res.status(404);
        throw new Error('Postulante no encontrado');
    }

    if (applicant.hiring.approvalToken !== token || new Date() > applicant.hiring.approvalExpires) {
        res.status(401);
        throw new Error('Token inválido o expirado');
    }

    applicant.status = decision === 'Aprobado' ? 'Contratado' : 'Rechazado';
    applicant.hiring.managerApproval = decision;
    applicant.hiring.approvedBy = managerName || 'Gerencia Externa';
    applicant.hiring.managerNote = note;
    applicant.hiring.approvalToken = undefined; // Clear token after use
    applicant.hiring.approvalExpires = undefined;

    // History Log
    applicant.history.push({
        status: applicant.status,
        changedBy: managerName || 'Gerencia Externa',
        comments: `Decisión Remota: ${decision}. Nota: ${note || 'Sin nota'}`
    });

    // Update workerData validation if approved
    if (decision === 'Aprobado') {
        applicant.workerData.validationStatus = 'Aprobado';
    } else {
        applicant.workerData.validationStatus = 'Rechazado';
    }

    await applicant.save();

    // Internal Notification
    await createInternalNotification({
        companyId: applicant.companyId,
        title: decision === 'Aprobado' ? 'Contratación Aprobada (Remota)' : 'Contratación Rechazada (Remota)',
        message: `El gerente ${managerName} ha ${decision.toLowerCase()} la contratación de ${applicant.fullName}.`,
        type: decision === 'Aprobado' ? 'PROGRESS' : 'ALERT',
        applicantId: applicant._id,
        projectId: applicant.projectId
    });

    // Notify Administrators (Config.admins) about the Manager's Verdict
    const config = await Config.findOne();
    if (config && config.admins && config.admins.length > 0) {
        for (const admin of config.admins) {
            await sendEmail({
                email: admin.email,
                subject: `RESOLUCIÓN DE CONTRATACIÓN: ${applicant.fullName} - ${decision}`,
                html: `
                    <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px; border-radius: 20px; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1);">
                        <div style="background: linear-gradient(to right, ${decision === 'Aprobado' ? '#10b981, #059669' : '#ef4444, #dc2626'}); padding: 30px; border-radius: 15px; text-align: center; color: white;">
                            <h1 style="margin: 0; font-size: 24px; text-transform: uppercase;">VEREDICTO DE GERENCIA</h1>
                            <p style="margin: 5px 0 0; font-size: 14px; font-weight: bold; text-transform: uppercase;">Estado: ${decision}</p>
                        </div>
                        <div style="padding: 20px;">
                            <p>Estimado/a Administrador/a <strong>${admin.name}</strong>,</p>
                            <p>Se ha registrado una decisión ejecutiva respecto a una contratación en curso.</p>
                            <div style="background: #f8fafc; padding: 25px; border-radius: 15px; margin: 20px 0; border: 1px solid #f1f5f9;">
                                <p style="margin: 5px 0;"><strong>Postulante:</strong> ${applicant.fullName}</p>
                                <p style="margin: 5px 0;"><strong>Cargo / Rol:</strong> ${applicant.position}</p>
                                <p style="margin: 5px 0;"><strong>Gerente Responsable:</strong> ${managerName}</p>
                                <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 15px 0;" />
                                <p style="margin: 5px 0; font-style: italic; color: #475569;"><strong>Motivo / Nota del Gerente:</strong> ${note || 'Sin observaciones adicionales'}</p>
                            </div>
                            <p style="font-size: 12px; color: #64748b; text-align: center;">Por favor, proceda acorde a sus protocolos internos (emisión de contratos o aviso de rechazo del postulante).</p>
                        </div>
                    </div>
                `
            });
        }
    }

    res.json({ message: `Decisión procesada: ${decision}` });
});

// @desc    Get applicant details for remote approval
// @route   GET /api/applicants/:id/remote-details?token=...
const getRemoteApprovalDetails = asyncHandler(async (req, res) => {
    const { token } = req.query;
    const applicant = await Applicant.findById(req.params.id);

    if (!applicant) {
        res.status(404);
        throw new Error('Postulante no encontrado');
    }

    if (applicant.hiring.approvalToken !== token || new Date() > applicant.hiring.approvalExpires) {
        res.status(401);
        throw new Error('Enlace de aprobación inválido o expirado');
    }

    // Return package + financial details
    res.json({
        name: applicant.fullName,
        rut: applicant.rut,
        position: applicant.position,
        department: applicant.department,
        salary: applicant.workerData?.financial?.liquidSalary,
        bonuses: applicant.workerData?.financial?.bonuses,
        contractType: applicant.workerData?.contract?.type,
        startDate: applicant.workerData?.contract?.startDate,
        status: applicant.status
    });
});


// ===== PSYCHOLABOR TEST ENDPOINTS =====

// @desc    Send Psycholabor Test via Email
// @route   POST /api/applicants/:id/tests/send-psycholabor
const sendPsycholaborTest = asyncHandler(async (req, res) => {
    const applicant = await findScopedApplicant(req.params.id, req.user);

    if (!applicant) {
        res.status(404);
        throw new Error('Applicant not found');
    }

    // Generate unique token
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000); // 48 hours

    applicant.tests.psycholaborTest.testToken = token;
    applicant.tests.psycholaborTest.status = 'Enviado';
    applicant.tests.psycholaborTest.sentAt = new Date();
    applicant.tests.psycholaborTest.expiresAt = expiresAt;

    await applicant.save();

    // Send email with test link
    const testUrl = `${process.env.FRONTEND_URL}/test-psicolaboral/${token}`;

    await sendEmail({
        email: applicant.email,
        subject: `CENTRALIZA-T - Evaluación Psicolaboral: ${applicant.position}`,
        html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1);">
                <div style="background: linear-gradient(to right, #6366f1, #8b5cf6); padding: 40px; text-align: center; color: white;">
                    <h1 style="margin: 0; font-size: 28px; text-transform: uppercase; letter-spacing: 3px;">CENTRALIZA-T</h1>
                    <p style="margin: 10px 0 0; opacity: 0.9; font-size: 14px; font-weight: bold; text-transform: uppercase;">Evaluación Psicolaboral</p>
                </div>
                <div style="padding: 40px;">
                    <p style="font-size: 16px; color: #334155;">Estimado/a <strong>${applicant.fullName}</strong>,</p>
                    <p style="font-size: 14px; color: #475569; line-height: 1.6;">
                        Como parte del proceso de selección para el cargo de <strong>${applicant.position}</strong>, 
                        te invitamos a completar una breve evaluación psicolaboral.
                    </p>
                    <div style="background: #f8fafc; padding: 20px; border-radius: 12px; margin: 25px 0; border-left: 4px solid #6366f1;">
                        <p style="margin: 5px 0; font-size: 14px; color: #475569;"><strong>📋 Contenido:</strong> 5 preguntas clave sobre competencias laborales</p>
                        <p style="margin: 5px 0; font-size: 14px; color: #475569;"><strong>⏱️ Tiempo estimado:</strong> 15-20 minutos</p>
                        <p style="margin: 5px 0; font-size: 14px; color: #475569;"><strong>📅 Válido hasta:</strong> ${expiresAt.toLocaleString('es-CL', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                    <div style="text-align: center; margin: 40px 0;">
                        <a href="${testUrl}" style="background: linear-gradient(to right, #6366f1, #8b5cf6); color: white; padding: 18px 40px; text-decoration: none; border-radius: 12px; font-weight: bold; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; display: inline-block; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);">
                            INICIAR EVALUACIÓN
                        </a>
                    </div>
                    <p style="font-size: 12px; color: #94a3b8; text-align: center; margin-top: 40px; font-style: italic;">
                        Este enlace es personal e intransferible. Expira en 48 horas.
                    </p>
                </div>
            </div>
        `
    });

    // Notification
    await createInternalNotification({
        companyId: applicant.companyId,
        title: 'Test Psicolaboral Enviado',
        message: `Se ha enviado el test psicolaboral a ${applicant.fullName} (${applicant.email}).`,
        type: 'PROGRESS',
        applicantId: applicant._id,
        projectId: applicant.projectId
    });

    res.json({ message: 'Test enviado exitosamente', expiresAt });
});

// @desc    Get Public Test (No Auth Required)
// @route   GET /api/applicants/tests/public/:token
const getPublicTest = asyncHandler(async (req, res) => {
    const { token } = req.params;
    const applicant = await Applicant.findOne({ 'tests.psycholaborTest.testToken': token });

    if (!applicant) {
        res.status(404);
        throw new Error('Test no encontrado o token inválido');
    }

    // Check expiration
    if (new Date() > applicant.tests.psycholaborTest.expiresAt) {
        applicant.tests.psycholaborTest.status = 'Vencido';
        await applicant.save();
        res.status(410);
        throw new Error('El test ha expirado');
    }

    // Update status to "En Progreso" if first access
    if (applicant.tests.psycholaborTest.status === 'Enviado') {
        applicant.tests.psycholaborTest.status = 'En Progreso';
        await applicant.save();
    }

    // Import questions
    const { PSYCHOLABOR_QUESTIONS } = require('../utils/testAnalyzer');

    res.json({
        applicant: {
            fullName: applicant.fullName,
            position: applicant.position
        },
        questions: PSYCHOLABOR_QUESTIONS.map(q => ({
            id: q.id,
            question: q.question
        })),
        expiresAt: applicant.tests.psycholaborTest.expiresAt,
        status: applicant.tests.psycholaborTest.status
    });
});

// @desc    Submit Test Responses (No Auth Required)
// @route   POST /api/applicants/tests/public/:token/submit
const submitTestResponses = asyncHandler(async (req, res) => {
    const { token } = req.params;
    const { responses } = req.body;

    const applicant = await Applicant.findOne({ 'tests.psycholaborTest.testToken': token });

    if (!applicant) {
        res.status(404);
        throw new Error('Test no encontrado o token inválido');
    }

    // Check expiration
    if (new Date() > applicant.tests.psycholaborTest.expiresAt) {
        applicant.tests.psycholaborTest.status = 'Vencido';
        await applicant.save();
        res.status(410);
        throw new Error('El test ha expirado');
    }

    // Validate responses
    if (!responses || responses.length !== 5) {
        res.status(400);
        throw new Error('Se requieren 5 respuestas completas');
    }

    // Save responses
    applicant.tests.psycholaborTest.responses = responses.map(r => ({
        ...r,
        answeredAt: new Date()
    }));

    // Analyze responses with AI
    const { analyzeAllResponses } = require('../utils/testAnalyzer');
    const analysis = analyzeAllResponses(responses);

    applicant.tests.psycholaborTest.analysis = analysis;
    applicant.tests.psycholaborTest.status = 'Completado';
    applicant.tests.psycholaborTest.completedAt = new Date();
    applicant.tests.psycholaborTest.testToken = undefined; // Clear token after use

    await applicant.save();

    // Notification
    await createInternalNotification({
        companyId: applicant.companyId,
        title: 'Test Psicolaboral Completado',
        message: `${applicant.fullName} ha completado el test psicolaboral. Puntuación: ${analysis.overallScore}/100.`,
        type: analysis.overallScore >= 60 ? 'PROGRESS' : 'ALERT',
        applicantId: applicant._id,
        projectId: applicant.projectId
    });

    res.json({
        message: 'Test completado exitosamente',
        score: analysis.overallScore
    });
});

// @desc    Get Test Results
// @route   GET /api/applicants/:id/tests/results
const getTestResults = asyncHandler(async (req, res) => {
    const applicant = await Applicant.findById(req.params.id);

    if (!applicant) {
        res.status(404);
        throw new Error('Applicant not found');
    }

    if (applicant.tests.psycholaborTest.status !== 'Completado') {
        res.status(400);
        throw new Error('El test aún no ha sido completado');
    }

    res.json({
        applicant: {
            _id: applicant._id,
            fullName: applicant.fullName,
            position: applicant.position,
            email: applicant.email
        },
        test: applicant.tests.psycholaborTest
    });
});

module.exports = {
    registerApplicant,
    getApplicants,
    updateApplicant,
    updateApplicantStatus,
    registerInterview,
    confirmInterview,
    rescheduleInterview,
    cancelInterview,
    suspendInterview,
    getInterviewsCalendar,
    uploadContractDocument,
    updateContractDocStatus,
    deleteContractDocument,
    createCustomContractDocument,
    updateAccreditationItem,
    updateTests,
    sendPsycholaborTest,
    getPublicTest,
    submitTestResponses,
    getTestResults,
    processRemoteApproval,
    getRemoteApprovalDetails
};

