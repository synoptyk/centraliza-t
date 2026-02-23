const {
    registerProfessional,
    getProfessionals,
    deleteProfessional
} = require('../controllers/professionalController');
const {
    registerCorporateRequest,
    getCorporateRequests
} = require('../controllers/corporateController');
const { protect } = require('../middleware/authMiddleware');

// Public routes
router.post('/public/register', registerProfessional);
router.post('/public/corporate-register', registerCorporateRequest);

// Private routes for agency management
router.get('/', protect, getProfessionals);
router.get('/corporate', protect, getCorporateRequests);
router.delete('/:id', protect, deleteProfessional);

module.exports = router;
