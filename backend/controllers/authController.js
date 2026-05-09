const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const crypto = require('crypto');
const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// ================= REGISTER =================
const register = async (req, res) => {
  try {
    const { name, password, university } = req.body;
    const email = req.body.email.toLowerCase();

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email and password'
      });
    }

  //   const allowedDomain = 'rajalakshmi.edu.in';
  //   const emailDomain = email.split('@')[1];

  //  // if (emailDomain !== allowedDomain) 
  //  {
  //     return res.status(400).json({
  //       success: false,
  //       message: '❌ Only @rajalakshmi.edu.in emails allowed',
  //     });
  //   }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered'
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const verificationToken = crypto.randomBytes(32).toString('hex');

    await User.create({
      name,
      email,
      password: hashedPassword,
      university: university || 'Rajalakshmi Engineering College',
      isVerified: false,
      verificationToken
    });

    const verifyLink = `${process.env.CLIENT_URL}/verify/${verificationToken}`;

    // ✅ Send response immediately
    res.status(201).json({
      success: true,
      message: 'Verification email sent. Please check your inbox.'
    });

    // ✅ DEBUG LOG
    console.log("🚀 Sending email to:", email);

    // ✅ SEND EMAIL (FIXED VERSION)
    resend.emails.send({
      from: 'Unicycle <unicycle.admin@gmail.com>',
      to: email,
      subject: 'Verify your email',
      html: `
        <h3>Email Verification</h3>
        <p>Click below to verify your account:</p>
        <a href="${verifyLink}">${verifyLink}</a>
      `
    })
    .then(() => {
      console.log("✅ Email sent to:", email);
    })
    .catch((err) => {
      console.error("❌ Email failed:", err.message);
      console.log("🔗 Manual link:", verifyLink);
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
      return res.json({
        success: false,
        message: 'Invalid or expired token'
      });
    }

    user.isVerified = true;
    user.verificationToken = null;
    await user.save();

    res.json({
      success: true,
      message: 'Email verified successfully'
    });

  } catch (error) {
    console.error('Verify error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// ================= LOGIN =================
const login = async (req, res) => {
  try {
    const { password } = req.body;
    const email = req.body.email.toLowerCase();

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    if (!user.isVerified) {
      return res.status(401).json({
        success: false,
        message: 'Please verify your email before logging in'
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Your account has been deactivated'
      });
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
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ================= GET ME =================
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    res.json({
      success: true,
      user
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  register,
  login,
  getMe,
  verifyEmail
};
