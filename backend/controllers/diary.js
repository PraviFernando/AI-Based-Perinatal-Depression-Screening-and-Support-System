const Diary = require('../models/Diary');
const User = require('../models/User');

const getDiary = async (req, res, next) => {
    try {
        const { date } = req.params;
        const userId = req.user.id;

        const entry = await Diary.findOne({ userId, date });
        res.status(200).json(entry || { userId, date, content: '', isLocked: false, theme: 'default', media: [], mood: '😊', sentiment: 'Skipped' });
    } catch (err) {
        next(err);
    }
};

const saveDiary = async (req, res, next) => {
    try {
        const { date, content, isLocked, theme, media, mood, sentiment } = req.body;
        const userId = req.user.id;

        if (!date) {
            return res.status(400).json({ message: 'date is required (YYYY-MM-DD)' });
        }

        const updateData = { content };
        if (isLocked !== undefined) updateData.isLocked = isLocked;
        if (theme !== undefined) updateData.theme = theme;
        if (media !== undefined) updateData.media = media;
        if (mood !== undefined) updateData.mood = mood;
        if (sentiment !== undefined) updateData.sentiment = sentiment;

        const entry = await Diary.findOneAndUpdate(
            { userId, date },
            updateData,
            { returnDocument: 'after', upsert: true, setDefaultsOnInsert: true }
        );

        res.status(200).json({ message: 'Diary saved', entry });
    } catch (err) {
        next(err);
    }
};

const listDiaryDates = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const entries = await Diary.find({ userId }).sort({ date: -1 });

        const totalJournals = entries.length;
        let totalWords = 0;
        entries.forEach(entry => {
            if (entry.content) {
                totalWords += entry.content.trim().split(/\s+/).filter(Boolean).length;
            }
        });

        res.status(200).json({ entries: entries.map(e => ({ date: e.date, updatedAt: e.updatedAt })), stats: { totalJournals, totalWords } });
    } catch (err) {
        next(err);
    }
};

const checkDiaryPassword = async (req, res, next) => {
    try {
        const { password } = req.body;
        const user = await User.findById(req.user.id);

        if (!user.diaryPassword) {
            return res.status(200).json({ valid: true, needsSetup: true });
        }

        if (user.diaryPassword === password) {
            return res.status(200).json({ valid: true });
        }

        return res.status(401).json({ valid: false, message: 'Incorrect diary password' });
    } catch (err) {
        next(err);
    }
};

const setDiaryPassword = async (req, res, next) => {
    try {
        const { password } = req.body;
        const user = await User.findById(req.user.id);
        user.diaryPassword = password;
        await user.save();
        res.status(200).json({ message: 'Diary password updated successfully' });
    } catch (err) {
        next(err);
    }
};

module.exports = { getDiary, saveDiary, listDiaryDates, checkDiaryPassword, setDiaryPassword };
