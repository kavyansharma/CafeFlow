import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { db } from '../database/db';
import { config } from '../config';
import { AuthRequest } from '../middleware/auth';

export const login = (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email and password are required' });
  }

  const user = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (!user || !user.is_active) {
    return res.status(401).json({ success: false, message: 'Invalid credentials or inactive account' });
  }

  const isMatch = bcrypt.compareSync(password, user.password_hash);
  if (!isMatch) {
    return res.status(401).json({ success: false, message: 'Invalid credentials' });
  }

  const token = jwt.sign(
    { id: user.id, email: user.email, name: user.name, role: user.role },
    config.jwtSecret,
    { expiresIn: '7d' }
  );

  db.logAudit(user.name, user.role, 'User Login', `Logged in from IP: ${req.ip || '127.0.0.1'}`);

  return res.json({
    success: true,
    message: 'Login successful',
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
    },
  });
};

export const getCurrentUser = (req: AuthRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Not authenticated' });
  }

  const user = db.users.find(u => u.id === req.user?.id);
  if (!user || !user.is_active) {
    return res.status(404).json({ success: false, message: 'User not found or inactive' });
  }

  return res.json({
    success: true,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
    },
  });
};

export const switchDemoUser = (req: Request, res: Response) => {
  const { role } = req.body; // 'OWNER' | 'MANAGER' | 'CASHIER'
  const user = db.users.find(u => u.role === role && u.is_active);

  if (!user) {
    return res.status(404).json({ success: false, message: `No active user found for role ${role}` });
  }

  const token = jwt.sign(
    { id: user.id, email: user.email, name: user.name, role: user.role },
    config.jwtSecret,
    { expiresIn: '7d' }
  );

  return res.json({
    success: true,
    message: `Switched session to ${user.role} (${user.name})`,
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
    },
  });
};
