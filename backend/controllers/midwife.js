const User = require('../models/User');

// GET /midwife/stats
const getMidwifeStats = async (req, res, next) => {
    try {
        const [totalPatients, totalMidwives] = await Promise.all([
            User.countDocuments({ role: 'patient' }),
            User.countDocuments({ role: 'midwife' }),
        ]);
        res.json({ totalPatients, totalMidwives });
    } catch (err) {
        next(err);
    }
};

// GET /midwife/patients
const getPatients = async (req, res, next) => {
    try {
        const midwife = await User.findById(req.user.id);
        const query = { role: 'patient' };
        
        // If midwife has a village, only show patients from that village
        if (midwife && midwife.village) {
            query.village = midwife.village;
        }

        const patients = await User.find(query)
            .select('-password')
            .sort({ createdAt: -1 })
            .lean();

        const EPDSScreening = require('../models/EPDSScreening');
        for (let patient of patients) {
            const latestEpds = await EPDSScreening.findOne({ userId: patient._id }).sort({ month: -1 });
            if (latestEpds) {
                patient.latestEpdsScore = latestEpds.totalScore;
                patient.latestEpdsRisk = latestEpds.riskLevel;
            }
        }

        res.json(patients);
    } catch (err) {
        next(err);
    }
};

// GET /midwife/patients/:id
const getPatientById = async (req, res, next) => {
    try {
        const patient = await User.findOne({ _id: req.params.id, role: 'patient' }).select('-password');
        if (!patient) return res.status(404).json({ message: 'Patient not found' });
        res.json(patient);
    } catch (err) {
        next(err);
    }
};

module.exports = { getMidwifeStats, getPatients, getPatientById };
