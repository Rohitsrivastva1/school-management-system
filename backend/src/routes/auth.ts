import { Router } from 'express';
import { 
  registerSchool, 
  login, 
  refreshToken, 
  logout, 
  getProfile, 
  updateProfile, 
  changePassword 
} from '../controllers/authController';
import { authenticate } from '../middleware/auth';
import { 
  validateSchoolRegistration, 
  validateLogin 
} from '../middleware/validation';

const router = Router();

// Public routes
router.post('/school/register', validateSchoolRegistration, registerSchool);
router.post('/login', validateLogin, login);
router.post('/refresh', refreshToken);

// Protected routes
router.use(authenticate); // All routes below require authentication

router.post('/logout', logout);
router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.put('/change-password', changePassword);

export default router;
