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
  dateOfBirth?: string;
  gender?: Gender;
  address?: string;
  isActive: boolean;
  emailVerified: boolean;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
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
  academicYearStart?: string;
  academicYearEnd?: string;
  timezone: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
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
  createdAt: string;
  updatedAt: string;
}

// Student Types
export interface Student {
  id: string;
  userId: string;
  classId: string;
  rollNumber: string;
  admissionNumber?: string;
  admissionDate: string;
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
  createdAt: string;
  updatedAt: string;
}

// Teacher Types
export interface Teacher {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  teacher?: {
    id: string;
    employeeId?: string;
    qualification?: string;
    experienceYears?: number;
    isClassTeacher: boolean;
  };
}

export interface CreateTeacherPayload {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string;
  qualification?: string;
  experienceYears?: number;
  subjects?: string;
  employeeId?: string;
  isClassTeacher?: boolean;
}

export interface UpdateTeacherPayload {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  qualification?: string;
  experienceYears?: number;
  employeeId?: string;
  isClassTeacher?: boolean;
  isActive?: boolean;
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
  createdAt: string;
  updatedAt: string;
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
  createdAt: string;
  updatedAt: string;
}

// Attendance Types
export interface Attendance {
  id: string;
  studentId: string;
  classId: string;
  date: string;
  status: AttendanceStatus;
  markedBy: string;
  remarks?: string;
  createdAt: string;
  updatedAt: string;
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
  dueDate: string;
  attachments?: FileAttachment[];
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
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
  readAt?: string;
  createdAt: string;
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
  createdAt: string;
  repliedAt?: string;
  closedAt?: string;
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
  createdAt: string;
  resolvedAt?: string;
  closedAt?: string;
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

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
  schoolId: string;
  firstName: string;
  lastName: string;
  profileImageUrl?: string;
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
  timestamp: string;
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

// Form Types
export interface SchoolRegistrationForm {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  phone?: string;
  website?: string;
}

export interface LoginForm {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface TeacherForm {
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  employeeId: string;
  qualification?: string;
  subjects: string[];
  joiningDate: string;
}

export interface ClassForm {
  name: string;
  section?: string;
  academicYear: string;
  classTeacherId?: string;
  maxStudents: number;
  roomNumber?: string;
}

export interface StudentForm {
  rollNumber: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: Gender;
  fatherName?: string;
  motherName?: string;
  fatherPhone?: string;
  motherPhone?: string;
  fatherEmail?: string;
  motherEmail?: string;
  admissionDate: string;
}

// Chart Data Types
export interface ChartData {
  name: string;
  value: number;
  color?: string;
}

export interface TimeSeriesData {
  date: string;
  value: number;
}

// Table Types
export interface TableColumn<T> {
  key: keyof T;
  label: string;
  sortable?: boolean;
  render?: (value: any, row: T) => React.ReactNode;
}

export interface TableProps<T> {
  data: T[];
  columns: TableColumn<T>[];
  loading?: boolean;
  pagination?: Pagination;
  onPageChange?: (page: number) => void;
  onSort?: (key: keyof T, direction: 'asc' | 'desc') => void;
}
