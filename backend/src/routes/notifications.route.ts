import { Router } from 'express';
import { NotificationsController } from '../controllers/notifications.controller';
import { authenticated } from '../middleware/auth';
import {
  destructiveActionRateLimiter,
  writeRateLimiter,
} from '../middleware/rate-limit';

const router = Router();

router.use(authenticated);

router.get('/', NotificationsController.getNotifications);

router.get('/unread-count', NotificationsController.getUnreadCount);

router.put('/mark-all-read', writeRateLimiter, NotificationsController.markAllAsRead);

router.put('/:id/read', writeRateLimiter, NotificationsController.markAsRead);

router.delete('/:id', destructiveActionRateLimiter, NotificationsController.deleteNotification);

export default router;
