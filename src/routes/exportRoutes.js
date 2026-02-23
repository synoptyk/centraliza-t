const express = require('express');
const router = express.Router();
const {
    exportProfilePDF,
    exportPayslipPDF,
    exportFiniquitoPDF,
    exportVacationProofPDF,
    exportDisciplinaryActionPDF
} = require('../controllers/exportController');
const { protect } = require('../middleware/authMiddleware');
const { requireFullHR } = require('../middleware/serviceModeMiddleware');

// Profile export available for all service modes
router.get('/profile/:id', protect, exportProfilePDF);
// HR exports require Full HR 360
router.post('/payslip', protect, requireFullHR, exportPayslipPDF);
router.post('/finiquito', protect, requireFullHR, exportFiniquitoPDF);
router.post('/vacation-proof', protect, requireFullHR, exportVacationProofPDF);
router.post('/disciplinary', protect, requireFullHR, exportDisciplinaryActionPDF);

module.exports = router;
