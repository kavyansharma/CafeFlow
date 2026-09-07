import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../database/db';
import { AuthRequest } from '../middleware/auth';
import { Shift, CAFE_SUNRISE_ID } from '../database/seedData';

export const getCurrentShift = (req: Request, res: Response) => {
  const authReq = req as AuthRequest;
  const cafeId = authReq.user?.cafe_id || CAFE_SUNRISE_ID;
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
  const cafeId = req.user?.cafe_id || CAFE_SUNRISE_ID;
  const { opening_cash, notes } = req.body;

  const existingOpen = db.shifts.find(s => s.cafe_id === cafeId && s.status === 'OPEN');
  if (existingOpen) {
    return res.status(400).json({
      success: false,
      message: 'A shift is already currently active for this cafe. Please close the active shift first.',
      data: existingOpen,
    });
  }

  const openingFloat = Number(opening_cash || 0);
  const newShift: Shift = {
    id: `shift-${uuidv4().substring(0, 8)}`,
    cafe_id: cafeId,
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
  db.logAudit(cafeId, newShift.user_name, req.user?.role || 'CASHIER', 'Shift Opened', `Opened shift with ₹${openingFloat} cash float`);

  db.addNotification(cafeId, 'SHIFT', 'POS Shift Started', `Shift started by ${newShift.user_name} with ₹${openingFloat} opening float.`, 'INFO', '/shifts');

  return res.status(201).json({
    success: true,
    message: 'Shift opened successfully',
    data: newShift,
  });
};

export const closeShift = (req: AuthRequest, res: Response) => {
  const cafeId = req.user?.cafe_id || CAFE_SUNRISE_ID;
  const { actual_cash, notes } = req.body;

  const activeShift = db.shifts.find(s => s.cafe_id === cafeId && s.status === 'OPEN');
  if (!activeShift) {
    return res.status(400).json({ success: false, message: 'No active shift found to close in this cafe' });
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
    cafeId,
    req.user?.name || activeShift.user_name,
    req.user?.role || 'CASHIER',
    'Shift Closed',
    `Shift closed. Expected: ₹${activeShift.expected_cash}, Counted: ₹${actual}, Variance: ${discrepancyText}`
  );

  db.addNotification(
    cafeId,
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
  const authReq = req as AuthRequest;
  const cafeId = authReq.user?.cafe_id || CAFE_SUNRISE_ID;
  const cafeShifts = db.shifts.filter(s => s.cafe_id === cafeId);
  return res.json({
    success: true,
    count: cafeShifts.length,
    data: cafeShifts,
  });
};
