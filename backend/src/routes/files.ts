import { Router } from 'express';
import { 
  uploadFile, 
  getFile, 
  deleteFile,
  getFileStats
} from '../controllers/fileController';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '../types';
import { validateUUID } from '../middleware/validation';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Define allowed file types
  const allowedTypes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/csv',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation'
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only images, documents, and spreadsheets are allowed.'));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// All routes require authentication
router.use(authenticate);

// File management routes
router.post('/upload', authorize(UserRole.ADMIN, UserRole.CLASS_TEACHER, UserRole.SUBJECT_TEACHER, UserRole.PARENT, UserRole.STUDENT), upload.single('file'), uploadFile);
router.get('/:fileId', authorize(UserRole.ADMIN, UserRole.CLASS_TEACHER, UserRole.SUBJECT_TEACHER, UserRole.PARENT, UserRole.STUDENT), validateUUID('fileId'), getFile);
router.delete('/:fileId', authorize(UserRole.ADMIN, UserRole.CLASS_TEACHER, UserRole.SUBJECT_TEACHER), validateUUID('fileId'), deleteFile);
router.get('/stats/overview', authorize(UserRole.ADMIN), getFileStats);

export default router;
