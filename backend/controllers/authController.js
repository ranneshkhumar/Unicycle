const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

const User = require('../models/User');

// ================= JWT TOKEN =================
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '7d',
  });
};

// ================= BREVO TRANSPORTER =================
const transporter = nodemailer.createTransport({
  host: 'smtp-relay.brevo.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.BREVO_USER,
    pass: process.env.BREVO_PASS,
  },
});

// ================= REGISTER =================
const register = async (req, res) => {
  try {
    const { name, email, password, university } = req.body;

    // ✅ Validate fields
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields',
      });
    }

    // ✅ Check existing user
    const existingUser = await User.findOne({
      email: email.toLowerCase(),
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists',
      });
    }

    // ✅ Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // ✅ Generate verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');

    // ✅ Create user
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      university,
      verificationToken,
      isVerified: false,
    });

    // ✅ Verification link
    const verifyLink = `${process.env.CLIENT_URL}/verify/${verificationToken}`;

    console.log('🚀 Sending email to:', email);

    // ✅ Send verification email
    await transporter.sendMail({
      from: `"Unicycle" <${process.env.BREVO_USER}>`,
      to: email,
      subject: 'Verify your email',
      html: `
        <h2>Email Verification</h2>
        <p>Click below to verify your account:</p>
        <a href="${verifyLink}">${verifyLink}</a>
      `,
    });

    console.log('✅ Email sent to:', email);

    res.status(201).json({
      success: true,
      message: 'Verification email sent successfully',
    });

  } catch (error) {
    console.error('❌ Register Error:', error.message);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ================= VERIFY EMAIL =================
const verifyEmail = async (req, res) => {
  try {
    const user = await User.findOne({
      verificationToken: req.params.token,
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired token',
      });
    }

    user.isVerified = true;
    user.verificationToken = null;

    await user.save();

    res.json({
      success: true,
      message: 'Email verified successfully',
    });

  } catch (error) {
    console.error('❌ Verify Error:', error.message);

    res.status(500).json({
      success: false,
      message: 'Server Error',
    });
  }
};

// ================= LOGIN =================
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // ✅ Check fields
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password',
      });
    }

    // ✅ Find user
    const user = await User.findOne({
      email: email.toLowerCase(),
    }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    // ✅ Compare password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    // ✅ Check verification
    if (!user.isVerified) {
      return res.status(401).json({
        success: false,
        message: 'Please verify your email first',
      });
    }

    // ✅ Generate token
    const token = generateToken(user._id);

    res.json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        university: user.university,
        role: user.role,
        profileImage: user.profileImage,
      },
    });

  } catch (error) {
    console.error('❌ Login Error:', error.message);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ================= GET ME =================
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    res.json({
      success: true,
      user,
    });

  } catch (error) {
    console.error('❌ GetMe Error:', error.message);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  register,
  login,
  getMe,
  verifyEmail,
};
