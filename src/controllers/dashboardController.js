const asyncHandler = require('express-async-handler');
const Applicant = require('../models/Applicant');
const Project = require('../models/Project');
const Company = require('../models/Company');
const Vacation = require('../models/Vacation');
const Contract = require('../models/Contract');

// @desc    Get dashboard statistics based on service mode
// @route   GET /api/dashboard/stats
const getDashboardStats = asyncHandler(async (req, res) => {
    const company = await Company.findById(req.user.companyId);
    if (!company) {
        res.status(404);
        throw new Error('Empresa no encontrada');
    }

    const serviceMode = company.serviceMode;
    const query = { companyId: req.user.companyId };

    // Common data
    const [projects, applicants] = await Promise.all([
        Project.find(query),
        Applicant.find(query)
    ]);

    let stats = {
        serviceMode,
        general: {
            totalProjects: projects.length,
            totalApplicants: applicants.length,
            activeProjects: projects.filter(p => p.status === 'Activo').length
        }
    };

    if (serviceMode === 'RECRUITMENT_ONLY') {
        // Agency Focus
        const recruitedThisMonth = applicants.filter(a =>
            a.status === 'Contratado' &&
            new Date(a.updatedAt).getMonth() === new Date().getMonth()
        ).length;

        stats.agency = {
            pipeline: applicants.reduce((acc, a) => {
                acc[a.status] = (acc[a.status] || 0) + 1;
                return acc;
            }, {}),
            recruitedThisMonth,
            projectEffectiveness: projects.map(p => {
                const projectApplicants = applicants.filter(a => a.projectId.toString() === p._id.toString());
                const hired = projectApplicants.filter(a => a.status === 'Contratado').length;
                const target = (p.hrRequirement || 0) + (p.logisticsRequirement || 0) + (p.preventionRequirement || 0) + (p.generalServicesRequirement || 0) || 1;
                return {
                    name: p.projectName,
                    hired,
                    target,
                    percent: Math.round((hired / target) * 100)
                };
            }).slice(0, 5)
        };
    } else {
        // Integral Focus (FULL_HR_360)
        const [vacations, contracts] = await Promise.all([
            Vacation.find({ ...query, status: 'Pendiente' }),
            Contract.find(query)
        ]);

        const employees = applicants.filter(a => a.status === 'Contratado');

        // Contract expirations in next 15 days
        const fifteenDaysFromNow = new Date();
        fifteenDaysFromNow.setDate(fifteenDaysFromNow.getDate() + 15);

        const expiringSoon = employees.filter(e =>
            e.workerData?.contract?.endDate &&
            new Date(e.workerData.contract.endDate) <= fifteenDaysFromNow &&
            new Date(e.workerData.contract.endDate) >= new Date()
        ).length;

        stats.integral = {
            totalEmployees: employees.length,
            pendingVacations: vacations.length,
            expiringContracts: expiringSoon,
            recentHires: employees.filter(e =>
                new Date(e.createdAt).getMonth() === new Date().getMonth()
            ).length,
            statusDistribution: {
                active: employees.length,
                vacation: 0, // Placeholder if we had an "In Vacation" status
                medicalLeave: 0 // Placeholder
            }
        };
    }

    res.json(stats);
});

module.exports = { getDashboardStats };
