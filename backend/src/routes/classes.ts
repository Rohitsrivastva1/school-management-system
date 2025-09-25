import { Router } from 'express';
import { 
  createClass, 
  getClasses, 
  getClassDetails, 
  updateClass, 
  deleteClass, 
  getClassStats 
} from '../controllers/classController';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '../types';
import { 
  validateClassCreation, 
  validatePagination, 
  validateUUID 
} from '../middleware/validation';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Class management routes (Admin, Class Teachers, and Subject Teachers)
router.post('/', authorize(UserRole.ADMIN, UserRole.CLASS_TEACHER), validateClassCreation, createClass);
router.get('/', authorize(UserRole.ADMIN, UserRole.CLASS_TEACHER, UserRole.SUBJECT_TEACHER), validatePagination, getClasses);
router.get('/stats', authorize(UserRole.ADMIN), getClassStats);

// Individual class routes
router.get('/:classId', authorize(UserRole.ADMIN, UserRole.CLASS_TEACHER, UserRole.SUBJECT_TEACHER), validateUUID('classId'), getClassDetails);
router.put('/:classId', authorize(UserRole.ADMIN, UserRole.CLASS_TEACHER), validateUUID('classId'), updateClass);
router.delete('/:classId', authorize(UserRole.ADMIN), validateUUID('classId'), deleteClass);

export default router;
