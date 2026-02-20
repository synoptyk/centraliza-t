const express = require('express');
const router = express.Router();
const { upload } = require('../config/cloudinary');
const {
    getCurriculumConfig,
    addMasterCourse,
    addMasterExam,
    updateMasterCourse,
    updateMasterExam,
    addHiringDocToMaster,
    configurePositionCurriculum,
    getPositionCurriculum,
    assignCurriculumToApplicant,
    uploadCurriculumDocument,
    updateCurriculumItemStatus,
    deleteMasterCourse,
    deleteMasterExam,
    updateMasterHiringDoc,
    deleteMasterHiringDoc
} = require('../controllers/curriculumController');
const { protect } = require('../middleware/authMiddleware');

// Configuration routes
router.route('/config').get(protect, getCurriculumConfig);

// Master catalog routes
router.route('/courses').post(protect, addMasterCourse);
router.route('/courses/:code')
    .put(protect, updateMasterCourse)
    .delete(protect, deleteMasterCourse);

router.route('/exams').post(protect, addMasterExam);
router.route('/exams/:code')
    .put(protect, updateMasterExam)
    .delete(protect, deleteMasterExam);
router.route('/hiring-docs').post(protect, addHiringDocToMaster);
router.route('/hiring-docs/:code')
    .put(protect, updateMasterHiringDoc)
    .delete(protect, deleteMasterHiringDoc);

// Position curriculum routes
router.route('/position').post(protect, configurePositionCurriculum);
router.route('/position/:position').get(protect, getPositionCurriculum);

module.exports = router;
