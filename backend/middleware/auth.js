const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.protect = async (req, res, next) => {
  try {
    let token;

    /**
     * 1️⃣ PRIMARY: Read token from cookies (your original logic)
     */
    if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    /**
     * 2️⃣ OPTIONAL FALLBACK (does NOT remove cookie auth)
     * Allows Authorization header if cookies fail in production
     */
    if (!token && req.headers.authorization?.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    /**
     * 3️⃣ No token → unauthorized
     */
    if (!token) {
      return res.status(401).json({
        message: 'Not authorized, please login'
      });
    }

    /**
     * 4️⃣ Verify JWT
     */
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      console.error('JWT verification failed:', err.message);
      return res.status(401).json({
        message: 'Not authorized, token invalid or expired'
      });
    }

    /**
     * 5️⃣ Validate decoded payload
     */
    if (!decoded || !decoded.id) {
      return res.status(401).json({
        message: 'Not authorized, invalid token payload'
      });
    }

    /**
     * 6️⃣ Fetch user
     */
    req.user = await User.findById(decoded.id).select('-password');

    if (!req.user) {
      return res.status(401).json({
        message: 'User not found'
      });
    }

    /**
     * 7️⃣ Success
     */
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(401).json({
      message: 'Not authorized, token failed'
    });
  }
};
