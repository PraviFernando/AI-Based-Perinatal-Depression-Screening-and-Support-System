const mongoose = require('mongoose');

const exerciseSchema = new mongoose.Schema({
    name: { type: String, required: true },
    nameSi: { type: String, required: true },
    type: { type: String, enum: ['breathing', 'stretching', 'pelvic_floor', 'light_movement', 'walking'], required: true },
    intensity: { type: String, enum: ['low', 'medium', 'controlled'], required: true },
    duration: { type: Number, required: true }, // in minutes
    description: { type: String },
    descriptionSi: { type: String },
    videoUrl: { type: String },
    videos: [{
        url: { type: String, required: true },
        title: { type: String },
        titleSi: { type: String },
        duration: { type: String },
        source: { type: String }
    }],
    steps: [{
        stepNumber: Number,
        instruction: String,
        instructionSi: String,
        duration: Number
    }],
    correctJoints: [{
        joint: String,
        expectedAngle: Number,
        tolerance: Number
    }],
    contraindications: [{
        condition: String,
        restrictionLevel: String
    }]
}, { timestamps: true });

module.exports = mongoose.model('Exercise', exerciseSchema);