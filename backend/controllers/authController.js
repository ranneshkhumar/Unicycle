const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const User = require('../models/User');

// ================= JWT TOKEN =================
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '7d',
  });
};

// ================= BREVO HTTP API =================
const sendVerificationEmail = async (toEmail, verifyLink) => {
  const response = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'api-key': process.env.BREVO_API_KEY,
    },
    body: JSON.stringify({
      sender: {
        name: 'Unicycle',
        email: process.env.BREVO_SENDER_EMAIL, // unicycle.admin@gmail.com
      },
      to: [{ email: toEmail }],
      subject: 'Verify your Unicycle account',
      htmlContent: `
        <h2>Welcome to Unicycle!</h2>
        <p>Click the link below to verify your email address:</p>
        <a href="${verifyLink}" style="padding:10px 20px;background:#4F46E5;color:#fff;border-radius:6px;text-decoration:none;">
          Verify Email
        </a>
        <p>Or copy this link: ${verifyLink}</p>
        <p>This link does not expire.</p>
      `,
    }),
  });

  if (!response.ok) {
    const err = await response.json();
    console.error('❌ Brevo API Error:', JSON.stringify(err));
    throw new Error(`Brevo API error: ${err.message || JSON.stringify(err)}`);
  }

  console.log('✅ Verification email sent to:', toEmail);
};

// ================= REGISTER =================
const register = async (req, res) => {
  try {
    const { name, email, password, university } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields',
      });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists',
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const verificationToken = crypto.randomBytes(32).toString('hex');

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      university,
      verificationToken,
      isVerified: false,
    });

    const verifyLink = `${process.env.CLIENT_URL}/verify/${verificationToken}`;

    await sendVerificationEmail(email, verifyLink);

    res.status(201).json({
      success: true,
      message: 'Verification email sent. Please check your inbox.',
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
    const user = await User.findOne({ verificationToken: req.params.token });

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
      message: 'Email verified successfully. You can now log in.',
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

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password',
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    if (!user.isVerified) {
      return res.status(401).json({
        success: false,
        message: 'Please verify your email before logging in.',
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
        university: user.university,
        role: user.role,
        profileImage: user.profileImage,
      },
    });

  } catch (error) {
    console.error('❌ Login Error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ================= GET ME =================
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({ success: true, user });
  } catch (error) {
    console.error('❌ GetMe Error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { register, login, getMe, verifyEmail };
