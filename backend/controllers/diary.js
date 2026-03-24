const Diary = require('../models/Diary');

// GET  /diary/:date  — fetch diary entry for authenticated user on a given date
const getDiary = async (req, res, next) => {
    try {
        const { date } = req.params;
        const userId = req.user.id;

        const entry = await Diary.findOne({ userId, date });
        res.status(200).json(entry || { userId, date, content: '' });
    } catch (err) {
        next(err);
    }
};

// POST /diary  — upsert (create or update) diary entry
const saveDiary = async (req, res, next) => {
    try {
        const { date, content } = req.body;
        const userId = req.user.id;

        if (!date) {
            return res.status(400).json({ message: 'date is required (YYYY-MM-DD)' });
        }

        const entry = await Diary.findOneAndUpdate(
            { userId, date },
            { content },
            { new: true, upsert: true, setDefaultsOnInsert: true }
        );

        res.status(200).json({ message: 'Diary saved', entry });
    } catch (err) {
        next(err);
    }
};

// GET /diary  — list all diary dates that have entries for this user
const listDiaryDates = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const entries = await Diary.find({ userId }, 'date updatedAt').sort({ date: -1 });
        res.status(200).json(entries);
    } catch (err) {
        next(err);
    }
};

module.exports = { getDiary, saveDiary, listDiaryDates };
