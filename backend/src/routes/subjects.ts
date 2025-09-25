import { Router } from 'express';
import { 
  getSubjects,
  getSubjectById,
  createSubject,
  updateSubject,
  deleteSubject
} from '../controllers/subjectController';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '../types';
import { 
  validatePagination, 
  validateUUID 
} from '../middleware/validation';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Subject management routes
router.get('/', authorize(UserRole.ADMIN, UserRole.CLASS_TEACHER, UserRole.SUBJECT_TEACHER), validatePagination, getSubjects);
router.get('/:id', authorize(UserRole.ADMIN, UserRole.CLASS_TEACHER, UserRole.SUBJECT_TEACHER), validateUUID('id'), getSubjectById);
router.post('/', authorize(UserRole.ADMIN), createSubject);
router.put('/:id', authorize(UserRole.ADMIN), validateUUID('id'), updateSubject);
router.delete('/:id', authorize(UserRole.ADMIN), validateUUID('id'), deleteSubject);

export default router;
