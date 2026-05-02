const mongoose = require('mongoose');

const planSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        year: { type: Number, required: true },
        month: { type: Number, required: true }, // 1-12
        status: {
            type: String,
            enum: ['Draft', 'Saved'],
            default: 'Draft',
        },
    },
    { timestamps: true }
);

// One plan per user per month
planSchema.index({ userId: 1, year: 1, month: 1 }, { unique: true });

module.exports = mongoose.model('Plan', planSchema);
