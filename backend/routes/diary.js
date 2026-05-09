const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/authMiddleware');
const {
    getDiary,
    saveDiary,
    listDiaryDates,
    checkDiaryPassword,
    setDiaryPassword
} = require('../controllers/diary');

const {
    diaryValidationRules,
    isTodayValidation,
    validate
} = require('../middleware/diaryValidation');

// Public Routes (with validation)
router.get('/', verifyToken, listDiaryDates);

router.get('/:date', verifyToken, diaryValidationRules[0], validate, getDiary);

router.post('/',
    verifyToken,
    diaryValidationRules,
    isTodayValidation,        // ← Important: Only today allowed
    validate,
    saveDiary
);

router.post('/auth/check', verifyToken, checkDiaryPassword);
router.post('/auth/set', verifyToken, setDiaryPassword);

module.exports = router;