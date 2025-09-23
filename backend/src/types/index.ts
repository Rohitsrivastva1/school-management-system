// User Types
export interface User {
  id: string;
  schoolId: string;
  email: string;
  role: UserRole;
  firstName: string;
  lastName: string;
  phone?: string;
  profileImageUrl?: string;
  dateOfBirth?: Date;
  gender?: Gender;
  address?: string;
  isActive: boolean;
  emailVerified: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export enum UserRole {
  ADMIN = 'admin',
  CLASS_TEACHER = 'class_teacher',
  SUBJECT_TEACHER = 'subject_teacher',
  PARENT = 'parent',
  STUDENT = 'student'
}

export enum Gender {
  MALE = 'male',
  FEMALE = 'female',
  OTHER = 'other'
}

// School Types
export interface School {
  id: string;
  name: string;
  address?: string;
  city?: string;
  state?: string;
  country: string;
  pincode?: string;
  phone?: string;
  email: string;
  website?: string;
  logoUrl?: string;
  domain?: string;
  academicYearStart?: Date;
  academicYearEnd?: Date;
  timezone: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Class Types
export interface Class {
  id: string;
  schoolId: string;
  name: string;
  section?: string;
  academicYear: string;
  classTeacherId?: string;
  maxStudents: number;
  roomNumber?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Student Types
export interface Student {
  id: string;
  userId: string;
  classId: string;
  rollNumber: string;
  admissionNumber?: string;
  admissionDate: Date;
  parentId?: string;
  fatherName?: string;
  motherName?: string;
  fatherPhone?: string;
  motherPhone?: string;
  fatherEmail?: string;
  motherEmail?: string;
  emergencyContact?: string;
  bloodGroup?: string;
  medicalConditions?: string;
  transportMode?: string;
  busRoute?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Teacher Types
export interface Teacher {
  id: string;
  userId: string;
  employeeId: string;
  qualification?: string;
  subjects: string[];
  joiningDate: Date;
  salary?: number;
  department?: string;
  experienceYears?: number;
  isClassTeacher: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Subject Types
export interface Subject {
  id: string;
  schoolId: string;
  name: string;
  code?: string;
  description?: string;
  isCore: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Timetable Types
export interface Timetable {
  id: string;
  schoolId: string;
  classId: string;
  subjectId: string;
  teacherId: string;
  dayOfWeek: number;
  periodNumber: number;
  startTime: string;
  endTime: string;
  roomNumber?: string;
  academicYear: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Attendance Types
export interface Attendance {
  id: string;
  studentId: string;
  classId: string;
  date: Date;
  status: AttendanceStatus;
  markedBy: string;
  remarks?: string;
  createdAt: Date;
  updatedAt: Date;
}

export enum AttendanceStatus {
  PRESENT = 'present',
  ABSENT = 'absent',
  LATE = 'late',
  EXCUSED = 'excused'
}

// Homework Types
export interface Homework {
  id: string;
  classId: string;
  subjectId: string;
  teacherId: string;
  title: string;
  description?: string;
  dueDate: Date;
  attachments?: FileAttachment[];
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface FileAttachment {
  fileName: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
}

// Notification Types
export interface Notification {
  id: string;
  schoolId: string;
  senderId: string;
  recipientId?: string;
  recipientType?: RecipientType;
  recipientClassId?: string;
  title: string;
  message: string;
  type: NotificationType;
  priority: Priority;
  isRead: boolean;
  readAt?: Date;
  createdAt: Date;
}

export enum RecipientType {
  ALL = 'all',
  CLASS = 'class',
  PARENT = 'parent',
  TEACHER = 'teacher',
  STUDENT = 'student'
}

export enum NotificationType {
  ANNOUNCEMENT = 'announcement',
  HOMEWORK = 'homework',
  ATTENDANCE = 'attendance',
  COMPLAINT = 'complaint',
  QA = 'qa',
  GENERAL = 'general'
}

export enum Priority {
  LOW = 'low',
  NORMAL = 'normal',
  HIGH = 'high',
  URGENT = 'urgent'
}

// Q&A Types
export interface QAMessage {
  id: string;
  parentId: string;
  classTeacherId: string;
  studentId: string;
  message: string;
  reply?: string;
  status: QAStatus;
  priority: Priority;
  createdAt: Date;
  repliedAt?: Date;
  closedAt?: Date;
}

export enum QAStatus {
  PENDING = 'pending',
  REPLIED = 'replied',
  CLOSED = 'closed'
}

// Complaint Types
export interface Complaint {
  id: string;
  studentId: string;
  complainantId: string;
  classTeacherId?: string;
  subject: string;
  description: string;
  category?: ComplaintCategory;
  status: ComplaintStatus;
  priority: Priority;
  resolution?: string;
  resolvedBy?: string;
  createdAt: Date;
  resolvedAt?: Date;
  closedAt?: Date;
}

export enum ComplaintCategory {
  ACADEMIC = 'academic',
  BEHAVIORAL = 'behavioral',
  DISCIPLINARY = 'disciplinary',
  OTHER = 'other'
}

export enum ComplaintStatus {
  OPEN = 'open',
  IN_PROGRESS = 'in_progress',
  RESOLVED = 'resolved',
  CLOSED = 'closed'
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  pagination?: Pagination;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// Authentication Types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  phone?: string;
  website?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface JWTPayload {
  userId: string;
  schoolId: string;
  role: UserRole;
  email: string;
  iat: number;
  exp: number;
}

// Dashboard Types
export interface DashboardStats {
  totalStudents: number;
  totalTeachers: number;
  totalClasses: number;
  attendanceRate: number;
}

export interface RecentActivity {
  type: string;
  message: string;
  timestamp: Date;
}

// File Upload Types
export interface UploadedFile {
  fileId: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
}

// Validation Error Types
export interface ValidationError {
  field: string;
  message: string;
}

export interface ErrorResponse {
  success: false;
  error: string;
  message: string;
  details?: ValidationError[];
}
