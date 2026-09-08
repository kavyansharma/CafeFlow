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

  if (updates.default_gst_rate !== undefined) {
    const gst = Number(updates.default_gst_rate);
    if (isNaN(gst) || gst < 0 || gst > 28) {
      return res.status(400).json({ success: false, message: 'Default GST rate must be between 0% and 28%' });
    }
    updates.default_gst_rate = gst;
  }

  if (updates.max_discount_percent !== undefined) {
    const disc = Number(updates.max_discount_percent);
    if (isNaN(disc) || disc < 0 || disc > 100) {
      return res.status(400).json({ success: false, message: 'Max discount percentage must be between 0% and 100%' });
    }
    updates.max_discount_percent = disc;
  }

  if (updates.loyalty_percentage !== undefined) {
    const loy = Number(updates.loyalty_percentage);
    if (isNaN(loy) || loy < 0 || loy > 50) {
      return res.status(400).json({ success: false, message: 'Loyalty percentage must be between 0% and 50%' });
    }
    updates.loyalty_percentage = loy;
  }

  const updatedSettings = db.updateCafeSettings(cafeId, updates);

  db.logAudit(cafeId, req.user?.name || 'Owner', 'OWNER', 'Settings Updated', `Updated Cafe & Billing configuration for ${updatedSettings.cafe_name}`);

  return res.json({ success: true, message: 'Settings updated successfully', data: updatedSettings });
};
