const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// ✅ EMAIL CONFIG (USE ENV VARIABLES — VERY IMPORTANT)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// ================= REGISTER =================
const register = async (req, res) => {
  try {
    const { name, password, university } = req.body;
    const email = req.body.email.toLowerCase(); // ✅ FIX CASE ISSUE

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide name, email and password' });
    }

    // ✅ College email validation
    const allowedDomain = 'rajalakshmi.edu.in';
    const emailDomain = email.split('@')[1];

    if (emailDomain !== allowedDomain) {
      return res.status(400).json({
        success: false,
        message: '❌ Only @rajalakshmi.edu.in emails allowed',
      });
    }

    // ✅ CASE-INSENSITIVE CHECK
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // ✅ GENERATE VERIFICATION TOKEN
    const verificationToken = crypto.randomBytes(32).toString('hex');

    // ✅ CREATE USER (NOT VERIFIED)
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      university: university || 'Rajalakshmi Engineering College',
      isVerified: false,
      verificationToken
    });

    // ✅ SEND EMAIL (USES DEPLOYED FRONTEND URL)
    const verifyLink = `${process.env.CLIENT_URL}/verify/${verificationToken}`;

    await transporter.sendMail({
      from: `"Unicycle" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Verify your email',
      html: `
        <h3>Email Verification</h3>
        <p>Click below to verify your account:</p>
        <a href="${verifyLink}">${verifyLink}</a>
      `
    });

    res.status(201).json({
      success: true,
      message: 'Verification email sent. Please check your inbox.'
    });

  } catch (error) {
    console.error('Register error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ================= VERIFY EMAIL =================
const verifyEmail = async (req, res) => {
  try {
    const user = await User.findOne({ verificationToken: req.params.token });

    if (!user) {
      return res.send('Invalid or expired token');
    }

    user.isVerified = true;
    user.verificationToken = null;
    await user.save();

    // ✅ BETTER UX (redirect instead of plain text)
    res.redirect(`${process.env.CLIENT_URL}/login`);

  } catch (error) {
    res.status(500).send('Server error');
  }
};

// ================= LOGIN =================
const login = async (req, res) => {
  try {
    const { password } = req.body;
    const email = req.body.email.toLowerCase(); // ✅ FIX CASE ISSUE

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    // ✅ BLOCK IF NOT VERIFIED
    if (!user.isVerified) {
      return res.status(401).json({
        success: false,
        message: 'Please verify your email before logging in'
      });
    }

    if (!user.isActive) {
      return res.status(401).json({ success: false, message: 'Your account has been deactivated' });
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        university: user.university,
        profileImage: user.profileImage,
      },
    });

  } catch (error) {
    console.error('Login error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ================= GET ME =================
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { register, login, getMe, verifyEmail };