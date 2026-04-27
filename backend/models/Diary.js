const mongoose = require('mongoose');

const diarySchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        date: {
            type: String, // "YYYY-MM-DD"
            required: true,
        },
        content: {
            type: String,
            default: '',
        },
        isLocked: {
            type: Boolean,
            default: false,
        },
        theme: {
            type: String, // e.g. 'pastel-pink', 'ocean-blue', 'custom-art'
            default: 'default',
        },
        mood: {
            type: String,
            default: '😊',
        },
        sentiment: {
            type: String,
            default: 'Skipped', // Positive, Neutral, Negative, Skipped
        },
        media: [{
            type: { type: String }, // 'image', 'video', 'audio', 'document'
            url: String,
            name: String
        }],
    },
    { timestamps: true }
);

// One diary entry per user per day
diarySchema.index({ userId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Diary', diarySchema);
