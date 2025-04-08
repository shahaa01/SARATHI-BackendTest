import { Request, Response, NextFunction } from 'express';
import { storage } from '../storage';

// Middleware to check if user is authenticated (using Passport sessions)
export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // Check if user is authenticated using Passport
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  // User is authenticated
  next();
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
