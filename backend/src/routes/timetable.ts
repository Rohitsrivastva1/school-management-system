import { Router } from 'express';
import {
  getTimetable,
  getTimetableByClass,
  getTimetableByTeacher,
  createTimetable,
  updateTimetable,
  deleteTimetable,
  getTimetableStats,
} from '../controllers/timetableController';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '../types';
import { validateUUID } from '../middleware/validation';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Get timetable (admin, class teachers, subject teachers)
router.get('/', authorize(UserRole.ADMIN, UserRole.CLASS_TEACHER, UserRole.SUBJECT_TEACHER), getTimetable);

// Get timetable by class (admin, class teachers, subject teachers, parents, students)
router.get('/class/:classId', authorize(UserRole.ADMIN, UserRole.CLASS_TEACHER, UserRole.SUBJECT_TEACHER, UserRole.PARENT, UserRole.STUDENT), validateUUID('classId'), getTimetableByClass);

// Get timetable by teacher (admin, class teachers, subject teachers)
router.get('/teacher/:teacherId', authorize(UserRole.ADMIN, UserRole.CLASS_TEACHER, UserRole.SUBJECT_TEACHER), validateUUID('teacherId'), getTimetableByTeacher);

// Get timetable stats (admin only)
router.get('/stats', authorize(UserRole.ADMIN), getTimetableStats);

// Create timetable entry (admin only)
router.post('/', authorize(UserRole.ADMIN), createTimetable);

// Update timetable entry (admin only)
router.put('/:id', authorize(UserRole.ADMIN), validateUUID('id'), updateTimetable);

// Delete timetable entry (admin only)
router.delete('/:id', authorize(UserRole.ADMIN), validateUUID('id'), deleteTimetable);

export default router;
