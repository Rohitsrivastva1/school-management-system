import { Router } from 'express';
import { 
  markAttendance, 
  getAttendanceByClass, 
  getAttendanceByStudent,
  getAttendanceStats,
  updateAttendance,
  deleteAttendance
} from '../controllers/attendanceController';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '../types';
import { 
  validateAttendanceMarking, 
  validatePagination, 
  validateUUID 
} from '../middleware/validation';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Attendance marking routes (Teachers and Admins)
router.post('/mark', authorize(UserRole.ADMIN, UserRole.CLASS_TEACHER, UserRole.SUBJECT_TEACHER), validateAttendanceMarking, markAttendance);
router.put('/:attendanceId', authorize(UserRole.ADMIN, UserRole.CLASS_TEACHER, UserRole.SUBJECT_TEACHER), validateUUID('attendanceId'), updateAttendance);
router.delete('/:attendanceId', authorize(UserRole.ADMIN), validateUUID('attendanceId'), deleteAttendance);

// Attendance viewing routes
router.get('/class/:classId', authorize(UserRole.ADMIN, UserRole.CLASS_TEACHER, UserRole.SUBJECT_TEACHER), validateUUID('classId'), validatePagination, getAttendanceByClass);
router.get('/student/:studentId', authorize(UserRole.ADMIN, UserRole.CLASS_TEACHER, UserRole.SUBJECT_TEACHER), validateUUID('studentId'), validatePagination, getAttendanceByStudent);
router.get('/stats', authorize(UserRole.ADMIN, UserRole.CLASS_TEACHER), getAttendanceStats);

export default router;
