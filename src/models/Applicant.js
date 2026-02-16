const mongoose = require('mongoose');

const applicantSchema = new mongoose.Schema({
    // Identification
    fullName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    rut: { type: String, required: true, unique: true },
    address: { type: String },

    // Project Info
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
    position: { type: String, required: true },
    clientFormatNumber: { type: String }, // Numero de formato de cliente

    // Antecendentes Educacionales
    education: [{
        degree: String,
        institution: String,
        year: String
    }],

    // Trayectoria Laboral
    workHistory: [{
        position: String,
        company: String,
        from: String,
        to: String
    }],

    currentWorkSituation: { type: String },

    // Referencias
    references: [{
        name: String,
        position: String,
        company: String,
        phone: String
    }],

    // Conflicto de Interés
    conflictOfInterest: {
        hasFamilyInCompany: { type: Boolean, default: false },
        relationship: String,
        employeeName: String
    },

    // Status Tracking
    status: {
        type: String,
        enum: [
            'Postulando',
            'En Entrevista',
            'En Test',
            'Carga Documental',
            'Acreditación',
            'Pendiente Aprobación Gerencia',
            'Aprobado para Contratación',
            'Contratado',
            'Rechazado'
        ],
        default: 'Postulando'
    },

    // Audit Trail / History
    history: [{
        status: { type: String, required: true },
        changedBy: { type: String }, // User name or 'Sistema'
        comments: { type: String },
        timestamp: { type: Date, default: Date.now }
    }],

    // Module 3: Interview (Enhanced Workflow)
    interview: {
        scheduledDate: Date,
        location: String,
        attended: { type: Boolean, default: false },
        result: { type: String, enum: ['OK', 'NOK', 'Pendiente'], default: 'Pendiente' },
        notes: String,

        // Workflow Status Tracking
        interviewStatus: {
            type: String,
            enum: ['Pendiente Agendar', 'Agendada', 'Confirmada', 'Realizada', 'Reprogramada', 'Cancelada', 'Suspendida'],
            default: 'Pendiente Agendar'
        },

        // Reschedule History
        rescheduleHistory: [{
            previousDate: Date,
            newDate: Date,
            reason: String,
            rescheduledBy: String,
            rescheduledAt: { type: Date, default: Date.now }
        }],

        // Cancellation Information
        cancellationReason: String,
        cancelledBy: String,
        cancelledAt: Date,

        // Confirmation Information
        confirmedBy: String,
        confirmedAt: Date,

        // Suspension Information
        suspensionReason: String,
        suspendedBy: String,
        suspendedAt: Date
    },

    // Module 4: Tests (Enhanced with Online Psycholabor Test)
    tests: {
        psychological: {
            result: String,
            personalityType: String,
            score: Number,
            comments: String,
            completed: { type: Boolean, default: false }
        },
        professional: {
            skills: [String],
            knowledgeLevel: String,
            score: Number,
            completed: { type: Boolean, default: false }
        },

        // Online Psycholabor Test System
        psycholaborTest: {
            status: {
                type: String,
                enum: ['Pendiente', 'Enviado', 'En Progreso', 'Completado', 'Vencido'],
                default: 'Pendiente'
            },
            sentAt: Date,
            completedAt: Date,
            expiresAt: Date,
            testToken: String, // Unique token for public access

            // 5 Key Questions & Answers
            responses: [{
                questionId: Number,
                question: String,
                answer: String,
                answeredAt: Date
            }],

            // AI-Generated Analysis
            analysis: {
                overallScore: { type: Number, default: 0 }, // 0-100
                strengths: [String],
                weaknesses: [String],
                recommendations: String,
                detailedFeedback: String,
                personalityTraits: {
                    teamwork: { type: Number, default: 0 },        // 0-100
                    problemSolving: { type: Number, default: 0 },  // 0-100
                    adaptability: { type: Number, default: 0 },    // 0-100
                    leadership: { type: Number, default: 0 },      // 0-100
                    ethics: { type: Number, default: 0 }           // 0-100
                }
            }
        }
    },


    // Module 5: Contract Documentation (Universal - Same for all applicants)
    contractDocuments: [{
        docType: String,        // CV, Antecedentes, AFP, etc.
        url: String,
        publicId: String,
        status: {
            type: String,
            enum: ['Pendiente', 'OK', 'Rechazado'],
            default: 'Pendiente'
        },
        uploadDate: Date,
        reviewedBy: String,
        reviewedAt: Date,
        rejectionReason: String
    }],

    // Module 5B: Prevention Documentation (Variable by position - Courses & Exams)
    preventionDocuments: {
        courses: [{
            courseCode: String,
            courseName: String,
            category: String,
            status: {
                type: String,
                enum: ['Pendiente', 'En Proceso', 'Completado', 'Vencido', 'Rechazado'],
                default: 'Pendiente'
            },
            certificateUrl: String,
            certificatePublicId: String,
            issueDate: Date,        // Certificate issue date
            expiryDate: Date,       // Certificate expiry date
            uploadedAt: Date,
            approvedBy: String,
            approvedAt: Date,
            rejectionReason: String
        }],
        exams: [{
            examCode: String,
            examName: String,
            category: String,
            status: {
                type: String,
                enum: ['Pendiente', 'En Proceso', 'Completado', 'Vencido', 'Rechazado'],
                default: 'Pendiente'
            },
            resultUrl: String,
            resultPublicId: String,
            examDate: Date,
            expiryDate: Date,
            uploadedAt: Date,
            approvedBy: String,
            approvedAt: Date,
            score: String,
            rejectionReason: String
        }],
        assignedAt: Date,
        assignedBy: String,
        assignedPosition: String    // Position for which prevention docs were assigned
    },

    // Module 6: Accreditation
    accreditation: {
        physicalExams: [{
            name: String,
            status: {
                type: String,
                enum: ['Pendiente', 'Agendado', 'Realizado', 'No Realizado', 'Aprobado', 'No Aprobado'],
                default: 'Pendiente'
            },
            observation: String,
            url: String,
            publicId: String
        }],
        onlineExams: [{
            name: String,
            status: {
                type: String,
                enum: ['Pendiente', 'Agendado', 'Realizado', 'No Realizado', 'Aprobado', 'No Aprobado'],
                default: 'Pendiente'
            },
            observation: String,
            url: String,
            publicId: String
        }]
    },

    // Module 7, 8, 10
    hiring: {
        managerApproval: { type: String, enum: ['Pendiente', 'Aprobado', 'Rechazado'], default: 'Pendiente' },
        managerNote: String,
        approvedBy: String,
        contractStartDate: Date,
        contractEndDate: Date,
        contractType: String,
        isAdministrativeNotified: { type: Boolean, default: false },
        approvalToken: String,
        approvalExpires: Date,
        notificationSentAt: Date,
        notifiedManagersCount: Number
    },

    pension: [{
        docName: String,
        url: String,
        uploadDate: Date
    }],

    // Module 13: Ficha Colaborador (Worker Data)
    workerData: {
        idPhoto: {
            url: String,
            publicId: String
        },
        personal: {
            firstName: String,
            lastNamePaterno: String,
            lastNameMaterno: String,
            birthDate: Date,
            civilStatus: { type: String, enum: ['Soltero/a', 'Casado/a', 'Divorciado/a', 'Viudo/a', 'Conviviente Civil'] },
            nationality: String,
            isPensioner: { type: Boolean, default: false },
            commune: String,
            city: String,
            driverLicense: String, // 'B', 'A2', etc.
            spouse: {
                name: String,
                birthDate: Date
            },
            children: [{
                name: String,
                birthDate: Date
            }]
        },
        prevision: {
            healthSystem: {
                provider: String, // 'Fonasa' or Isapre Name
                type: { type: String, enum: ['Fonasa', 'Isapre'], default: 'Fonasa' },
                planAmount: Number,
                planCurrency: { type: String, enum: ['Pesos', 'UF'], default: 'Pesos' }
            },
            afp: String
        },
        familyAllowances: [{
            rut: String,
            name: String
        }],
        emergencyContact: {
            name: String,
            phone: String
        },
        financial: {
            liquidSalary: Number,
            bonuses: [{
                name: String,
                amount: Number
            }],
            bankData: {
                bank: String,
                accountType: String,
                accountNumber: String
            }
        },
        logistics: {
            shift: [String],
            clothingSizes: {
                shirt: String,
                jacket: String,
                pants: String,
                shoes: String
            }
        },
        contract: {
            startDate: Date,
            type: String, // 'Plazo Fijo', 'Indefinido', 'Por Obra o Faena'
            durationMonths: Number,
            endDate: Date
        },
        validationStatus: {
            type: String,
            enum: ['Pendiente', 'En Proceso Validación', 'Enviado para Aprobación', 'Aprobado'],
            default: 'Pendiente'
        }
    }
}, { timestamps: true });

applicantSchema.add({
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true }
});

module.exports = mongoose.model('Applicant', applicantSchema);
