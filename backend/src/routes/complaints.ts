import { Router } from 'express';
import { 
  createComplaint, 
  getComplaints, 
  getComplaintById,
  updateComplaint,
  resolveComplaint,
  deleteComplaint
} from '../controllers/complaintController';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '../types';
import { 
  validateComplaintCreation, 
  validateComplaintUpdate,
  validatePagination, 
  validateUUID 
} from '../middleware/validation';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Complaint management routes
router.post('/', authorize(UserRole.PARENT, UserRole.STUDENT, UserRole.ADMIN), validateComplaintCreation, createComplaint);
router.get('/', authorize(UserRole.ADMIN, UserRole.CLASS_TEACHER, UserRole.PARENT), validatePagination, getComplaints);
router.get('/:complaintId', authorize(UserRole.ADMIN, UserRole.CLASS_TEACHER, UserRole.PARENT), validateUUID('complaintId'), getComplaintById);
router.put('/:complaintId', authorize(UserRole.ADMIN, UserRole.CLASS_TEACHER), validateUUID('complaintId'), validateComplaintUpdate, updateComplaint);
router.put('/:complaintId/resolve', authorize(UserRole.ADMIN, UserRole.CLASS_TEACHER), validateUUID('complaintId'), resolveComplaint);
router.delete('/:complaintId', authorize(UserRole.ADMIN), validateUUID('complaintId'), deleteComplaint);

export default router;
