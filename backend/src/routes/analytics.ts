import { Router } from 'express';
import { 
  getAttendanceAnalytics,
  getPerformanceAnalytics,
  getClassAnalytics,
  getTeacherAnalytics,
  getStudentAnalytics,
  getSchoolAnalytics
} from '../controllers/analyticsController';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '../types';
import { validatePagination } from '../middleware/validation';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Analytics routes
router.get('/attendance', authorize(UserRole.ADMIN, UserRole.CLASS_TEACHER), validatePagination, getAttendanceAnalytics);
router.get('/performance', authorize(UserRole.ADMIN, UserRole.CLASS_TEACHER), validatePagination, getPerformanceAnalytics);
router.get('/class', authorize(UserRole.ADMIN, UserRole.CLASS_TEACHER), validatePagination, getClassAnalytics);
router.get('/teacher', authorize(UserRole.ADMIN), validatePagination, getTeacherAnalytics);
router.get('/student', authorize(UserRole.ADMIN, UserRole.CLASS_TEACHER, UserRole.PARENT), validatePagination, getStudentAnalytics);
router.get('/school', authorize(UserRole.ADMIN), getSchoolAnalytics);

export default router;
