const express = require('express');
const router = express.Router();
const {
    createFiniquito,
    getFiniquitos,
    getFiniquitoById,
    updateFiniquitoStatus,
    getFiniquitoReport
} = require('../controllers/finiquitoController');
const { protect } = require('../middleware/authMiddleware');
const { requireFullHR } = require('../middleware/serviceModeMiddleware');

router.use(protect, requireFullHR);

router.route('/')
    .get(getFiniquitos)
    .post(createFiniquito);

router.route('/report')
    .get(getFiniquitoReport);

router.route('/:id')
    .get(getFiniquitoById);

router.route('/:id/status')
    .put(updateFiniquitoStatus);

module.exports = router;
