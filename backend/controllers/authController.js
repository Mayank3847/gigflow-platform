// controllers/authController.js - Complete Authentication Controller
const User = require('../models/User');
const jwt = require('jsonwebtoken');

/**
 * Generate JWT Token
 * @param {string} id - User ID
 * @returns {string} JWT token
 */
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '7d' // 7 days expiration
  });
};

/**
 * ✅ Cookie options (PRODUCTION SAFE)
 * These settings are CRITICAL for cross-origin authentication (Netlify ⇄ Render)
 */
const getCookieOptions = () => {
  const isProduction = process.env.NODE_ENV === 'production';
  
  return {
    httpOnly: true,           // CRITICAL: Prevents XSS attacks
    secure: isProduction,     // REQUIRED for HTTPS (Render)
    sameSite: isProduction ? 'None' : 'Lax', // REQUIRED for cross-origin (Netlify ⇄ Render)
    path: '/',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days in milliseconds
  };
};

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validation
    if (!name || !email || !password) {
      console.log('❌ Registration failed: Missing fields');
      return res.status(400).json({ 
        message: 'Please provide all fields',
        success: false 
      });
    }

    if (password.length < 6) {
      console.log('❌ Registration failed: Password too short');
      return res.status(400).json({ 
        message: 'Password must be at least 6 characters',
        success: false 
      });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.log('❌ Registration failed: Invalid email format');
      return res.status(400).json({ 
        message: 'Please provide a valid email address',
        success: false 
      });
    }

    // Check if user already exists
    const userExists = await User.findOne({ email: email.toLowerCase() });
    if (userExists) {
      console.log('❌ Registration failed: User already exists');
      return res.status(400).json({ 
        message: 'User already exists with this email',
        success: false 
      });
    }

    // Create user
    const user = await User.create({ 
      name: name.trim(), 
      email: email.toLowerCase().trim(), 
      password 
    });

    if (!user) {
      console.log('❌ Registration failed: Could not create user');
      return res.status(400).json({ 
        message: 'Failed to create user',
        success: false 
      });
    }

    // Generate token
    const token = generateToken(user._id);

    // ✅ SET COOKIE (DO NOT CLEAR BEFORE SET)
    const cookieOptions = getCookieOptions();
    res.cookie('token', token, cookieOptions);

    console.log('✅ User registered successfully:', user.email);
    console.log('✅ Auth cookie set with options:', cookieOptions);

    // Send response
    res.status(201).json({
      success: true,
      message: 'Registration successful',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email
      },
      token // Also send in response for localStorage backup
    });

  } catch (error) {
    console.error('❌ Register error:', error);

    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({ 
        message: 'User already exists with this email',
        success: false 
      });
    }

    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ 
        message: messages.join(', '),
        success: false 
      });
    }

    res.status(500).json({
      message: 'Server error during registration',
      success: false,
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @route   POST /api/auth/login
 * @desc    Login user & set cookie
 * @access  Public
 */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      console.log('❌ Login failed: Missing credentials');
      return res.status(400).json({ 
        message: 'Please provide email and password',
        success: false 
      });
    }

    // Find user and include password for comparison
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

    if (!user) {
      console.log('❌ Login failed: User not found');
      return res.status(401).json({ 
        message: 'Invalid email or password',
        success: false 
      });
    }

    // Compare password
    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      console.log('❌ Login failed: Invalid password');
      return res.status(401).json({ 
        message: 'Invalid email or password',
        success: false 
      });
    }

    // Generate token
    const token = generateToken(user._id);

    // ✅ SET COOKIE (NO PRE-CLEAR)
    const cookieOptions = getCookieOptions();
    res.cookie('token', token, cookieOptions);

    console.log('✅ User logged in successfully:', user.email);
    console.log('✅ Auth cookie set with options:', cookieOptions);

    // Send response
    res.status(200).json({
      success: true,
      message: 'Login successful',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email
      },
      token // Also send in response for localStorage backup
    });

  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({
      message: 'Server error during login',
      success: false,
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user & clear cookie
 * @access  Private
 */
exports.logout = (req, res) => {
  try {
    // ✅ Clear cookie correctly
    const isProduction = process.env.NODE_ENV === 'production';
    
    res.clearCookie('token', {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'None' : 'Lax',
      path: '/'
    });

    console.log('✅ User logged out, cookie cleared');

    res.status(200).json({ 
      success: true,
      message: 'Logged out successfully' 
    });

  } catch (error) {
    console.error('❌ Logout error:', error);
    res.status(500).json({
      message: 'Server error during logout',
      success: false
    });
  }
};

/**
 * @route   GET /api/auth/me
 * @desc    Get current logged-in user
 * @access  Private (requires protect middleware)
 */
exports.getMe = async (req, res) => {
  try {
    // User is already attached to req by protect middleware
    const user = await User.findById(req.user._id).select('-password');

    if (!user) {
      console.log('❌ User not found');
      return res.status(404).json({ 
        message: 'User not found',
        success: false 
      });
    }

    console.log('✅ User data retrieved:', user.email);

    res.status(200).json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt
      }
    });

  } catch (error) {
    console.error('❌ Get me error:', error);
    res.status(500).json({ 
      message: 'Server error',
      success: false,
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @route   PUT /api/auth/update
 * @desc    Update user profile (optional feature)
 * @access  Private
 */
exports.updateProfile = async (req, res) => {
  try {
    const { name, email } = req.body;

    // Find user
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ 
        message: 'User not found',
        success: false 
      });
    }

    // Update fields if provided
    if (name) user.name = name.trim();
    if (email) {
      // Check if email is already taken
      const emailExists = await User.findOne({ 
        email: email.toLowerCase(), 
        _id: { $ne: user._id } 
      });
      
      if (emailExists) {
        return res.status(400).json({ 
          message: 'Email already in use',
          success: false 
        });
      }
      
      user.email = email.toLowerCase().trim();
    }

    await user.save();

    console.log('✅ User profile updated:', user.email);

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email
      }
    });

  } catch (error) {
    console.error('❌ Update profile error:', error);
    res.status(500).json({
      message: 'Server error during profile update',
      success: false,
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};