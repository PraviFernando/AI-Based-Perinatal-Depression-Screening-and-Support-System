const { body, param, validationResult } = require('express-validator');

const planActivityValidation = [
    body('date')
        .notEmpty()
        .withMessage('Date is required')
        .matches(/^\d{4}-\d{2}-\d{2}$/)
        .withMessage('Date must be in YYYY-MM-DD format'),

    body('activityId')
        .notEmpty()
        .withMessage('Activity ID is required'),

    body('activityName')
        .notEmpty()
        .withMessage('Activity name is required')
        .trim()
        .isLength({ max: 100 })
        .withMessage('Activity name is too long'),

    body('timeOfDay')
        .optional()
        .isIn(['Morning', 'Midday', 'Afternoon', 'Night'])
        .withMessage('Invalid time of day'),

    body('completed')
        .optional()
        .isBoolean()
        .withMessage('Completed must be boolean'),

    body('timerSeconds')
        .optional()
        .isInt({ min: 0 })
        .withMessage('Timer seconds must be positive number'),

    body('isCustom')
        .optional()
        .isBoolean(),
];

// Only allow today and future dates
const isNotPastDate = (req, res, next) => {
    const { date } = req.body;
    if (!date) return next();

    const today = new Date().toISOString().split('T')[0];
    if (date < today) {
        return res.status(400).json({
            message: 'You cannot create or edit activities for previous days'
        });
    }
    next();
};

const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            message: errors.array()[0].msg
        });
    }
    next();
};

module.exports = {
    planActivityValidation,
    isNotPastDate,
    validate
};