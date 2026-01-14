// middleware/auth.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * 🔐 Authentication Middleware
 * Protects routes by verifying JWT token from cookies or Authorization header
 */
exports.protect = async (req, res, next) => {
  try {
    let token;

    /**
     * 1️⃣ PRIMARY: Read token from HttpOnly cookies (MAIN AUTH METHOD)
     * This is REQUIRED for Netlify → Render cross-origin authentication
     */
    if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
      console.log('✅ Token found in cookies');
    }

    /**
     * 2️⃣ FALLBACK: Read token from Authorization header
     * Allows Bearer token if cookies are not present (for mobile apps, Postman, etc.)
     */
    if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
      console.log('✅ Token found in Authorization header');
    }

    /**
     * 3️⃣ No token found → unauthorized
     */
    if (!token) {
      console.log('❌ No token found in cookies or headers');
      return res.status(401).json({
        message: 'Not authorized, please login',
        success: false
      });
    }

    /**
     * 4️⃣ Verify JWT token
     */
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('✅ Token verified successfully for user ID:', decoded.id);
    } catch (err) {
      console.error('❌ JWT verification failed:', err.message);
      
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({
          message: 'Token expired, please login again',
          success: false
        });
      }
      
      return res.status(401).json({
        message: 'Not authorized, invalid token',
        success: false
      });
    }

    /**
     * 5️⃣ Validate decoded payload
     */
    if (!decoded || !decoded.id) {
      console.error('❌ Invalid token payload');
      return res.status(401).json({
        message: 'Not authorized, invalid token payload',
        success: false
      });
    }

    /**
     * 6️⃣ Fetch user from database (exclude password)
     */
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      console.error('❌ User not found for ID:', decoded.id);
      return res.status(401).json({
        message: 'User not found',
        success: false
      });
    }

    /**
     * 7️⃣ Attach user to request object
     */
    req.user = user;
    console.log('✅ User authenticated:', user.email);

    /**
     * 8️⃣ SUCCESS — proceed to next middleware/route handler
     */
    next();

  } catch (error) {
    console.error('❌ Auth middleware error:', error);
    return res.status(401).json({
      message: 'Not authorized, authentication failed',
      success: false,
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * 🔐 Optional: Check if user is gig owner
 * Use this middleware AFTER protect middleware
 */
exports.isGigOwner = async (req, res, next) => {
  try {
    const Gig = require('../models/Gig');
    const gig = await Gig.findById(req.params.gigId || req.params.id);

    if (!gig) {
      return res.status(404).json({
        message: 'Gig not found',
        success: false
      });
    }

    // Check if current user is the gig owner
    if (gig.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: 'Not authorized to access this resource',
        success: false
      });
    }

    // Attach gig to request for convenience
    req.gig = gig;
    next();

  } catch (error) {
    console.error('❌ isGigOwner middleware error:', error);
    return res.status(500).json({
      message: 'Server error',
      success: false
    });
  }
};