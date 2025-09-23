import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt';
import { UserRole } from '../types';

// Extend Express Request interface to include user data
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        schoolId: string;
        role: UserRole;
        email: string;
      };
    }
  }
}

export const authenticate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        error: 'UNAUTHORIZED',
        message: 'Access token is required'
      });
      return;
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    const payload = verifyAccessToken(token);

    // Attach user info to request object
    req.user = {
      userId: payload.userId,
      schoolId: payload.schoolId,
      role: payload.role,
      email: payload.email
    };

    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      error: 'UNAUTHORIZED',
      message: 'Invalid or expired token'
    });
  }
};

export const authorize = (...roles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'UNAUTHORIZED',
        message: 'Authentication required'
      });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        error: 'FORBIDDEN',
        message: 'Insufficient permissions'
      });
      return;
    }

    next();
  };
};

export const requireSchoolAccess = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.user) {
    res.status(401).json({
      success: false,
      error: 'UNAUTHORIZED',
      message: 'Authentication required'
    });
    return;
  }

  // Check if user is trying to access their own school's data
  const schoolId = req.params.schoolId || req.body.schoolId || req.query.schoolId;
  
  if (schoolId && schoolId !== req.user.schoolId) {
    res.status(403).json({
      success: false,
      error: 'FORBIDDEN',
      message: 'Access denied to this school data'
    });
    return;
  }

  next();
};
