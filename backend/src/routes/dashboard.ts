import { Router } from 'express';
import { 
  getAdminDashboard,
  getTeacherDashboard,
  getParentDashboard,
  getStudentDashboard
} from '../controllers/dashboardController';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '../types';
import { validatePagination } from '../middleware/validation';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Dashboard routes
router.get('/admin', authorize(UserRole.ADMIN), getAdminDashboard);
router.get('/teacher', authorize(UserRole.CLASS_TEACHER, UserRole.SUBJECT_TEACHER), getTeacherDashboard);
router.get('/parent', authorize(UserRole.PARENT), validatePagination, getParentDashboard);
router.get('/student', authorize(UserRole.STUDENT), getStudentDashboard);

export default router;
