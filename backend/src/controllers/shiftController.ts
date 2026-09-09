import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../database/db';
import { AuthRequest } from '../middleware/auth';
import { Shift } from '../database/seedData';

export const getCurrentShift = (req: Request, res: Response) => {
  const authReq = req as AuthRequest;
  const cafeId = authReq.user?.cafe_id;
  if (!cafeId) {
    return res.status(401).json({ success: false, message: 'Authentication required' });
  }

  const currentShift = db.shifts.find(s => s.cafe_id === cafeId && s.status === 'OPEN');

  if (!currentShift) {
    return res.json({
      success: true,
      has_active_shift: false,
      data: null,
    });
  }

  return res.json({
    success: true,
    has_active_shift: true,
    data: currentShift,
  });
};

export const openShift = (req: AuthRequest, res: Response) => {
  const cafeId = req.user?.cafe_id;
  if (!cafeId || !req.user) {
    return res.status(401).json({ success: false, message: 'Authentication required' });
  }

  const { opening_cash, notes } = req.body;

  const existingOpen = db.shifts.find(s => s.cafe_id === cafeId && s.status === 'OPEN');
  if (existingOpen) {
    return res.status(400).json({
      success: false,
      message: 'A shift is already currently active for this cafe. Please close the active shift first.',
      data: existingOpen,
    });
  }

  const openingFloat = Number(opening_cash !== undefined ? opening_cash : 0);
  if (isNaN(openingFloat) || openingFloat < 0) {
    return res.status(400).json({ success: false, message: 'Opening cash must be a non-negative number' });
  }

  const newShift: Shift = {
    id: `shift-${uuidv4().substring(0, 8)}`,
    cafe_id: cafeId,
    user_id: req.user.id,
    user_name: req.user.name,
    start_time: new Date().toISOString(),
    opening_cash: openingFloat,
    cash_sales: 0,
    upi_sales: 0,
    card_sales: 0,
    total_sales: 0,
    total_orders: 0,
    expected_cash: openingFloat,
    status: 'OPEN',
    notes: notes ? String(notes).trim() : 'Register opened',
  };

  db.shifts.unshift(newShift);
  db.logAudit(cafeId, newShift.user_name, req.user.role, 'Shift Opened', `Opened shift with ₹${openingFloat} cash float`);

  db.addNotification(cafeId, 'SHIFT', 'POS Shift Started', `Shift started by ${newShift.user_name} with ₹${openingFloat} opening float.`, 'INFO', '/shifts');

  return res.status(201).json({
    success: true,
    message: 'Shift opened successfully',
    data: newShift,
  });
};

export const closeShift = (req: AuthRequest, res: Response) => {
  const cafeId = req.user?.cafe_id;
  if (!cafeId || !req.user) {
    return res.status(401).json({ success: false, message: 'Authentication required' });
  }

  const { actual_cash, notes } = req.body;

  const activeShift = db.shifts.find(s => s.cafe_id === cafeId && s.status === 'OPEN');
  if (!activeShift) {
    return res.status(400).json({ success: false, message: 'No active shift found to close in this cafe' });
  }

  // If role is CASHIER, they can only close their own shift
  if (req.user.role === 'CASHIER' && activeShift.user_id !== req.user.id) {
    return res.status(403).json({
      success: false,
      message: 'Access denied: You cannot close another staff member’s shift. Only the shift owner or a manager/owner can close this shift.',
    });
  }

  if (actual_cash !== undefined) {
    const numActual = Number(actual_cash);
    if (isNaN(numActual) || numActual < 0) {
      return res.status(400).json({ success: false, message: 'Counted actual cash must be a non-negative number' });
    }
  }

  const actual = Number(actual_cash !== undefined ? actual_cash : activeShift.expected_cash);
  const diff = Number((actual - activeShift.expected_cash).toFixed(2));

  activeShift.end_time = new Date().toISOString();
  activeShift.actual_cash = actual;
  activeShift.cash_difference = diff;
  activeShift.status = 'CLOSED';
  if (notes) activeShift.notes = `${activeShift.notes || ''} | Closing notes: ${String(notes).trim()}`;

  const discrepancyText = diff === 0 ? 'Balanced' : diff > 0 ? `+₹${diff} (Over)` : `-₹${Math.abs(diff)} (Short)`;
  db.logAudit(
    cafeId,
    req.user.name,
    req.user.role,
    'Shift Closed',
    `Shift closed. Expected: ₹${activeShift.expected_cash}, Counted: ₹${actual}, Variance: ${discrepancyText}`
  );

  db.addNotification(
    cafeId,
    'SHIFT',
    'Shift Closed & Reconciled',
    `Shift closed by ${req.user.name}. Total sales: ₹${activeShift.total_sales}. Cash variance: ${discrepancyText}.`,
    diff !== 0 ? 'WARNING' : 'SUCCESS',
    '/shifts'
  );

  return res.json({
    success: true,
    message: 'Shift closed and reconciled successfully',
    data: activeShift,
  });
};

export const getShiftHistory = (req: Request, res: Response) => {
  const authReq = req as AuthRequest;
  const cafeId = authReq.user?.cafe_id;
  if (!cafeId) {
    return res.status(401).json({ success: false, message: 'Authentication required' });
  }

  const cafeShifts = db.shifts.filter(s => s.cafe_id === cafeId);
  return res.json({
    success: true,
    count: cafeShifts.length,
    data: cafeShifts,
  });
};

