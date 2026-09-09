import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { db } from '../database/db';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: 'OWNER' | 'MANAGER' | 'CASHIER';
  cafe_id: string;
}

export interface AuthRequest extends Request {
  user?: AuthUser;
}

export const getTenantId = (req: AuthRequest): string | null => {
  return req.user?.cafe_id || null;
};

export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, message: 'Authentication required. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, config.jwtSecret) as any;
    if (!decoded || !decoded.id || !decoded.cafe_id) {
      return res.status(401).json({ success: false, message: 'Invalid session token: Missing claims.' });
    }

    const dbUser = db.users.find(u => u.id === decoded.id);
    if (!dbUser || dbUser.is_active === false) {
      return res.status(401).json({ success: false, message: 'User account is deactivated or not found.' });
    }

    if (dbUser.cafe_id !== decoded.cafe_id) {
      return res.status(403).json({ success: false, message: 'Forbidden: Tenant context mismatch.' });
    }

    req.user = {
      id: dbUser.id,
      email: dbUser.email,
      name: dbUser.name,
      role: dbUser.role,
      cafe_id: dbUser.cafe_id,
    };
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid or expired session token.' });
  }
};

export const requireRoles = (roles: Array<'OWNER' | 'MANAGER' | 'CASHIER'>) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
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

