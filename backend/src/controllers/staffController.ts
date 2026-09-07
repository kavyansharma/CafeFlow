import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../database/db';
import { hashPassword } from '../database/seedData';
import { AuthRequest } from '../middleware/auth';

export const getStaff = (req: Request, res: Response) => {
  const staffList = db.users.map(u => ({
    id: u.id,
    name: u.name,
    email: u.email,
    phone: u.phone,
    role: u.role,
    is_active: u.is_active,
    created_at: u.created_at,
  }));

  return res.json({ success: true, count: staffList.length, data: staffList });
};

export const createStaff = (req: AuthRequest, res: Response) => {
  const { name, email, phone, role = 'CASHIER', password = 'password123' } = req.body;

  if (!name || !email) {
    return res.status(400).json({ success: false, message: 'Name and email are required' });
  }

  const existing = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    return res.status(409).json({ success: false, message: 'A staff member with this email already exists' });
  }

  const newStaff = {
    id: `usr-${uuidv4().substring(0, 8)}`,
    name,
    email,
    phone: phone || '',
    password_hash: hashPassword(password),
    role: role as 'OWNER' | 'MANAGER' | 'CASHIER',
    is_active: true,
    created_at: new Date().toISOString(),
  };

  db.users.push(newStaff);
  db.logAudit(req.user?.name || 'Owner', 'OWNER', 'Staff Added', `Added ${newStaff.name} as ${newStaff.role}`);

  return res.status(201).json({
    success: true,
    message: 'Staff member created successfully',
    data: {
      id: newStaff.id,
      name: newStaff.name,
      email: newStaff.email,
      phone: newStaff.phone,
      role: newStaff.role,
      is_active: newStaff.is_active,
      created_at: newStaff.created_at,
    },
  });
};

export const updateStaff = (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { name, phone, role, is_active, password } = req.body;

  const user = db.users.find(u => u.id === id);
  if (!user) {
    return res.status(404).json({ success: false, message: 'Staff member not found' });
  }

  if (name) user.name = name;
  if (phone) user.phone = phone;
  if (role) user.role = role;
  if (is_active !== undefined) user.is_active = Boolean(is_active);
  if (password) user.password_hash = hashPassword(password);

  db.logAudit(req.user?.name || 'Owner', 'OWNER', 'Staff Updated', `Updated staff account for ${user.name}`);

  return res.json({
    success: true,
    message: 'Staff member updated successfully',
    data: {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      is_active: user.is_active,
    },
  });
};

export const getAuditLogs = (req: Request, res: Response) => {
  return res.json({ success: true, count: db.auditLogs.length, data: db.auditLogs });
};
