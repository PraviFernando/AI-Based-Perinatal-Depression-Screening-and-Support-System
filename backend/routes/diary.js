const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/authMiddleware');
const { getDiary, saveDiary, listDiaryDates } = require('../controllers/diary');

router.get('/', verifyToken, listDiaryDates);       // GET  /diary
router.get('/:date', verifyToken, getDiary);         // GET  /diary/2026-03-05
router.post('/', verifyToken, saveDiary);            // POST /diary  { date, content }

module.exports = router;
