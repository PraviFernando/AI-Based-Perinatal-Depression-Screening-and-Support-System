const Plan = require('../models/Plan');
const PlanDetail = require('../models/PlanDetail');

// GET /plan/:year/:month  — get or auto-create a monthly plan
const getOrCreatePlan = async (req, res, next) => {
    try {
        const { year, month } = req.params;
        const userId = req.user.id;

        let plan = await Plan.findOne({ userId, year: Number(year), month: Number(month) });
        if (!plan) {
            plan = await Plan.create({ userId, year: Number(year), month: Number(month) });
        }

        res.status(200).json(plan);
    } catch (err) {
        next(err);
    }
};

// GET /plan/:planId/details  — all daily details for a plan
const getPlanDetails = async (req, res, next) => {
    try {
        const { planId } = req.params;
        const details = await PlanDetail.find({ planId }).sort({ date: 1 });
        res.status(200).json(details);
    } catch (err) {
        next(err);
    }
};

// POST /plan/detail  — upsert a day detail (create if not exist, else update)
const saveDetail = async (req, res, next) => {
    try {
        const { planId, date, description, status } = req.body;

        if (!planId || !date) {
            return res.status(400).json({ message: 'planId and date are required' });
        }

        const detail = await PlanDetail.findOneAndUpdate(
            { planId, date },
            { description, status: status || 'Draft' },
            { new: true, upsert: true, setDefaultsOnInsert: true }
        );

        res.status(200).json({ message: 'Plan detail saved', detail });
    } catch (err) {
        next(err);
    }
};

// PUT /plan/detail/:detailId  — update a specific detail
const updateDetail = async (req, res, next) => {
    try {
        const { detailId } = req.params;
        const { description, status } = req.body;

        const detail = await PlanDetail.findByIdAndUpdate(
            detailId,
            { description, status },
            { new: true }
        );

        if (!detail) return res.status(404).json({ message: 'Plan detail not found' });
        res.status(200).json({ message: 'Plan detail updated', detail });
    } catch (err) {
        next(err);
    }
};

// PUT /plan/:planId/status  — mark whole month plan as Draft or Saved
const updatePlanStatus = async (req, res, next) => {
    try {
        const { planId } = req.params;
        const { status } = req.body;

        const plan = await Plan.findByIdAndUpdate(planId, { status }, { new: true });
        if (!plan) return res.status(404).json({ message: 'Plan not found' });
        res.status(200).json({ message: 'Plan status updated', plan });
    } catch (err) {
        next(err);
    }
};

module.exports = { getOrCreatePlan, getPlanDetails, saveDetail, updateDetail, updatePlanStatus };
