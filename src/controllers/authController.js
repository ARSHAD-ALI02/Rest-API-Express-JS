const User = require('../models/User');
const jwt = require('jsonwebtoken');

let bcrypt;
try {
  bcrypt = require('bcryptjs');
} catch (err) {
  bcrypt = require('bcrypt');
}

const JWT_SECRET = process.env.JWT_SECRET || 'home_task_super_secret_jwt_key_2026';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1d';

// @desc    Register a new user
// @route   POST /api/auth/register
exports.register = async (req, res) => {
  try {
    const { email, password } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Please provide both email and password',
        message: 'Please provide both email and password',
      });
    }

    // Step 1: Check if the user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'User already exists with this email',
        message: 'User already exists with this email',
      });
    }

    // Step 2: Use bcrypt to hash the password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Step 3: Save user to the database
    const newUser = await User.create({
      email: email.toLowerCase(),
      password: hashedPassword,
    });

    // Generate JWT token for immediate access
    const token = jwt.sign(
      { id: newUser._id, email: newUser.email },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    return res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: {
        id: newUser._id,
        email: newUser.email,
        createdAt: newUser.createdAt,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error during user registration',
      error: error.message,
    });
  }
};

// @desc    Authenticate user & get token (Login)
// @route   POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Please provide both email and password',
        message: 'Please provide both email and password',
      });
    }

    // Step 1: Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials',
        message: 'Invalid credentials',
      });
    }

    // Step 2: Compare the hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials',
        message: 'Invalid credentials',
      });
    }

    // Step 3: Use jsonwebtoken to generate a token and send back in response
    const token = jwt.sign(
      { id: user._id, email: user.email },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        email: user.email,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error during user login',
      error: error.message,
    });
  }
};

// @desc    Get current logged in user profile (Optional helper endpoint)
// @route   GET /api/auth/me
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }
    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error fetching user profile',
      error: error.message,
    });
  }
};
