import { Request, Response } from 'express';
import { db } from '../database/db';

export const getNotifications = (req: Request, res: Response) => {
  const unreadCount = db.notifications.filter(n => !n.is_read).length;
  return res.json({
    success: true,
    unread_count: unreadCount,
    data: db.notifications,
  });
};

export const markNotificationRead = (req: Request, res: Response) => {
  const { id } = req.params;
  const notif = db.notifications.find(n => n.id === id);
  if (notif) {
    notif.is_read = true;
    return res.json({ success: true, message: 'Marked as read', data: notif });
  }
  return res.status(404).json({ success: false, message: 'Notification not found' });
};

export const markAllNotificationsRead = (req: Request, res: Response) => {
  db.notifications.forEach(n => {
    n.is_read = true;
  });
  return res.json({ success: true, message: 'All notifications marked as read' });
};
