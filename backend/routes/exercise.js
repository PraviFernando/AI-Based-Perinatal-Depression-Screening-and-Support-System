const express = require('express');
const router = express.Router();
const { verifyToken, verifyRole } = require('../middleware/authMiddleware');
const {
    submitHealthData,
    getHealthData,
    getRecommendations,
    saveExerciseRecord,
    uploadVideo,
    getProgress,
    seedExercises
} = require('../controllers/exercise');

// All exercise routes require authentication
router.use(verifyToken);

// Health data submission
router.post('/health-data', submitHealthData);
router.get('/health-data/:date', getHealthData);

// Recommendations
router.get('/recommendations/:date', getRecommendations);

// Exercise records
router.post('/record', saveExerciseRecord);

// Video upload & analysis
router.post('/video/upload', uploadVideo);

// Progress tracking
router.get('/progress', getProgress);

// Seed exercises (admin only or remove in production)
router.post('/seed', verifyRole('admin'), seedExercises);

module.exports = router;