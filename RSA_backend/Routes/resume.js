const express = require("express");
const router = express.Router();
const ResumeController = require('../Controllers/resume');
const { upload } = require('../utils/multer');
const { authMiddleware, adminGuard } = require('../utils/firebaseAdmin');
const { addResume, getUserResumes } = require('../utils/validators');

router.post('/addresume', authMiddleware, upload.single("resume"), addResume, ResumeController.addResume)
router.get('/get/:user', authMiddleware, getUserResumes, ResumeController.getAllResumesForUser);
router.get('/get', authMiddleware, adminGuard, ResumeController.getResumeForAdmin);

module.exports = router;
