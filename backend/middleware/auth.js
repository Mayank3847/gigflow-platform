const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.protect = async (req, res, next) => {
  try {
    let token;

    // Check for token in cookies
    if (req.cookies.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return res.status(401).json({ message: 'Not authorized, please login' });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user from token
    req.user = await User.findById(decoded.id).select('-password');

    if (!req.user) {
      return res.status(401).json({ message: 'User not found' });
    }

    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(401).json({ message: 'Not authorized, token failed' });
  }
};