const express = require('express');
const router = express.Router();
const { authUser, forgotPassword, resetPassword } = require('../controllers/authController');
const { registerTrial } = require('../controllers/registrationController');
const { handleContactLead } = require('../controllers/leadController');
const { validate, loginSchema, registerCompanySchema } = require('../middleware/validators');

router.post('/login', validate(loginSchema), authUser);
router.post('/register-trial', validate(registerCompanySchema), registerTrial);
router.post('/contact-lead', handleContactLead);
router.post('/forgotpassword', forgotPassword);
router.put('/resetpassword/:resettoken', resetPassword);

module.exports = router;
