const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/authMiddleware');
const {
    upsertActivity,
    getMonthActivities,
    getDateActivities,
    deleteActivity
} = require('../controllers/activity');

router.post('/', verifyToken, upsertActivity);
router.get('/month/:year/:month', verifyToken, getMonthActivities);
router.get('/date/:date', verifyToken, getDateActivities);
router.delete('/:id', verifyToken, deleteActivity);

module.exports = router;
