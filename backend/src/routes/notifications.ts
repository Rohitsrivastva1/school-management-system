import { Router } from 'express';
import { 
  createNotification, 
  getNotifications, 
  getNotificationById,
  markAsRead,
  deleteNotification,
  getNotificationStats
} from '../controllers/notificationController';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '../types';
import { 
  validateNotificationCreation, 
  validatePagination, 
  validateUUID 
} from '../middleware/validation';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Notification management routes
router.post('/', authorize(UserRole.ADMIN, UserRole.CLASS_TEACHER), validateNotificationCreation, createNotification);
router.get('/', authorize(UserRole.ADMIN, UserRole.CLASS_TEACHER, UserRole.PARENT, UserRole.STUDENT), validatePagination, getNotifications);
router.get('/stats', authorize(UserRole.ADMIN, UserRole.CLASS_TEACHER), getNotificationStats);
router.get('/:notificationId', authorize(UserRole.ADMIN, UserRole.CLASS_TEACHER, UserRole.PARENT, UserRole.STUDENT), validateUUID('notificationId'), getNotificationById);
router.put('/:notificationId/read', authorize(UserRole.ADMIN, UserRole.CLASS_TEACHER, UserRole.PARENT, UserRole.STUDENT), validateUUID('notificationId'), markAsRead);
router.delete('/:notificationId', authorize(UserRole.ADMIN), validateUUID('notificationId'), deleteNotification);

export default router;
