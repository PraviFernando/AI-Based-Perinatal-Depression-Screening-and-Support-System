const User = require('../models/User');
const bcrypt = require('bcryptjs');

// GET /admin/stats
const getStats = async (req, res, next) => {
    try {
        const [totalUsers, totalPatients, totalMidwives, totalAdmins] = await Promise.all([
            User.countDocuments(),
            User.countDocuments({ role: 'patient' }),
            User.countDocuments({ role: 'midwife' }),
            User.countDocuments({ role: 'admin' }),
        ]);
        res.json({ totalUsers, totalPatients, totalMidwives, totalAdmins });
    } catch (err) {
        next(err);
    }
};

// GET /admin/users  (optional ?role=midwife filter)
const getAllUsers = async (req, res, next) => {
    try {
        const { role } = req.query;
        const filter = role ? { role } : {};
        const users = await User.find(filter).select('-password').sort({ createdAt: -1 });
        res.json(users);
    } catch (err) {
        next(err);
    }
};

// GET /admin/users/:id
const getUserById = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id).select('-password');
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json(user);
    } catch (err) {
        next(err);
    }
};

// POST /admin/users  — create any user (admin, midwife, patient …)
const createUser = async (req, res, next) => {
    const { username, email, password, role } = req.body;
    if (!username || !email || !password) {
        return res.status(400).json({ message: 'Username, email and password are required' });
    }
    try {
        const existing = await User.findOne({ email });
        if (existing) return res.status(400).json({ message: 'Email already in use' });

        const hashed = await bcrypt.hash(password, 12);
        const newUser = await User.create({ username, email, password: hashed, role: role || 'patient' });
        const { password: _p, ...safe } = newUser._doc;
        res.status(201).json({ message: 'User created', user: safe });
    } catch (err) {
        next(err);
    }
};

// PATCH /admin/users/:id
const updateUser = async (req, res, next) => {
    try {
        const { username, role } = req.body;
        const update = {};
        if (username) update.username = username;
        if (role) update.role = role;

        const updated = await User.findByIdAndUpdate(req.params.id, update, { new: true }).select('-password');
        if (!updated) return res.status(404).json({ message: 'User not found' });
        res.json({ message: 'User updated', user: updated });
    } catch (err) {
        next(err);
    }
};

// DELETE /admin/users/:id
const deleteUser = async (req, res, next) => {
    try {
        const deleted = await User.findByIdAndDelete(req.params.id);
        if (!deleted) return res.status(404).json({ message: 'User not found' });
        res.json({ message: 'User deleted' });
    } catch (err) {
        next(err);
    }
};

module.exports = { getStats, getAllUsers, getUserById, createUser, updateUser, deleteUser };
