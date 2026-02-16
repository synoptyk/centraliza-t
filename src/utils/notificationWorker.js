const Applicant = require('../models/Applicant');
const Notification = require('../models/Notification');
const { createInternalNotification } = require('../controllers/notificationController');

const checkStaleApplicants = async () => {
    try {
        console.log('--- Running Stale Applicant Check (24h) ---');

        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

        // Find applicants not updated in 24h and not in final states
        const staleApplicants = await Applicant.find({
            updatedAt: { $lt: oneDayAgo },
            status: { $nin: ['Contratado', 'Rechazado', 'Reclutado'] } // Exclude final states
        }).populate('projectId');

        for (const applicant of staleApplicants) {
            // Check if a PENDING notification already exists for this applicant in the last 24h to avoid spam
            const existingNotif = await Notification.findOne({
                applicantId: applicant._id,
                type: 'PENDING',
                createdAt: { $gt: oneDayAgo }
            });

            if (!existingNotif) {
                await createInternalNotification({
                    companyId: applicant.companyId,
                    title: 'Proceso Estancado (>24h)',
                    message: `El postulante ${applicant.fullName} lleva más de 24 horas en estado "${applicant.status}" sin avances.`,
                    type: 'PENDING',
                    applicantId: applicant._id,
                    projectId: applicant.projectId
                });
                console.log(`Notification created for stale applicant: ${applicant.fullName}`);
            }
        }
    } catch (error) {
        console.error('Error in checkStaleApplicants worker:', error.message);
    }
};

const startNotificationWorker = () => {
    // Run every hour
    setInterval(checkStaleApplicants, 60 * 60 * 1000);
    // Also run once at startup
    checkStaleApplicants();
};

module.exports = { startNotificationWorker };
