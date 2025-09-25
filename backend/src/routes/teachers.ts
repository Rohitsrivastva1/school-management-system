import { Router } from 'express';
import { 
  createTeacher, 
  getTeachers, 
  getTeacherById, 
  updateTeacher, 
  deleteTeacher,
  getTeacherStats,
  getTeacherSubjects
} from '../controllers/teacherController';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '../types';
import { 
  validateUserCreation, 
  validateUserIdParam, 
  validateUserUpdate 
} from '../middleware/validation';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Teacher statistics
router.get('/stats', authorize(UserRole.ADMIN), getTeacherStats);

// Get teacher's subjects (teachers only)
router.get('/subjects', authorize(UserRole.CLASS_TEACHER, UserRole.SUBJECT_TEACHER), getTeacherSubjects);

// Create teacher (admin only)
router.post('/', authorize(UserRole.ADMIN), validateUserCreation, createTeacher);

// Get all teachers (admin and class_teacher)
router.get('/', authorize(UserRole.ADMIN, UserRole.CLASS_TEACHER), getTeachers);

// Get teacher by ID (admin and class_teacher)
router.get('/:id', authorize(UserRole.ADMIN, UserRole.CLASS_TEACHER), validateUserIdParam, getTeacherById);

// Update teacher (admin only)
router.put('/:id', authorize(UserRole.ADMIN), validateUserIdParam, validateUserUpdate, updateTeacher);

// Delete teacher (admin only)
router.delete('/:id', authorize(UserRole.ADMIN), validateUserIdParam, deleteTeacher);

export default router;
