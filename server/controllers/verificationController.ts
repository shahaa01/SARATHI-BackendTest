import { Request, Response } from 'express';
import { storage } from '../storage';
import { sendVerificationEmail, sendPasswordResetEmail } from '../services/emailService';
import { generateToken, getExpiryDate, isTokenExpired } from '../utils/tokenUtil';

/**
 * Generate and send a verification email to a newly registered user
 */
export const sendVerification = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }
    
    const user = await storage.getUserByEmail(email);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    if (user.isVerified) {
      return res.status(400).json({ message: 'User is already verified' });
    }
    
    // Generate verification token
    const verificationToken = generateToken();
    const verificationTokenExpiry = getExpiryDate(24); // 24 hours expiry
    
    // Update user with verification token
    await storage.updateUser(user.id, {
      verificationToken,
      verificationTokenExpiry
    });
    
    // Send verification email
    const emailSent = await sendVerificationEmail(user.email, verificationToken);
    
    if (!emailSent) {
      return res.status(500).json({ message: 'Failed to send verification email' });
    }
    
    return res.status(200).json({ message: 'Verification email sent successfully' });
  } catch (error) {
    console.error('Send verification error:', error);
    return res.status(500).json({ message: 'Something went wrong' });
  }
};

/**
 * Verify a user's email using the verification token
 */
export const verifyEmail = async (req: Request, res: Response) => {
  try {
    const { token } = req.query;
    
    if (!token || typeof token !== 'string') {
      return res.status(400).json({ message: 'Invalid verification token' });
    }
    
    const user = await storage.getUserByVerificationToken(token);
    
    if (!user) {
      return res.status(404).json({ message: 'Invalid verification token' });
    }
    
    if (user.isVerified) {
      return res.status(400).json({ message: 'User is already verified' });
    }
    
    if (isTokenExpired(user.verificationTokenExpiry)) {
      return res.status(400).json({ message: 'Verification token has expired' });
    }
    
    // Mark user as verified
    await storage.verifyUser(user.id);
    
    // Redirect to login page with success message
    return res.redirect('/auth?verified=true');
  } catch (error) {
    console.error('Verify email error:', error);
    return res.status(500).json({ message: 'Something went wrong' });
  }
};

/**
 * Request a password reset email
 */
export const requestPasswordReset = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }
    
    const user = await storage.getUserByEmail(email);
    if (!user) {
      // For security reasons, always return success even if email doesn't exist
      return res.status(200).json({ message: 'If your account exists, a password reset email has been sent' });
    }
    
    // Generate reset token
    const resetToken = generateToken();
    const resetTokenExpiry = getExpiryDate(1); // 1 hour expiry
    
    // Update user with reset token
    await storage.updateUser(user.id, {
      resetPasswordToken: resetToken,
      resetPasswordTokenExpiry: resetTokenExpiry
    });
    
    // Send password reset email
    const emailSent = await sendPasswordResetEmail(user.email, resetToken);
    
    if (!emailSent) {
      return res.status(500).json({ message: 'Failed to send password reset email' });
    }
    
    return res.status(200).json({ message: 'If your account exists, a password reset email has been sent' });
  } catch (error) {
    console.error('Password reset request error:', error);
    return res.status(500).json({ message: 'Something went wrong' });
  }
};

/**
 * Reset a user's password using the reset token
 */
export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { token, password } = req.body;
    
    if (!token || !password) {
      return res.status(400).json({ message: 'Token and password are required' });
    }
    
    const user = await storage.getUserByResetPasswordToken(token);
    
    if (!user) {
      return res.status(404).json({ message: 'Invalid reset token' });
    }
    
    if (isTokenExpired(user.resetPasswordTokenExpiry)) {
      return res.status(400).json({ message: 'Reset token has expired' });
    }
    
    // Hash the new password (using the hashPassword utility from auth.ts)
    const { hashPassword } = await import('../auth');
    const hashedPassword = await hashPassword(password);
    
    // Update user with new password and clear reset token
    await storage.updateUser(user.id, {
      password: hashedPassword,
      resetPasswordToken: null,
      resetPasswordTokenExpiry: null
    });
    
    return res.status(200).json({ message: 'Password reset successful' });
  } catch (error) {
    console.error('Password reset error:', error);
    return res.status(500).json({ message: 'Something went wrong' });
  }
};