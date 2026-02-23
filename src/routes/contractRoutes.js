const express = require('express');
const router = express.Router();
const { getContracts, createContract, generatePDF } = require('../controllers/contractController');
const { protect } = require('../middleware/authMiddleware');
const { requireFullHR } = require('../middleware/serviceModeMiddleware');

router.use(protect, requireFullHR);

router.route('/')
    .get(getContracts)
    .post(createContract);

router.get('/:id/pdf', generatePDF);

module.exports = router;

