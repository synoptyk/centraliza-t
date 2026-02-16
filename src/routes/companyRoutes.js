const express = require('express');
const router = express.Router();
const { registerCompany, getCompanies, updateCompany, deleteCompany, bulkRegisterCompanies } = require('../controllers/companyController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/')
    .post(protect, authorize('Ceo_Centralizat'), registerCompany)
    .get(protect, authorize('Ceo_Centralizat', 'Admin_Centralizat'), getCompanies);

router.post('/bulk', protect, authorize('Ceo_Centralizat'), bulkRegisterCompanies);

router.route('/:id')
    .put(protect, authorize('Ceo_Centralizat'), updateCompany)
    .delete(protect, authorize('Ceo_Centralizat'), deleteCompany);

module.exports = router;
