const express = require('express');
const router  = express.Router();
const {
  registerUser,
  loginUser,
  getMe
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const prisma      = require('../config/db');
const bcrypt      = require('bcryptjs');
const crypto      = require('crypto');
const nodemailer  = require('nodemailer');

// Public routes
router.post('/register', registerUser);
router.post('/login',    loginUser);

// Protected route
router.get('/me', protect, getMe);

// ── Forgot password ─────────────────────────────────────
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Please provide your email address' });
    }

    const user = await prisma.user.findUnique({ where: { email } });

    // Always return success even if user not found (security)
    if (!user) {
      return res.json({
        message: 'If an account exists with this email, a reset link has been sent'
      });
    }

    // Generate reset token
    const token   = crypto.randomBytes(32).toString('hex');
    const expiry  = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await prisma.user.update({
      where: { id: user.id },
      data:  { resetToken: token, resetTokenExpiry: expiry }
    });

    // Send reset email
    const resetUrl = `http://localhost:5173/reset-password?token=${token}`;

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    await transporter.sendMail({
      from:    `"CareerNexus" <${process.env.EMAIL_USER}>`,
      to:      email,
      subject: 'Reset Your CareerNexus Password',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #0F172A, #1E3A5F); padding: 30px; border-radius: 12px; text-align: center; margin-bottom: 24px;">
            <h1 style="color: #60A5FA; margin: 0; font-size: 28px;">CareerNexus</h1>
            <p style="color: #94A3B8; margin: 8px 0 0; font-size: 14px;">Smarter Hiring. Better Futures.</p>
          </div>
          <h2 style="color: #1E293B;">Password Reset Request</h2>
          <p style="color: #475569;">Hello <strong>${user.name}</strong>,</p>
          <p style="color: #475569;">We received a request to reset your password. Click the button below to create a new password.</p>
          <div style="text-align: center; margin: 32px 0;">
            <a href="${resetUrl}"
               style="background: linear-gradient(135deg, #3B82F6, #06B6D4); color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 16px; display: inline-block;">
              Reset My Password
            </a>
          </div>
          <p style="color: #94A3B8; font-size: 13px;">This link expires in <strong>1 hour</strong>.</p>
          <p style="color: #94A3B8; font-size: 13px;">If you did not request this, please ignore this email. Your password will not change.</p>
          <hr style="border: none; border-top: 1px solid #E2E8F0; margin: 24px 0;">
          <p style="color: #CBD5E1; font-size: 12px; text-align: center;">CareerNexus — SLIATE Labuduwa</p>
        </div>
      `
    });

    res.json({
      message: 'If an account exists with this email, a reset link has been sent'
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ── Reset password ──────────────────────────────────────
router.post('/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ message: 'Token and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    const user = await prisma.user.findFirst({
      where: {
        resetToken:       token,
        resetTokenExpiry: { gt: new Date() }
      }
    });

    if (!user) {
      return res.status(400).json({
        message: 'Reset link is invalid or has expired. Please request a new one.'
      });
    }

    const salt     = await bcrypt.genSalt(10);
    const hashed   = await bcrypt.hash(newPassword, salt);

    await prisma.user.update({
      where: { id: user.id },
      data:  {
        password:         hashed,
        resetToken:       null,
        resetTokenExpiry: null
      }
    });

    res.json({ message: 'Password reset successfully. You can now log in.' });

  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;