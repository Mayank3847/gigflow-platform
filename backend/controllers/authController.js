const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '12h'
  });
};

// ✅ Cookie options (PRODUCTION SAFE)
const cookieOptions = {
  httpOnly: true,
  secure: true,          // REQUIRED for Render (HTTPS)
  sameSite: 'None',      // REQUIRED for Netlify ⇄ Render
  path: '/',
  maxAge: 7 * 24 * 60 * 60 * 1000
};

// @route   POST /api/auth/register
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please provide all fields' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    const user = await User.create({ name, email, password });

    if (!user) {
      return res.status(400).json({ message: 'Failed to create user' });
    }

    const token = generateToken(user._id);

    // ✅ SET COOKIE (DO NOT CLEAR BEFORE SET)
    res.cookie('token', token, cookieOptions);

    console.log('✅ User registered, auth cookie set');

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email
    });
  } catch (error) {
    console.error('Register error:', error);

    if (error.code === 11000) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    res.status(500).json({
      message: 'Server error during registration',
      error: error.message
    });
  }
};

// @route   POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = generateToken(user._id);

    // ✅ SET COOKIE (NO PRE-CLEAR)
    res.cookie('token', token, cookieOptions);

    console.log('✅ User logged in, auth cookie set');

    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      message: 'Server error during login',
      error: error.message
    });
  }
};

// @route   POST /api/auth/logout
exports.logout = (req, res) => {
  // ✅ Clear cookie correctly (no maxAge)
  res.clearCookie('token', {
    httpOnly: true,
    secure: true,
    sameSite: 'None',
    path: '/'
  });

  console.log('✅ User logged out, cookie cleared');

  res.json({ message: 'Logged out successfully' });
};

// @route   GET /api/auth/me
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json(user);
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
