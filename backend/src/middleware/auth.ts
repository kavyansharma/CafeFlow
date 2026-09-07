import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { db } from '../database/db';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    name: string;
    role: 'OWNER' | 'MANAGER' | 'CASHIER';
    cafe_id: string;
  };
}

export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, message: 'Authentication required. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, config.jwtSecret) as any;
    if (!decoded.cafe_id) {
      return res.status(403).json({ success: false, message: 'Invalid session: Missing tenant cafe association.' });
    }
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ success: false, message: 'Invalid or expired session token.' });
  }
};

export const requireRoles = (roles: Array<'OWNER' | 'MANAGER' | 'CASHIER'>) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Requires one of [${roles.join(', ')}] permissions.`,
      });
    }
    next();
  };
};

export const requireActiveCafe = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user?.cafe_id) {
    return res.status(403).json({ success: false, message: 'Tenant cafe context missing.' });
  }

  const cafe = db.getCafe(req.user.cafe_id);
  if (!cafe) {
    return res.status(404).json({ success: false, message: 'Assigned cafe not found.' });
  }
  if (cafe.status === 'SUSPENDED') {
    return res.status(403).json({ success: false, message: 'This cafe account is currently suspended.' });
  }

  next();
};
