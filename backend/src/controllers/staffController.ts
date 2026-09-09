import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../database/db';
import { hashPassword } from '../database/seedData';
import { AuthRequest } from '../middleware/auth';

export const getStaff = (req: Request, res: Response) => {
  const authReq = req as AuthRequest;
  const cafeId = authReq.user?.cafe_id;
  if (!cafeId) {
    return res.status(401).json({ success: false, message: 'Authentication required' });
  }

  const staffList = db.users
    .filter(u => u.cafe_id === cafeId)
    .map(u => ({
      id: u.id,
      cafe_id: u.cafe_id,
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
  const cafeId = req.user?.cafe_id;
  if (!cafeId) {
    return res.status(401).json({ success: false, message: 'Authentication required' });
  }

  const { name, email, phone, role = 'CASHIER', password = 'password123' } = req.body;

  if (!name || typeof name !== 'string' || !name.trim()) {
    return res.status(400).json({ success: false, message: 'Valid staff name is required' });
  }

  if (!email || typeof email !== 'string' || !email.includes('@')) {
    return res.status(400).json({ success: false, message: 'Valid email address is required' });
  }

  const validRoles = ['OWNER', 'MANAGER', 'CASHIER'];
  if (!validRoles.includes(role)) {
    return res.status(400).json({ success: false, message: `Invalid role. Allowed roles: ${validRoles.join(', ')}` });
  }

  const existing = db.users.find(u => u.cafe_id === cafeId && u.email.toLowerCase() === email.trim().toLowerCase());
  if (existing) {
    return res.status(409).json({ success: false, message: 'A staff member with this email already exists in this cafe' });
  }

  const newStaff = {
    id: `usr-${uuidv4().substring(0, 8)}`,
    cafe_id: cafeId,
    name: name.trim(),
    email: email.trim().toLowerCase(),
    phone: phone ? String(phone).trim() : '',
    password_hash: hashPassword(password),
    role: role as 'OWNER' | 'MANAGER' | 'CASHIER',
    is_active: true,
    created_at: new Date().toISOString(),
  };

  db.users.push(newStaff);
  db.logAudit(cafeId, req.user?.name || 'Owner', 'OWNER', 'Staff Added', `Added ${newStaff.name} as ${newStaff.role}`);

  return res.status(201).json({
    success: true,
    message: 'Staff member created successfully',
    data: {
      id: newStaff.id,
      cafe_id: newStaff.cafe_id,
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
  const cafeId = req.user?.cafe_id;
  if (!cafeId) {
    return res.status(401).json({ success: false, message: 'Authentication required' });
  }

  const { id } = req.params;
  const { name, phone, role, is_active, password, email } = req.body;

  const user = db.users.find(u => u.cafe_id === cafeId && u.id === id);
  if (!user) {
    return res.status(404).json({ success: false, message: 'Staff member not found in this cafe' });
  }

  // Prevent deactivating or demoting the last active owner
  if (user.role === 'OWNER' && (role && role !== 'OWNER' || is_active === false)) {
    const activeOwners = db.users.filter(u => u.cafe_id === cafeId && u.role === 'OWNER' && u.is_active && u.id !== id);
    if (activeOwners.length === 0) {
      return res.status(400).json({ success: false, message: 'Cannot deactivate or demote the only active Owner of this cafe.' });
    }
  }

  if (email && email.trim().toLowerCase() !== user.email.toLowerCase()) {
    const emailConflict = db.users.find(u => u.cafe_id === cafeId && u.id !== id && u.email.toLowerCase() === email.trim().toLowerCase());
    if (emailConflict) {
      return res.status(409).json({ success: false, message: 'Another user in this cafe already has this email address' });
    }
    user.email = email.trim().toLowerCase();
  }

  if (role) {
    const validRoles = ['OWNER', 'MANAGER', 'CASHIER'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ success: false, message: `Invalid role. Allowed roles: ${validRoles.join(', ')}` });
    }
    user.role = role;
  }

  if (name && typeof name === 'string' && name.trim()) user.name = name.trim();
  if (phone !== undefined) user.phone = String(phone).trim();
  if (is_active !== undefined) user.is_active = Boolean(is_active);
  if (password && typeof password === 'string' && password.length >= 6) {
    user.password_hash = hashPassword(password);
  }

  db.logAudit(cafeId, req.user?.name || 'Owner', 'OWNER', 'Staff Updated', `Updated staff account for ${user.name}`);

  return res.json({
    success: true,
    message: 'Staff member updated successfully',
    data: {
      id: user.id,
      cafe_id: user.cafe_id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      is_active: user.is_active,
    },
  });
};

export const getAuditLogs = (req: Request, res: Response) => {
  const authReq = req as AuthRequest;
  const cafeId = authReq.user?.cafe_id;
  if (!cafeId) {
    return res.status(401).json({ success: false, message: 'Authentication required' });
  }

  const logs = db.auditLogs.filter(a => a.cafe_id === cafeId);
  return res.json({ success: true, count: logs.length, data: logs });
};

