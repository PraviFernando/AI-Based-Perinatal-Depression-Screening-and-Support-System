const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/authMiddleware');
const { getDiary, saveDiary, listDiaryDates, checkDiaryPassword, setDiaryPassword } = require('../controllers/diary');

router.get('/', verifyToken, listDiaryDates);
router.get('/:date', verifyToken, getDiary);
router.post('/', verifyToken, saveDiary);
router.post('/auth/check', verifyToken, checkDiaryPassword);
router.post('/auth/set', verifyToken, setDiaryPassword);

module.exports = router;
