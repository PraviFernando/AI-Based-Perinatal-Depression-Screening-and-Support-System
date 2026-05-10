const mongoose = require('mongoose');

const postpartumHealthDataSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: String, required: true }, // YYYY-MM-DD
    deliveryDate: { type: String }, // YYYY-MM-DD
    
    // Recovery Stage
    weeksAfterDelivery: { type: Number, required: true },
    deliveryType: { type: String, enum: ['normal', 'c-section'], required: true },
    
    // Pain Indicators
    pelvicPain: { type: Boolean, default: false },
    backPain: { type: Boolean, default: false },
    abdominalPain: { type: Boolean, default: false },
    
    // Medical Conditions
    bleedingComplications: { type: Boolean, default: false },
    doctorRestrictions: { type: Boolean, default: false },
    
    // Physical Condition
    fatigueLevel: { type: String, enum: ['low', 'medium', 'high'], default: 'low' },
    mobilityLevel: { type: String, enum: ['very_limited', 'limited', 'normal'], default: 'normal' },
    muscleWeakness: { type: Boolean, default: false },
    
    // Behavioral Readiness
    willingnessToExercise: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
    
    // PPD Risk Level (received from screening module)
    ppdRiskLevel: { type: String, enum: ['low', 'medium', 'high'], default: 'low' },
    
    // Diary Insights (received from diary module)
    mood: { type: String },
    sentiment: { type: String },
    stressKeywords: [{ type: String }],
    
    // Safety Evaluation Result
    safetyStatus: { type: String, enum: ['safe', 'limited', 'blocked'], default: 'safe' },
    safetyMessage: { type: String },
    safetyMessageSi: { type: String },
    
    // Recommendation Result
    recommendedExercises: [{
        exerciseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Exercise' },
        customName: String,
        videoUrl: String,
        type: { type: String },
        duration: Number,
        completed: { type: Boolean, default: false }
    }]
}, { timestamps: true });

module.exports = mongoose.model('PostpartumHealthData', postpartumHealthDataSchema);