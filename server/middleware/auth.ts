import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';
import { storage } from '../storage';

// Extended Request interface to include user property
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

// Secret key for JWT
const JWT_SECRET = process.env.JWT_SECRET || 'sarathi_secret_key';

// Middleware to authenticate JWT token
export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Get token from cookies or Authorization header
    const token = req.cookies?.token || 
                 (req.headers.authorization?.startsWith('Bearer ') && 
                  req.headers.authorization.split(' ')[1]);

    if (!token) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET) as { id: number };
    
    // Get user from storage
    const user = await storage.getUser(decoded.id);
    
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    // Attach user to request
    req.user = user;
    
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(401).json({ message: 'Invalid token' });
  }
};

// Middleware to check if user has the required role
export const roleMiddleware = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    next();
  };
};
