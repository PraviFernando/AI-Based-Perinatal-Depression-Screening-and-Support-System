const mongoose = require('mongoose');

const planDetailSchema = new mongoose.Schema(
    {
        planId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Plan',
            required: true,
        },
        date: {
            type: String, // "YYYY-MM-DD"
            required: true,
        },
        description: {
            type: String,
            default: '',
        },
        status: {
            type: String,
            enum: ['Draft', 'Saved'],
            default: 'Draft',
        },
        activities: [{
            activityId: { type: String, required: true },
            activityName: { type: String, required: true },
            timeOfDay: { type: String, required: true },
            icon: { type: String },
            completed: { type: Boolean, default: false },
            timerSeconds: { type: Number, default: 0 },
            isCustom: { type: Boolean, default: false },
            note: { type: String, default: '' }
        }]
    },
    { timestamps: true }
);

// One detail per plan per day
planDetailSchema.index({ planId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('PlanDetail', planDetailSchema);
