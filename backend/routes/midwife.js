const express = require('express');
const router = express.Router();
const { verifyToken, verifyRole } = require('../middleware/authMiddleware');
const { getMidwifeStats, getPatients, getPatientById } = require('../controllers/midwife');

// All routes: must be authenticated AND have midwife or admin role
router.use(verifyToken, verifyRole('midwife', 'admin'));

router.get('/stats', getMidwifeStats);
router.get('/patients', getPatients);
router.get('/patients/:id', getPatientById);

module.exports = router;
