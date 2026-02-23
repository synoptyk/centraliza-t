const express = require('express');
const router = express.Router();
const {
    createDisciplinaryAction,
    getDisciplinaryActions,
    createCommendation,
    getCommendations,
    signDisciplinaryAction
} = require('../controllers/recordController');
const { protect } = require('../middleware/authMiddleware');
const { requireFullHR } = require('../middleware/serviceModeMiddleware');
const { validate, createDisciplinarySchema, createCommendationSchema } = require('../middleware/validators');

// All record routes require Full HR 360
router.use(protect, requireFullHR);

// Disciplinary Actions
router.route('/disciplinary')
    .post(validate(createDisciplinarySchema), createDisciplinaryAction)
    .get(getDisciplinaryActions);

router.route('/disciplinary/:id/sign')
    .put(signDisciplinaryAction);

// Commendations
router.route('/commendations')
    .post(validate(createCommendationSchema), createCommendation)
    .get(getCommendations);

module.exports = router;

