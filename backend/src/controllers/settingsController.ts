import { Request, Response } from 'express';
import { db } from '../database/db';
import { AuthRequest } from '../middleware/auth';
import { CAFE_SUNRISE_ID } from '../database/seedData';

export const getSettings = (req: Request, res: Response) => {
  const authReq = req as AuthRequest;
  const cafeId = authReq.user?.cafe_id || CAFE_SUNRISE_ID;
  const settings = db.getCafeSettings(cafeId);
  return res.json({ success: true, data: settings });
};

export const updateSettings = (req: AuthRequest, res: Response) => {
  const cafeId = req.user?.cafe_id || CAFE_SUNRISE_ID;
  const updates = req.body;
  const updatedSettings = db.updateCafeSettings(cafeId, updates);

  db.logAudit(cafeId, req.user?.name || 'Owner', 'OWNER', 'Settings Updated', `Updated Cafe & Billing configuration for ${updatedSettings.cafe_name}`);

  return res.json({ success: true, message: 'Settings updated successfully', data: updatedSettings });
};
