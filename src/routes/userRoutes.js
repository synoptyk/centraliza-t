const express = require('express');
const router = express.Router();
const {
    registerUser,
    getUsers,
    updateUser,
    deleteUser,
    bulkRegisterUsers,
    uploadAvatar
} = require('../controllers/userController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { upload } = require('../config/cloudinary');

router.route('/')
    .post(protect, authorize('Ceo_Centralizat', 'Admin_Empresa'), registerUser)
    .get(protect, authorize('Ceo_Centralizat', 'Admin_Centralizat', 'Admin_Empresa'), getUsers);

router.post('/bulk', protect, authorize('Ceo_Centralizat'), bulkRegisterUsers);

// Upload Avatar Route
router.post('/upload-avatar', protect, upload.single('file'), uploadAvatar);

router.route('/:id')
    .put(protect, authorize('Ceo_Centralizat'), updateUser)
    .delete(protect, authorize('Ceo_Centralizat'), deleteUser);

module.exports = router;
