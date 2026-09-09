import { Request, Response } from 'express';
import { db } from '../database/db';
import { AuthRequest } from '../middleware/auth';

export const getNotifications = (req: Request, res: Response) => {
  const authReq = req as AuthRequest;
  const cafeId = authReq.user?.cafe_id;
  if (!cafeId) {
    return res.status(401).json({ success: false, message: 'Authentication required' });
  }

  const cafeNotifs = db.notifications.filter(n => n.cafe_id === cafeId);
  const unreadCount = cafeNotifs.filter(n => !n.is_read).length;
  return res.json({
    success: true,
    unread_count: unreadCount,
    data: cafeNotifs,
  });
};

export const markNotificationRead = (req: Request, res: Response) => {
  const authReq = req as AuthRequest;
  const cafeId = authReq.user?.cafe_id;
  if (!cafeId) {
    return res.status(401).json({ success: false, message: 'Authentication required' });
  }

  const { id } = req.params;
  const notif = db.notifications.find(n => n.cafe_id === cafeId && n.id === id);
  if (notif) {
    notif.is_read = true;
    return res.json({ success: true, message: 'Marked as read', data: notif });
  }
  return res.status(404).json({ success: false, message: 'Notification not found in this cafe' });
};

export const markAllNotificationsRead = (req: Request, res: Response) => {
  const authReq = req as AuthRequest;
  const cafeId = authReq.user?.cafe_id;
  if (!cafeId) {
    return res.status(401).json({ success: false, message: 'Authentication required' });
  }

  db.notifications.filter(n => n.cafe_id === cafeId).forEach(n => {
    n.is_read = true;
  });
  return res.json({ success: true, message: 'All notifications marked as read' });
};

