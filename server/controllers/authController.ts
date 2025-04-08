import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { storage } from '../storage';
import { z } from 'zod';
import { insertUserSchema } from '@shared/schema';

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'sarathi_secret_key';

// Cookie options
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  sameSite: 'strict' as const
};

// Login schema
const loginSchema = z.object({
  username: z.string().min(3),
  password: z.string().min(6)
});

// Register user
export const register = async (req: Request, res: Response) => {
  try {
    // Validate request body
    const validationResult = insertUserSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: validationResult.error.errors
      });
    }
    
    const userData = validationResult.data;
    
    // Check if username or email already exists
    const existingUserByUsername = await storage.getUserByUsername(userData.username);
    if (existingUserByUsername) {
      return res.status(400).json({ message: 'Username already exists' });
    }
    
    const existingUserByEmail = await storage.getUserByEmail(userData.email);
    if (existingUserByEmail) {
      return res.status(400).json({ message: 'Email already exists' });
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(userData.password, salt);
    
    // Create user
    const user = await storage.createUser({
      ...userData,
      password: hashedPassword
    });
    
    // Create service provider profile if role is provider
    if (user.role === 'provider') {
      await storage.createServiceProviderProfile({
        userId: user.id,
        bio: '',
        experience: 0,
        hourlyRate: 0,
        servicesOffered: [],
        availability: {
          Monday: { start: '09:00', end: '17:00', isAvailable: true },
          Tuesday: { start: '09:00', end: '17:00', isAvailable: true },
          Wednesday: { start: '09:00', end: '17:00', isAvailable: true },
          Thursday: { start: '09:00', end: '17:00', isAvailable: true },
          Friday: { start: '09:00', end: '17:00', isAvailable: true },
          Saturday: { start: '10:00', end: '15:00', isAvailable: false },
          Sunday: { start: '10:00', end: '15:00', isAvailable: false }
        }
      });
    }
    
    // Generate JWT token
    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '7d' });
    
    // Set token cookie
    res.cookie('token', token, COOKIE_OPTIONS);
    
    // Return user info
    return res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
        profileImageUrl: user.profileImageUrl
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// Login user
export const login = async (req: Request, res: Response) => {
  try {
    // Validate request body
    const validationResult = loginSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: validationResult.error.errors
      });
    }
    
    const { username, password } = validationResult.data;
    
    // Find user
    const user = await storage.getUserByUsername(username);
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Generate JWT token
    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '7d' });
    
    // Set token cookie
    res.cookie('token', token, COOKIE_OPTIONS);
    
    // Return user info
    return res.status(200).json({
      message: 'Login successful',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
        profileImageUrl: user.profileImageUrl
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// Logout user
export const logout = (req: Request, res: Response) => {
  try {
    // Clear token cookie
    res.clearCookie('token');
    
    return res.status(200).json({ message: 'Logout successful' });
  } catch (error) {
    console.error('Logout error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// Get current user
export const getCurrentUser = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    
    // Return user info
    return res.status(200).json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
        profileImageUrl: user.profileImageUrl
      }
    });
  } catch (error) {
    console.error('Get current user error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};
