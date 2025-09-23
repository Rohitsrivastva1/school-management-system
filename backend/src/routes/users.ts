import { Router } from 'express';
import { 
  createTeacher, 
  getTeachers, 
  bulkUploadStudents, 
  getStudents, 
  updateUser, 
  deleteUser 
} from '../controllers/userController';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '../types';
import { 
  validateTeacherCreation, 
  validatePagination, 
  validateUUID 
} from '../middleware/validation';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Teacher routes (Admin only)
router.post('/teachers', authorize(UserRole.ADMIN), validateTeacherCreation, createTeacher);
router.get('/teachers', authorize(UserRole.ADMIN), validatePagination, getTeachers);

// Student routes (Admin and Class Teachers)
router.post('/students/bulk', authorize(UserRole.ADMIN, UserRole.CLASS_TEACHER), bulkUploadStudents);
router.get('/students', authorize(UserRole.ADMIN, UserRole.CLASS_TEACHER), validatePagination, getStudents);

// User management routes (Admin only)
router.put('/:userId', authorize(UserRole.ADMIN), validateUUID('userId'), updateUser);
router.delete('/:userId', authorize(UserRole.ADMIN), validateUUID('userId'), deleteUser);

export default router;
