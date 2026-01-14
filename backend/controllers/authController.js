const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Generate JWT Token with SHORT expiry for session-only
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '12h' // Token expires in 12 hours
  });
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

    // Clear any existing cookies first
    res.clearCookie('token');

    // Set SESSION cookie (no maxAge, no expires)
    res.cookie('token', token, {
      httpOnly: true,
      secure: false, // Set to false for localhost
      sameSite: 'lax', // Changed from 'strict' to 'lax'
      path: '/'
    });

    console.log('✅ User registered, session cookie set');

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

    // Clear any existing cookies first
    res.clearCookie('token');

    // Set SESSION cookie (no maxAge, no expires)
    res.cookie('token', token, {
      httpOnly: true,
  secure: true,        // REQUIRED (Netlify + Render = HTTPS)
  sameSite: "None",    // REQUIRED for cross-domain
  maxAge: 7 * 24 * 60 * 60 * 1000,// Changed from 'strict' to 'lax'
      path: '/'
    });

    console.log('✅ User logged in, session cookie set');

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login', error: error.message });
  }
};

// @route   POST /api/auth/logout
exports.logout = (req, res) => {
  // Clear the cookie
  res.clearCookie('token', {
    httpOnly: true,
    secure: false,
    sameSite: 'lax',
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