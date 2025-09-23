import { Router } from 'express';
import { 
  getSchoolProfile, 
  updateSchoolProfile, 
  getSchoolStats 
} from '../controllers/schoolController';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '../types';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Get school profile
router.get('/profile', getSchoolProfile);

// Update school profile (Admin only)
router.put('/profile', authorize(UserRole.ADMIN), updateSchoolProfile);

// Get school statistics (Admin only)
router.get('/stats', authorize(UserRole.ADMIN), getSchoolStats);

export default router;
