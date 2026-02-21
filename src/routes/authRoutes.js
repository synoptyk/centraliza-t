const express = require('express');
const router = express.Router();
const { authUser, forgotPassword, resetPassword } = require('../controllers/authController');
const { registerTrial } = require('../controllers/registrationController');
const { handleContactLead } = require('../controllers/leadController');

router.post('/login', authUser);
router.post('/register-trial', registerTrial);
router.post('/contact-lead', handleContactLead);
router.post('/forgotpassword', forgotPassword);
router.put('/resetpassword/:resettoken', resetPassword);

module.exports = router;
