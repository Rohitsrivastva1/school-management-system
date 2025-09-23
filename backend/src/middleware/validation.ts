import { Request, Response, NextFunction } from 'express';
import { body, param, query, validationResult } from 'express-validator';
import { UserRole, Gender, AttendanceStatus, Priority } from '../types';

export const handleValidationErrors = (req: Request, res: Response, next: NextFunction): void => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    res.status(422).json({
      success: false,
      error: 'VALIDATION_ERROR',
      message: 'Validation failed',
      details: errors.array().map(error => ({
        field: error.type === 'field' ? error.path : 'unknown',
        message: error.msg
      }))
    });
    return;
  }
  
  next();
};

// School registration validation
export const validateSchoolRegistration = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 255 })
    .withMessage('School name must be between 2 and 255 characters'),
  
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
  
  body('phone')
    .optional()
    .isMobilePhone('any')
    .withMessage('Please provide a valid phone number'),
  
  body('website')
    .optional()
    .isURL()
    .withMessage('Please provide a valid website URL'),
  
  handleValidationErrors
];

// User login validation
export const validateLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  
  handleValidationErrors
];

// Teacher creation validation
export const validateTeacherCreation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  
  body('firstName')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('First name must be between 1 and 100 characters'),
  
  body('lastName')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Last name must be between 1 and 100 characters'),
  
  body('phone')
    .optional()
    .isMobilePhone('any')
    .withMessage('Please provide a valid phone number'),
  
  body('employeeId')
    .trim()
    .notEmpty()
    .withMessage('Employee ID is required'),
  
  body('subjects')
    .isArray({ min: 1 })
    .withMessage('At least one subject must be specified'),
  
  body('joiningDate')
    .isISO8601()
    .withMessage('Please provide a valid joining date'),
  
  handleValidationErrors
];

// Class creation validation
export const validateClassCreation = [
  body('name')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Class name must be between 1 and 50 characters'),
  
  body('section')
    .optional()
    .trim()
    .isLength({ max: 10 })
    .withMessage('Section must be at most 10 characters'),
  
  body('academicYear')
    .trim()
    .matches(/^\d{4}-\d{2}$/)
    .withMessage('Academic year must be in format YYYY-YY'),
  
  body('maxStudents')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Max students must be between 1 and 100'),
  
  handleValidationErrors
];

// Attendance marking validation
export const validateAttendanceMarking = [
  body('classId')
    .isUUID()
    .withMessage('Please provide a valid class ID'),
  
  body('date')
    .isISO8601()
    .withMessage('Please provide a valid date'),
  
  body('attendance')
    .isArray({ min: 1 })
    .withMessage('At least one attendance record is required'),
  
  body('attendance.*.studentId')
    .isUUID()
    .withMessage('Please provide a valid student ID'),
  
  body('attendance.*.status')
    .isIn(Object.values(AttendanceStatus))
    .withMessage('Please provide a valid attendance status'),
  
  handleValidationErrors
];

// Homework creation validation
export const validateHomeworkCreation = [
  body('classId')
    .isUUID()
    .withMessage('Please provide a valid class ID'),
  
  body('subjectId')
    .isUUID()
    .withMessage('Please provide a valid subject ID'),
  
  body('title')
    .trim()
    .isLength({ min: 1, max: 255 })
    .withMessage('Homework title must be between 1 and 255 characters'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description must be at most 1000 characters'),
  
  body('dueDate')
    .isISO8601()
    .withMessage('Please provide a valid due date'),
  
  handleValidationErrors
];

// Notification creation validation
export const validateNotificationCreation = [
  body('title')
    .trim()
    .isLength({ min: 1, max: 255 })
    .withMessage('Notification title must be between 1 and 255 characters'),
  
  body('message')
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage('Notification message must be between 1 and 1000 characters'),
  
  body('type')
    .isIn(['announcement', 'homework', 'attendance', 'complaint', 'qa', 'general'])
    .withMessage('Please provide a valid notification type'),
  
  body('priority')
    .optional()
    .isIn(Object.values(Priority))
    .withMessage('Please provide a valid priority level'),
  
  handleValidationErrors
];

// UUID parameter validation
export const validateUUID = (paramName: string) => [
  param(paramName)
    .isUUID()
    .withMessage(`Please provide a valid ${paramName}`),
  
  handleValidationErrors
];

// Pagination validation
export const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  
  handleValidationErrors
];
