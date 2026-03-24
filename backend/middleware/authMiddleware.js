const jwt = require('jsonwebtoken');

/**
 * Supports both:
 *  - httpOnly cookie: access_token  (mobile / same-origin)
 *  - Authorization: Bearer <token>  (Expo Web cross-origin)
 */
const verifyToken = (req, res, next) => {
    const cookie = req.cookies?.access_token;
    const header = req.headers?.authorization?.replace('Bearer ', '').trim();
    const token = cookie || header;

    if (!token) {
        return res.status(401).json({ message: 'Unauthorized – no token provided' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // { id, role }
        next();
    } catch (err) {
        return res.status(401).json({ message: 'Unauthorized – invalid or expired token' });
    }
};

/**
 * verifyRole(...roles) – call AFTER verifyToken
 * Example: router.use(verifyToken, verifyRole('admin'))
 */
const verifyRole = (...roles) => (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
        return res.status(403).json({ message: 'Forbidden – insufficient permissions' });
    }
    next();
};

module.exports = { verifyToken, verifyRole };
