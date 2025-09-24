import { Router } from 'express';
import { 
  createHomework, 
  getHomework, 
  getHomeworkById,
  getHomeworkByClass,
  getHomeworkByTeacher,
  updateHomework,
  deleteHomework,
  publishHomework,
  getHomeworkStats
} from '../controllers/homeworkController';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '../types';
import { 
  validateHomeworkCreation, 
  validatePagination, 
  validateUUID 
} from '../middleware/validation';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Homework management routes (Teachers and Admins)
router.post('/', authorize(UserRole.ADMIN, UserRole.CLASS_TEACHER, UserRole.SUBJECT_TEACHER), validateHomeworkCreation, createHomework);
router.get('/', authorize(UserRole.ADMIN, UserRole.CLASS_TEACHER, UserRole.SUBJECT_TEACHER), validatePagination, getHomework);
router.get('/teacher/:teacherId', authorize(UserRole.ADMIN, UserRole.CLASS_TEACHER, UserRole.SUBJECT_TEACHER), validateUUID('teacherId'), validatePagination, getHomeworkByTeacher);
router.get('/class/:classId', authorize(UserRole.ADMIN, UserRole.CLASS_TEACHER, UserRole.SUBJECT_TEACHER), validateUUID('classId'), validatePagination, getHomeworkByClass);
router.get('/stats', authorize(UserRole.ADMIN, UserRole.CLASS_TEACHER), getHomeworkStats);

// Individual homework routes
router.get('/:homeworkId', authorize(UserRole.ADMIN, UserRole.CLASS_TEACHER, UserRole.SUBJECT_TEACHER), validateUUID('homeworkId'), getHomeworkById);
router.put('/:homeworkId', authorize(UserRole.ADMIN, UserRole.CLASS_TEACHER, UserRole.SUBJECT_TEACHER), validateUUID('homeworkId'), updateHomework);
router.delete('/:homeworkId', authorize(UserRole.ADMIN, UserRole.CLASS_TEACHER, UserRole.SUBJECT_TEACHER), validateUUID('homeworkId'), deleteHomework);
router.patch('/:homeworkId/publish', authorize(UserRole.ADMIN, UserRole.CLASS_TEACHER, UserRole.SUBJECT_TEACHER), validateUUID('homeworkId'), publishHomework);

export default router;
