import User from '../model/User.js';
import crypto from 'crypto';
import sendEmail from '../util/email.js';
import { v4 as uuidv4 } from 'uuid';

export const register = async (req, res) => {
  try {
    const { email, password } = req.body;
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }
    const user = new User({ email, password });
    await user.save();
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Error in user registration' });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    res.json({ message: 'Logged in successfully' });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Error in login process' });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    // Validate Gmail address
    const gmailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
    if (!gmailRegex.test(email)) {
      return res.status(400).json({ message: 'Please enter a valid Gmail address' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const resetToken = crypto.randomBytes(20).toString('hex');
    const resetTokenExpiry = Date.now() + 3600000; // 1 hour in milliseconds

    const resetIdentifier = uuidv4();
    const resetUrl = `http://localhost:3000/reset-password/${resetIdentifier}`;

    user.resetPasswordToken = resetToken;
    user.resetPasswordIdentifier = resetIdentifier;
    user.resetPasswordExpires = resetTokenExpiry;
    await user.save();

    console.log('Reset token:', resetToken);

    const message = `
      Dear user,

      We received a request to reset your password. To proceed with the password reset, please click on the secure link below:

      ${resetUrl}

      For your security, this link will expire in 1 hour.

      If you didn't initiate this request, please disregard this email. Your account remains secure, and no changes have been made.

      If you have any concerns or need assistance, please don't hesitate to contact our support team.

      Best regards,
      The Support Team
    `;

    await sendEmail(
      user.email,
      'Password Reset Request',
      message,
    );

    res.status(200).json({
      message: 'Password reset email sent'
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Error in forgot password process' });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { resetIdentifier } = req.params;
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ message: 'Password is required' });
    }

    const user = await User.findOne({
      resetPasswordIdentifier: resetIdentifier,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Password reset token is invalid or has expired' });
    }

    user.password = password;
    user.resetPasswordIdentifier = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    res.json({ message: 'Password has been reset successfully' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Error in reset password process' });
  }
};

export const validateResetToken = async (req, res) => {
  const { resetIdentifier } = req.params;
  try {
    const user = await User.findOne({
      resetPasswordIdentifier: resetIdentifier,
      resetPasswordExpires: { $gt: Date.now() }
    });
    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset identifier' });
    }
    res.status(200).json({ message: 'Token is valid' });
  } catch (error) {
    console.error('Validate reset token error:', error);
    res.status(500).json({ message: 'Error validating reset token' });
  }
};