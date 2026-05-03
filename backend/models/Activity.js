const mongoose = require('mongoose');

const ActivitySchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    date: {
        type: String, // YYYY-MM-DD
        required: true
    },
    activityId: {
        type: String,
        required: true
    },
    activityName: {
        type: String,
        required: true
    },
    timeOfDay: {
        type: String,
        enum: ['Morning', 'Midday', 'Afternoon', 'Night'],
        required: true
    },
    icon: {
        type: String,
        default: '🌟'
    },
    completed: {
        type: Boolean,
        default: false
    },
    timerSeconds: {
        type: Number,
        default: 0
    },
    isCustom: {
        type: Boolean,
        default: false
    },
    note: {
        type: String,
        default: ''
    }
}, { timestamps: true });

// Ensure unique index for user + date + activityId
ActivitySchema.index({ userId: 1, date: 1, activityId: 1 }, { unique: true });

module.exports = mongoose.model('Activity', ActivitySchema);
