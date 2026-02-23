import { Router } from 'express';
import { NotificationsController } from '../controllers/notifications.controller';
import { authenticated } from '../middleware/auth';

const router = Router();

router.use(authenticated);

router.get('/', NotificationsController.getNotifications);

router.get('/unread-count', NotificationsController.getUnreadCount);

router.put('/mark-all-read', NotificationsController.markAllAsRead);

router.put('/:id/read', NotificationsController.markAsRead);

router.delete('/:id', NotificationsController.deleteNotification);

export default router;
