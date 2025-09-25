import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';

// Import routes
import authRoutes from './routes/auth';
import schoolRoutes from './routes/school';
import userRoutes from './routes/users';
import classRoutes from './routes/classes';
import teacherRoutes from './routes/teachers';
import subjectRoutes from './routes/subjects';
import attendanceRoutes from './routes/attendance';
import homeworkRoutes from './routes/homework';
import timetableRoutes from './routes/timetable';
import qaRoutes from './routes/qa';
import complaintRoutes from './routes/complaints';
import notificationRoutes from './routes/notifications';
import fileRoutes from './routes/files';
import dashboardRoutes from './routes/dashboard';
import analyticsRoutes from './routes/analytics';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://schoolmanagement.com', 'https://www.schoolmanagement.com']
    : ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true
}));

// Rate limiting (enabled in production by default)
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'), // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    error: 'TOO_MANY_REQUESTS',
    message: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Only enable the limiter when explicitly enabled
const isRateLimitEnabled = (
  (process.env.NODE_ENV === 'production') &&
  ((process.env.RATE_LIMIT_ENABLED ?? 'true') === 'true')
);

if (isRateLimitEnabled) {
  app.use('/api/', limiter);
}

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'School Management API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/schools', schoolRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/classes', classRoutes);
app.use('/api/v1/teachers', teacherRoutes);
app.use('/api/v1/subjects', subjectRoutes);
app.use('/api/v1/attendance', attendanceRoutes);
app.use('/api/v1/homework', homeworkRoutes);
app.use('/api/v1/timetable', timetableRoutes);
app.use('/api/v1/qa', qaRoutes);
app.use('/api/v1/complaints', complaintRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1/files', fileRoutes);
app.use('/api/v1/dashboard', dashboardRoutes);
app.use('/api/v1/analytics', analyticsRoutes);

// 404 handler
app.use(notFoundHandler);

// Error handling middleware
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
});

export default app;
