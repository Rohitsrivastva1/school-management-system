import { Router } from 'express';
import { 
  createQAMessage, 
  getQAMessages, 
  replyToQA,
  getQAMessageById,
  updateQAStatus,
  deleteQAMessage
} from '../controllers/qaController';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '../types';
import { 
  validateQACreation, 
  validateQAReply,
  validatePagination, 
  validateUUID 
} from '../middleware/validation';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Q&A management routes
router.post('/', authorize(UserRole.PARENT, UserRole.CLASS_TEACHER), validateQACreation, createQAMessage);
router.get('/', authorize(UserRole.PARENT, UserRole.CLASS_TEACHER, UserRole.ADMIN), validatePagination, getQAMessages);
router.get('/:messageId', authorize(UserRole.PARENT, UserRole.CLASS_TEACHER, UserRole.ADMIN), validateUUID('messageId'), getQAMessageById);
router.put('/:messageId/reply', authorize(UserRole.CLASS_TEACHER, UserRole.ADMIN), validateUUID('messageId'), validateQAReply, replyToQA);
router.put('/:messageId/status', authorize(UserRole.CLASS_TEACHER, UserRole.ADMIN), validateUUID('messageId'), updateQAStatus);
router.delete('/:messageId', authorize(UserRole.ADMIN), validateUUID('messageId'), deleteQAMessage);

export default router;
