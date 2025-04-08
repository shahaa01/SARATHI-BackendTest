/**
 * Controller for handling email verification, OTP validation, and password reset
 */
import { Request, Response } from 'express';
import { storage } from '../storage';
import { generateToken, getExpiryDate, isTokenExpired } from '../utils/tokenUtil';
import { generateOTP, getOTPExpiryTime, isOTPExpired, hashValue } from '../utils/otpUtil';
import { sendOTPVerificationEmail, sendVerificationEmail, sendPasswordResetEmail } from '../services/emailService';
import { comparePasswords, hashPassword } from '../auth';
import { validateUserSchema } from '@shared/schema';
import { ZodError } from 'zod';
import { fromZodError } from 'zod-validation-error';

// Maximum number of OTP validation attempts allowed
const MAX_OTP_ATTEMPTS = 5;

/**
 * Generate and send an OTP for new user registration
 */
export const sendRegistrationOTP = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }
    
    // Check if email is already registered
    const existingUser = await storage.getUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }
    
    // Generate OTP and its expiry time
    const otp = generateOTP();
    const otpExpiry = getOTPExpiryTime();
    
    // Store OTP with user data in temporary storage
    let tempUser = await storage.getTempUserByEmail(email);
    
    if (tempUser) {
      // Update existing temp user with new OTP
      const updatedTempUser = await storage.updateTempUserOTP(tempUser.id, hashValue(otp), otpExpiry);
      if (updatedTempUser) {
        tempUser = updatedTempUser;
      }
    } else {
      // Create new temp user with OTP
      tempUser = await storage.createTempUser(
        req.body, // Store all registration data
        email,
        hashValue(otp), // Store hashed OTP for security
        otpExpiry
      );
    }
    
    // Send OTP to user's email
    const emailSent = await sendOTPVerificationEmail(email, otp);
    
    if (!emailSent) {
      return res.status(500).json({ message: 'Failed to send verification email' });
    }
    
    return res.status(200).json({ 
      message: 'Verification code sent to email',
      tempUserId: tempUser.id
    });
  } catch (error) {
    console.error('Error in sendRegistrationOTP:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * Verify OTP and complete user registration
 */
export const verifyOTP = async (req: Request, res: Response) => {
  try {
    const { tempUserId, otp } = req.body;
    
    if (!tempUserId || !otp) {
      return res.status(400).json({ message: 'TempUserId and OTP are required' });
    }
    
    // Find temp user record
    const tempUser = await storage.getTempUserByEmail(req.body.email);
    if (!tempUser || tempUser.id !== parseInt(tempUserId)) {
      return res.status(400).json({ message: 'Invalid verification request' });
    }
    
    // Check if OTP is expired
    if (isOTPExpired(tempUser.otpExpiry)) {
      return res.status(400).json({ message: 'Verification code has expired' });
    }
    
    // Check attempts limit
    if ((tempUser.attempts || 0) >= MAX_OTP_ATTEMPTS) {
      // Delete the temp user to force re-registration
      await storage.deleteTempUser(tempUser.id);
      return res.status(400).json({ 
        message: 'Too many failed attempts. Please re-register.' 
      });
    }
    
    // Verify OTP
    if (tempUser.otp !== hashValue(otp)) {
      // Increment attempts counter
      await storage.incrementTempUserAttempts(tempUser.id);
      return res.status(400).json({ message: 'Invalid verification code' });
    }
    
    // OTP is valid, create actual user
    try {
      // Parse userData to ensure it matches our user schema
      const userData = JSON.parse(JSON.stringify(tempUser.userData));
      const validatedUser = validateUserSchema.parse(userData);
      
      // Create user with validated data
      const newUser = await storage.createUser({
        ...validatedUser,
        isVerified: true // User is verified via OTP
      });
      
      // If user is service provider, create provider profile
      if (newUser.role === 'provider') {
        // Extract service category or use default
        const categoryId = userData.serviceCategory || 1;
        
        await storage.createServiceProviderProfile({
          userId: newUser.id,
          servicesOffered: [categoryId] // Add selected service category to offered services
        });
      }
      
      // Delete the temp user
      await storage.deleteTempUser(tempUser.id);
      
      // Start session
      if (req.login) {
        req.login(newUser, (err) => {
          if (err) {
            console.error('Session login error:', err);
            return res.status(500).json({ message: 'Failed to start session' });
          }
          
          // Return user data without sensitive fields
          const { password, ...safeUser } = newUser;
          return res.status(201).json({ 
            message: 'Registration successful', 
            user: safeUser 
          });
        });
      } else {
        const { password, ...safeUser } = newUser;
        return res.status(201).json({ 
          message: 'Registration successful', 
          user: safeUser 
        });
      }
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ 
          message: 'Validation error', 
          errors: validationError.details
        });
      }
      throw error;
    }
  } catch (error) {
    console.error('Error in verifyOTP:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * Resend OTP for verification
 */
export const resendOTP = async (req: Request, res: Response) => {
  try {
    const { email, tempUserId } = req.body;
    
    if (!email || !tempUserId) {
      return res.status(400).json({ message: 'Email and tempUserId are required' });
    }
    
    // Find temp user record
    const tempUser = await storage.getTempUserByEmail(email);
    if (!tempUser || tempUser.id !== parseInt(tempUserId)) {
      return res.status(400).json({ message: 'Invalid request' });
    }
    
    // Generate new OTP and expiry
    const otp = generateOTP();
    const otpExpiry = getOTPExpiryTime();
    
    // Update temp user with new OTP
    await storage.updateTempUserOTP(tempUser.id, hashValue(otp), otpExpiry);
    
    // Send OTP to user's email
    const emailSent = await sendOTPVerificationEmail(email, otp);
    
    if (!emailSent) {
      return res.status(500).json({ message: 'Failed to send verification email' });
    }
    
    return res.status(200).json({ message: 'Verification code resent to email' });
  } catch (error) {
    console.error('Error in resendOTP:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * Send a verification email to a newly registered user
 */
export const sendVerification = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }
    
    // Get user by email
    const user = await storage.getUserByEmail(email);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    if (user.isVerified) {
      return res.status(400).json({ message: 'User is already verified' });
    }
    
    // Generate verification token and set expiry
    const verificationToken = generateToken();
    const tokenExpiry = getExpiryDate(24); // 24 hours
    
    // Store token in user record
    await storage.updateUser(user.id, {
      verificationToken,
      verificationTokenExpiry: tokenExpiry
    });
    
    // Send verification email
    const emailSent = await sendVerificationEmail(email, verificationToken);
    
    if (!emailSent) {
      return res.status(500).json({ message: 'Failed to send verification email' });
    }
    
    return res.status(200).json({ message: 'Verification email sent' });
  } catch (error) {
    console.error('Error in sendVerification:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * Verify a user's email using the verification token
 */
export const verifyEmail = async (req: Request, res: Response) => {
  try {
    const { token } = req.query;
    
    if (!token || typeof token !== 'string') {
      return res.status(400).json({ message: 'Verification token is required' });
    }
    
    // Find user by verification token
    const user = await storage.getUserByVerificationToken(token);
    if (!user) {
      return res.status(400).json({ message: 'Invalid verification token' });
    }
    
    // Check if token is expired
    if (isTokenExpired(user.verificationTokenExpiry)) {
      return res.status(400).json({ message: 'Verification token has expired' });
    }
    
    // Mark user as verified and clear token
    await storage.verifyUser(user.id);
    
    // If request is from API
    if (req.headers['content-type'] === 'application/json') {
      return res.status(200).json({ message: 'Email verified successfully' });
    }
    
    // If request is from browser, redirect to login page
    return res.redirect('/auth');
  } catch (error) {
    console.error('Error in verifyEmail:', error);
    return res.status(500).json({ message: 'Internal server error' });
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
    
    // Find user by email
    const user = await storage.getUserByEmail(email);
    if (!user) {
      // Don't reveal that the user doesn't exist for security reasons
      return res.status(200).json({ message: 'If your email is registered, you will receive a password reset link' });
    }
    
    // Generate reset token and set expiry
    const resetToken = generateToken();
    const tokenExpiry = getExpiryDate(1); // 1 hour
    
    // Store token in user record
    await storage.updateUser(user.id, {
      resetPasswordToken: resetToken,
      resetPasswordTokenExpiry: tokenExpiry
    });
    
    // Send password reset email
    const emailSent = await sendPasswordResetEmail(email, resetToken);
    
    if (!emailSent) {
      return res.status(500).json({ message: 'Failed to send password reset email' });
    }
    
    return res.status(200).json({ message: 'Password reset email sent' });
  } catch (error) {
    console.error('Error in requestPasswordReset:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * Reset a user's password using the reset token
 */
export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { token, password, confirmPassword } = req.body;
    
    if (!token || !password || !confirmPassword) {
      return res.status(400).json({ message: 'Token, password and confirmPassword are required' });
    }
    
    if (password !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match' });
    }
    
    // Find user by reset token
    const user = await storage.getUserByResetPasswordToken(token);
    if (!user) {
      return res.status(400).json({ message: 'Invalid reset token' });
    }
    
    // Check if token is expired
    if (isTokenExpired(user.resetPasswordTokenExpiry)) {
      return res.status(400).json({ message: 'Reset token has expired' });
    }
    
    // Hash new password and update user
    const hashedPassword = await hashPassword(password);
    await storage.updateUser(user.id, {
      password: hashedPassword,
      resetPasswordToken: null,
      resetPasswordTokenExpiry: null
    });
    
    return res.status(200).json({ message: 'Password reset successful' });
  } catch (error) {
    console.error('Error in resetPassword:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};