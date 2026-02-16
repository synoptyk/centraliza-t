const express = require('express');
const router = express.Router();
const { authUser, forgotPassword, resetPassword } = require('../controllers/authController');

router.post('/login', authUser);
router.post('/forgotpassword', forgotPassword);
router.put('/resetpassword/:resettoken', resetPassword);

module.exports = router;
