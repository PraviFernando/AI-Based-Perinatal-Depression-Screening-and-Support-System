const Activity = require('../models/Activity');

// POST /activity - Upsert an activity record
const upsertActivity = async (req, res, next) => {
    try {
        const { date, activityId, activityName, timeOfDay, icon, completed, timerSeconds, isCustom, note } = req.body;
        const userId = req.user.id;

        const record = await Activity.findOneAndUpdate(
            { userId, date, activityId },
            { 
                activityName, 
                timeOfDay, 
                icon, 
                completed, 
                timerSeconds, 
                isCustom: !!isCustom,
                note: note || ''
            },
            { new: true, upsert: true, setDefaultsOnInsert: true }
        );

        res.status(200).json({ message: 'Activity record updated', record });
    } catch (err) {
        next(err);
    }
};

// GET /activity/month/:year/:month - Get all activity records for a specific month
const getMonthActivities = async (req, res, next) => {
    try {
        const { year, month } = req.params;
        const userId = req.user.id;
        
        // Match date string starting with YYYY-MM
        const monthStr = `${year}-${String(month).padStart(2, '0')}`;
        const records = await Activity.find({ 
            userId, 
            date: { $regex: `^${monthStr}` } 
        });

        res.status(200).json(records);
    } catch (err) {
        next(err);
    }
};

// GET /activity/date/:date - Get activity records for a specific date
const getDateActivities = async (req, res, next) => {
    try {
        const { date } = req.params;
        const userId = req.user.id;

        const records = await Activity.find({ userId, date });
        res.status(200).json(records);
    } catch (err) {
        next(err);
    }
};

// DELETE /activity/:id - Delete a specific activity record (usually for custom ones)
const deleteActivity = async (req, res, next) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const record = await Activity.findOneAndDelete({ _id: id, userId });
        if (!record) return res.status(404).json({ message: 'Activity record not found' });

        res.status(200).json({ message: 'Activity record deleted' });
    } catch (err) {
        next(err);
    }
};

module.exports = {
    upsertActivity,
    getMonthActivities,
    getDateActivities,
    deleteActivity
};
