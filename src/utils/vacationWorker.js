/**
 * Vacation Accrual Worker
 * Runs periodically (e.g., monthly) to update vacation balances for ALL contracted employees.
 * Chilean law: 15 working days/year = 1.25 days/month
 */
const Applicant = require('../models/Applicant');
const Vacation = require('../models/Vacation');

const runVacationAccrualSync = async () => {
    // Silent start — only log results

    try {
        // Find all contracted employees with a contract start date
        const employees = await Applicant.find({
            status: 'Contratado',
            'workerData.contract.startDate': { $exists: true, $ne: null }
        });

        let updated = 0;
        let skipped = 0;

        for (const emp of employees) {
            try {
                const start = new Date(emp.workerData.contract.startDate);
                const today = new Date();

                // Calculate accrued days (1.25 per month = 15 per year Chilean law)
                let months = (today.getFullYear() - start.getFullYear()) * 12 + (today.getMonth() - start.getMonth());
                if (today.getDate() < start.getDate()) months--;
                if (months < 0) months = 0;

                const accruedTotal = Math.round(months * 1.25 * 100) / 100; // Round to 2 decimals

                // Get all approved vacations
                const approvedVacations = await Vacation.find({
                    applicantId: emp._id,
                    status: 'Aprobado'
                });

                const takenDays = approvedVacations.reduce((acc, v) => acc + v.daysRequested, 0);

                // Update the worker's vacation data
                emp.workerData.vacations = {
                    accruedDays: accruedTotal,
                    takenDays: takenDays,
                    pendingDays: Math.max(0, accruedTotal - takenDays),
                    lastCalculationDate: new Date()
                };

                await emp.save();
                updated++;
            } catch (e) {
                skipped++;
                console.error(`  ⚠️ Error syncing ${emp.fullName}: ${e.message}`);
            }
        }

        console.log(`🏖️  [Vacation Worker] Sync complete: ${updated} updated, ${skipped} skipped, ${employees.length} total.`);
        return { updated, skipped, total: employees.length };
    } catch (error) {
        console.error('❌ [Vacation Worker] Fatal error:', error.message);
        throw error;
    }
};

module.exports = { runVacationAccrualSync };
