import { Request, Response } from 'express';
import { db } from '../database/db';
import { AuthRequest } from '../middleware/auth';

export const getSettings = (req: Request, res: Response) => {
  return res.json({ success: true, data: db.settings });
};

export const updateSettings = (req: AuthRequest, res: Response) => {
  const updates = req.body;
  db.settings = {
    ...db.settings,
    ...updates,
    default_gst_rate: updates.default_gst_rate !== undefined ? Number(updates.default_gst_rate) : db.settings.default_gst_rate,
    loyalty_spend_per_point: updates.loyalty_spend_per_point !== undefined ? Number(updates.loyalty_spend_per_point) : db.settings.loyalty_spend_per_point,
    loyalty_point_value: updates.loyalty_point_value !== undefined ? Number(updates.loyalty_point_value) : db.settings.loyalty_point_value,
    max_discount_percent: updates.max_discount_percent !== undefined ? Number(updates.max_discount_percent) : db.settings.max_discount_percent,
  };

  db.logAudit(req.user?.name || 'Owner', 'OWNER', 'Settings Updated', 'Updated Cafe & Billing configuration');

  return res.json({ success: true, message: 'Settings updated successfully', data: db.settings });
};
