const User = require('../models/User');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const { validationResult } = require('express-validator');

// Email transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// Generate OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Signup
exports.signup = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, error: errors.array()[0].msg });
    }

    const { username, email, password } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ 
        success: false, 
        error: existingUser.email === email ? 'Email already registered' : 'Username already taken' 
      });
    }

    // Create user
    const user = new User({ username, email, password });
    await user.save();

    res.status(201).json({
      success: true,
      message: 'Account created successfully! Please login.'
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

// Login
exports.login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, error: errors.array()[0].msg });
    }

    const { username, password } = req.body;

    // Find user by username or email
    const user = await User.findOne({ 
      $or: [{ username }, { email: username }] 
    });

    if (!user || !(await user.comparePassword(password))) {
      return res.status(400).json({ success: false, error: 'Invalid credentials' });
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

// Forgot Password - Send OTP
exports.forgotPassword = async (req, res) => {
  try {
    console.log('Email config:', {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS ? 'Set' : 'Not set'
    });
    
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, error: 'Email not found' });
    }

    const otp = generateOTP();
    const otpToken = jwt.sign({ email, otp }, process.env.JWT_SECRET, { expiresIn: '2m' });

    // Send OTP email
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Password Reset OTP',
      html: `
        <h2>Password Reset Request</h2>
        <p>Your OTP for password reset is: <strong>${otp}</strong></p>
        <p>This OTP will expire in 2 minutes.</p>
        <p>If you didn't request this, please ignore this email.</p>
      `
    };

    await transporter.sendMail(mailOptions);

    res.json({
      success: true,
      message: 'OTP sent to your email',
      token: otpToken
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ success: false, error: 'Failed to send OTP' });
  }
};

// Verify OTP
exports.verifyOTP = async (req, res) => {
  try {
    const { email, otp, token } = req.body;

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      if (decoded.email !== email || decoded.otp !== otp) {
        return res.status(400).json({ success: false, error: 'Invalid OTP' });
      }

      res.json({ success: true, message: 'OTP verified successfully' });
    } catch (jwtError) {
      return res.status(400).json({ success: false, error: 'OTP expired' });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

// Reset Password
exports.resetPassword = async (req, res) => {
  try {
    const { email, otp, token, newPassword } = req.body;

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      if (decoded.email !== email || decoded.otp !== otp) {
        return res.status(400).json({ success: false, error: 'Invalid request' });
      }

      const user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({ success: false, error: 'User not found' });
      }

      user.password = newPassword;
      await user.save();

      res.json({ success: true, message: 'Password reset successfully' });
    } catch (jwtError) {
      return res.status(400).json({ success: false, error: 'Request expired' });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
};