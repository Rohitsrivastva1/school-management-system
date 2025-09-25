import { Router } from 'express';
import { 
  createTeacher, 
  getTeachers, 
  bulkUploadStudents, 
  getStudents,
  getStudentById,
  updateStudent,
  createStudent,
  deleteStudent,
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

// Student routes (Admin, Class Teachers, and Subject Teachers)
router.post('/students/bulk', authorize(UserRole.ADMIN, UserRole.CLASS_TEACHER), bulkUploadStudents);
router.get('/students', authorize(UserRole.ADMIN, UserRole.CLASS_TEACHER, UserRole.SUBJECT_TEACHER), validatePagination, getStudents);
router.get('/students/:id', authorize(UserRole.ADMIN, UserRole.CLASS_TEACHER, UserRole.SUBJECT_TEACHER), validateUUID('id'), getStudentById);
router.post('/students', authorize(UserRole.ADMIN), createStudent);
router.put('/students/:id', authorize(UserRole.ADMIN, UserRole.CLASS_TEACHER), validateUUID('id'), updateStudent);
router.delete('/students/:id', authorize(UserRole.ADMIN), validateUUID('id'), deleteStudent);

// User management routes (Admin only)
router.put('/:userId', authorize(UserRole.ADMIN), validateUUID('userId'), updateUser);
router.delete('/:userId', authorize(UserRole.ADMIN), validateUUID('userId'), deleteUser);

export default router;
