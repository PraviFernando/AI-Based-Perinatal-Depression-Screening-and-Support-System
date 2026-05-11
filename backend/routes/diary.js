const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/authMiddleware');
const { getDiary, saveDiary, listDiaryDates, checkDiaryPassword, setDiaryPassword } = require('../controllers/diary');
const { analyzeText } = require('../services/mlService');

router.get('/', verifyToken, listDiaryDates);
router.get('/:date', verifyToken, getDiary);
router.post('/', verifyToken, saveDiary);
router.post('/auth/check', verifyToken, checkDiaryPassword);
router.post('/auth/set', verifyToken, setDiaryPassword);
// =====================================================
// ANALYZE TEXT ROUTE
// =====================================================

router.post('/analyze', async (req, res) => {

    try {

        const { text } = req.body;

        const result = await analyzeText(text);

        res.json(result);

    } catch (error) {

        console.log(error);

        res.status(500).json({
            message: 'Analyze failed'
        });

    }

});


module.exports = router;
