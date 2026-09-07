import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../database/db';
import { AuthRequest } from '../middleware/auth';
import { Shift } from '../database/seedData';

export const getCurrentShift = (req: Request, res: Response) => {
  const currentShift = db.shifts.find(s => s.status === 'OPEN');

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
  const { opening_cash, notes } = req.body;

  const existingOpen = db.shifts.find(s => s.status === 'OPEN');
  if (existingOpen) {
    return res.status(400).json({
      success: false,
      message: 'A shift is already currently active. Please close the active shift first.',
      data: existingOpen,
    });
  }

  const openingFloat = Number(opening_cash || 0);
  const newShift: Shift = {
    id: `shift-${uuidv4().substring(0, 8)}`,
    user_id: req.user?.id || 'usr-cashier-003',
    user_name: req.user?.name || 'Rahul Sen',
    start_time: new Date().toISOString(),
    opening_cash: openingFloat,
    cash_sales: 0,
    upi_sales: 0,
    card_sales: 0,
    total_sales: 0,
    total_orders: 0,
    expected_cash: openingFloat,
    status: 'OPEN',
    notes: notes || 'Register opened',
  };

  db.shifts.unshift(newShift);
  db.logAudit(newShift.user_name, req.user?.role || 'CASHIER', 'Shift Opened', `Opened shift with ₹${openingFloat} cash float`);

  db.addNotification('SHIFT', 'POS Shift Started', `Shift started by ${newShift.user_name} with ₹${openingFloat} opening float.`, 'INFO', '/shifts');

  return res.status(201).json({
    success: true,
    message: 'Shift opened successfully',
    data: newShift,
  });
};

export const closeShift = (req: AuthRequest, res: Response) => {
  const { actual_cash, notes } = req.body;

  const activeShift = db.shifts.find(s => s.status === 'OPEN');
  if (!activeShift) {
    return res.status(400).json({ success: false, message: 'No active shift found to close' });
  }

  const actual = Number(actual_cash !== undefined ? actual_cash : activeShift.expected_cash);
  const diff = Number((actual - activeShift.expected_cash).toFixed(2));

  activeShift.end_time = new Date().toISOString();
  activeShift.actual_cash = actual;
  activeShift.cash_difference = diff;
  activeShift.status = 'CLOSED';
  if (notes) activeShift.notes = `${activeShift.notes || ''} | Closing notes: ${notes}`;

  const discrepancyText = diff === 0 ? 'Balanced' : diff > 0 ? `+₹${diff} (Over)` : `-₹${Math.abs(diff)} (Short)`;
  db.logAudit(
    req.user?.name || activeShift.user_name,
    req.user?.role || 'CASHIER',
    'Shift Closed',
    `Shift closed. Expected: ₹${activeShift.expected_cash}, Counted: ₹${actual}, Variance: ${discrepancyText}`
  );

  db.addNotification(
    'SHIFT',
    'Shift Closed & Reconciled',
    `Shift closed by ${activeShift.user_name}. Total sales: ₹${activeShift.total_sales}. Cash variance: ${discrepancyText}.`,
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
  return res.json({
    success: true,
    count: db.shifts.length,
    data: db.shifts,
  });
};
