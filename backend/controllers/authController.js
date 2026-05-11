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
        email: process.env.BREVO_SENDER_EMAIL,
      },
      to: [{ email: toEmail }],
      subject: 'Verify your Unicycle account',
      htmlContent: `
        <h2>Welcome to Unicycle!</h2>
        <p>Click the button below to verify your email address:</p>

        <a href="${verifyLink}" 
           style="
             display:inline-block;
             padding:12px 24px;
             background:#4F46E5;
             color:#ffffff;
             text-decoration:none;
             border-radius:8px;
             margin-top:15px;
           ">
          Verify Email
        </a>

        <p style="margin-top:20px;">
          If the button does not work, use this link:
        </p>

        <p>${verifyLink}</p>
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

    // ✅ Required fields
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields',
      });
    }

    // ✅ ONLY rajalakshmi.edu.in emails allowed
    const allowedDomain = 'rajalakshmi.edu.in';

    const emailDomain = email.toLowerCase().split('@')[1];

    if (emailDomain !== allowedDomain) {
      return res.status(400).json({
        success: false,
        message: 'Only rajalakshmi.edu.in email addresses are allowed',
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

    // ✅ Send email
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

    // ✅ Validate input
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
        message: 'Please verify your email before logging in.',
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

// ================= ADD THESE FUNCTIONS ABOVE module.exports =================

// ================= FORGOT PASSWORD =================
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({
      email: email.toLowerCase(),
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // ✅ Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');

    user.resetPasswordToken = resetToken;

    // ✅ Token expires in 15 mins
    user.resetPasswordExpire = Date.now() + 15 * 60 * 1000;

    await user.save();

    // ✅ Reset link
    const resetLink = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

    // ✅ Send email using Brevo
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
          email: process.env.BREVO_SENDER_EMAIL,
        },
        to: [{ email }],
        subject: 'Reset your password',
        htmlContent: `
          <h2>Password Reset</h2>

          <p>Click the button below to reset your password:</p>

          <a href="${resetLink}" 
             style="
               display:inline-block;
               padding:12px 24px;
               background:#DC2626;
               color:white;
               border-radius:8px;
               text-decoration:none;
               margin-top:10px;
             ">
             Reset Password
          </a>

          <p style="margin-top:20px;">
            This link expires in 15 minutes.
          </p>

          <p>
            If button does not work:
          </p>

          <p>${resetLink}</p>
        `,
      }),
    });

    if (!response.ok) {
      const err = await response.json();
      console.error('❌ Brevo Forgot Password Error:', JSON.stringify(err));

      throw new Error(err.message || 'Email send failed');
    }

    console.log('✅ Reset email sent to:', email);

    res.json({
      success: true,
      message: 'Password reset email sent successfully',
    });

  } catch (error) {
    console.error('❌ Forgot Password Error:', error.message);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ================= RESET PASSWORD =================
const resetPassword = async (req, res) => {
  try {
    const user = await User.findOne({
      resetPasswordToken: req.params.token,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token',
      });
    }

    // ✅ Hash new password
    const salt = await bcrypt.genSalt(10);

    user.password = await bcrypt.hash(req.body.password, salt);

    // ✅ Clear reset fields
    user.resetPasswordToken = undefined;

    user.resetPasswordExpire = undefined;

    await user.save();

    res.json({
      success: true,
      message: 'Password reset successful',
    });

  } catch (error) {
    console.error('❌ Reset Password Error:', error.message);

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
  forgotPassword,
  resetPassword,
};
