const mongoose = require('mongoose');

const exerciseRecordSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: String, required: true }, // YYYY-MM-DD
    exerciseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Exercise' },
    customActivityName: { type: String },
    status: { type: String, enum: ['pending', 'completed', 'skipped', 'restricted'], default: 'pending' },
    accuracy: { type: Number, min: 0, max: 100 },
    feedback: { type: String },
    videoUrl: { type: String },
    durationCompleted: { type: Number }, // minutes completed
    performanceMetrics: {
        postureScore: { type: Number, default: 0 },
        rangeOfMotion: { type: Number, default: 0 },
        stabilityScore: { type: Number, default: 0 }
    },
    userFeedback: { type: String },
    liked: { type: Boolean, default: null }
}, { timestamps: true });

module.exports = mongoose.model('ExerciseRecord', exerciseRecordSchema);