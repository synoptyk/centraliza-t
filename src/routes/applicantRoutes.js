const express = require('express');
const router = express.Router();
const { upload } = require('../config/cloudinary');
const {
    registerApplicant,
    getApplicants,
    updateApplicant,
    updateApplicantStatus,
    registerInterview,
    confirmInterview,
    rescheduleInterview,
    cancelInterview,
    suspendInterview,
    getInterviewsCalendar,
    uploadContractDocument,
    deleteContractDocument,
    createCustomContractDocument,
    updateContractDocStatus,
    updateAccreditationItem,
    updateTests,
    sendPsycholaborTest,
    getPublicTest,
    submitTestResponses,
    getTestResults,
    processRemoteApproval,
    getRemoteApprovalDetails,
    processFiniquito,
    uploadFiniquitoDocument,
    importLegacyWorkforce,
    addCollaboratorNote
} = require('../controllers/applicantController');

const {
    assignCurriculumToApplicant,
    uploadCurriculumDocument,
    updateCurriculumItemStatus,
    assignBATStandard
} = require('../controllers/curriculumController');

const { protect } = require('../middleware/authMiddleware');
const { checkSubscriptionStatus, checkResourceLimits } = require('../middleware/subscriptionMiddleware');
const { validate, createApplicantSchema } = require('../middleware/validators');

router.route('/')
    .get(protect, getApplicants)
    .post(protect, checkSubscriptionStatus, checkResourceLimits('applicants'), validate(createApplicantSchema), registerApplicant);

router.route('/bulk-legacy').post(protect, importLegacyWorkforce);

router.route('/:id')
    .put(protect, updateApplicant);
// .get(protect, getOneApplicant) // If needed later

router.route('/:id/finiquitar').put(protect, processFiniquito);
router.route('/:id/finiquito-documento').put(protect, upload.single('file'), uploadFiniquitoDocument);

router.route('/:id/status').put(protect, updateApplicantStatus);
router.route('/:id/interview').put(protect, registerInterview);
router.route('/:id/interview/confirm').put(protect, confirmInterview);
router.route('/:id/interview/reschedule').put(protect, rescheduleInterview);
router.route('/:id/interview/cancel').put(protect, cancelInterview);
router.route('/:id/interview/suspend').put(protect, suspendInterview);
router.route('/interviews/calendar').get(protect, getInterviewsCalendar);
router.route('/:id/tests').put(protect, updateTests);
router.route('/:id/tests/send-psycholabor').post(protect, sendPsycholaborTest);
router.route('/:id/tests/results').get(protect, getTestResults);
router.route('/:id/notes').post(protect, addCollaboratorNote);

// Contract Documents (Module 5 - Universal)
router.route('/:id/contract-docs').post(protect, upload.single('file'), uploadContractDocument);
router.route('/:id/contract-docs/custom').post(protect, createCustomContractDocument);
router.route('/:id/contract-docs/:docId')
    .delete(protect, deleteContractDocument);
router.route('/:id/contract-docs/:docId/status').put(protect, updateContractDocStatus);

// Prevention Documents (Module 5B - Variable by position)
router.route('/:id/prevention/assign').post(protect, assignCurriculumToApplicant);
router.route('/:id/prevention/bat/:type').post(protect, assignBATStandard);
router.route('/:id/prevention/upload').post(protect, upload.single('file'), uploadCurriculumDocument);
router.route('/:id/prevention/:type/:itemCode/status').put(protect, updateCurriculumItemStatus);

router.route('/:id/accreditation/:type/:itemName').put(protect, upload.single('file'), updateAccreditationItem);

// PUBLIC ROUTES (No protect)
router.route('/tests/public/:token').get(getPublicTest);
router.route('/tests/public/:token/submit').post(submitTestResponses);
router.route('/:id/remote-details').get(getRemoteApprovalDetails);
router.route('/:id/remote-approval').post(processRemoteApproval);

module.exports = router;
