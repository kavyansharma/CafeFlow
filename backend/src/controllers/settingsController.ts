import { Request, Response } from 'express';
import { db } from '../database/db';
import { AuthRequest } from '../middleware/auth';

export const getSettings = (req: Request, res: Response) => {
  const authReq = req as AuthRequest;
  const cafeId = authReq.user?.cafe_id;
  if (!cafeId) {
    return res.status(401).json({ success: false, message: 'Authentication required' });
  }

  const settings = db.getCafeSettings(cafeId);
  return res.json({ success: true, data: settings });
};

export const updateSettings = (req: AuthRequest, res: Response) => {
  const cafeId = req.user?.cafe_id;
  if (!cafeId) {
    return res.status(401).json({ success: false, message: 'Authentication required' });
  }

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

  if (updates.loyalty_spend_per_point !== undefined) {
    const loySpend = Number(updates.loyalty_spend_per_point);
    if (isNaN(loySpend) || loySpend <= 0) {
      return res.status(400).json({ success: false, message: 'Loyalty spend per point must be greater than 0' });
    }
    updates.loyalty_spend_per_point = loySpend;
  }

  if (updates.loyalty_point_value !== undefined) {
    const loyVal = Number(updates.loyalty_point_value);
    if (isNaN(loyVal) || loyVal <= 0) {
      return res.status(400).json({ success: false, message: 'Loyalty point value must be greater than 0' });
    }
    updates.loyalty_point_value = loyVal;
  }

  const updatedSettings = db.updateCafeSettings(cafeId, updates);

  db.logAudit(cafeId, req.user?.name || 'Owner', 'OWNER', 'Settings Updated', `Updated Cafe & Billing configuration for ${updatedSettings.cafe_name}`);

  return res.json({ success: true, message: 'Settings updated successfully', data: updatedSettings });
};

