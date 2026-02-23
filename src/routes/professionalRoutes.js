const express = require('express');
const router = express.Router();
const {
    registerProfessional,
    getProfessionals,
    deleteProfessional
} = require('../controllers/professionalController');
const { protect } = require('../middleware/authMiddleware');

// Public route for professional registration
router.post('/public/register', registerProfessional);

// Private routes for agency management
router.get('/', protect, getProfessionals);
router.delete('/:id', protect, deleteProfessional);

module.exports = router;
