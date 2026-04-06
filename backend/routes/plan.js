const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/authMiddleware');
const {
    getOrCreatePlan,
    getPlanDetails,
    saveDetail,
    updateDetail,
    updatePlanStatus,
} = require('../controllers/plan');

router.get('/:year/:month', verifyToken, getOrCreatePlan);      // GET  /plan/2026/3
router.get('/:planId/details', verifyToken, getPlanDetails);    // GET  /plan/:planId/details
router.post('/detail', verifyToken, saveDetail);                // POST /plan/detail
router.put('/detail/:detailId', verifyToken, updateDetail);     // PUT  /plan/detail/:id
router.put('/:planId/status', verifyToken, updatePlanStatus);   // PUT  /plan/:planId/status

module.exports = router;
