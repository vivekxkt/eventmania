const jwt = require('jsonwebtoken');
const User = require('../models/User');

// User auth
const protect = async (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];

    if (token) {
        try {
            const decode = jwt.verify(token, process.env.JWT_SECRET);
            req.user = await User.findById(decode.id).select('-password');

            if (!req.user) {
                return res.status(401).json({
                    message: "Not authorized"
                });
            }
            next();
        } catch (error) {
            return res.status(401).json({
                message: "Not authorized"
            });
        }
    } else {
        return res.status(401).json({
            message: "Not authorized"
        });
    }
};

// Check admin
const admin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        return res.status(403).json({
            message: "Admin access required"
        });
    }
};

module.exports = { protect, admin };