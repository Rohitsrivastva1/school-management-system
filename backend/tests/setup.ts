import { PrismaClient } from '@prisma/client';

// Test database configuration
const testDatabaseUrl = process.env.TEST_DATABASE_URL || 'postgresql://test_user:test_password@localhost:5432/school_management_test';

// Create a separate Prisma client for testing
export const testPrisma = new PrismaClient({
  datasources: {
    db: {
      url: testDatabaseUrl,
    },
  },
});

// Global test setup
beforeAll(async () => {
  // Connect to test database
  await testPrisma.$connect();
  
  // Clean up any existing test data
  await cleanupTestData();
});

// Global test teardown
afterAll(async () => {
  // Clean up test data
  await cleanupTestData();
  
  // Disconnect from database
  await testPrisma.$disconnect();
});

// Clean up test data after each test
afterEach(async () => {
  await cleanupTestData();
});

// Helper function to clean up test data
async function cleanupTestData() {
  // Delete in reverse order of dependencies
  await testPrisma.session.deleteMany();
  await testPrisma.grade.deleteMany();
  await testPrisma.complaint.deleteMany();
  await testPrisma.qaMessage.deleteMany();
  await testPrisma.notification.deleteMany();
  await testPrisma.homeworkSubmission.deleteMany();
  await testPrisma.homework.deleteMany();
  await testPrisma.attendance.deleteMany();
  await testPrisma.timetable.deleteMany();
  await testPrisma.student.deleteMany();
  await testPrisma.teacher.deleteMany();
  await testPrisma.subject.deleteMany();
  await testPrisma.class.deleteMany();
  await testPrisma.user.deleteMany();
  await testPrisma.school.deleteMany();
}

// Test data factories
export const testData = {
  school: {
    name: 'Test School',
    email: 'test@school.com',
    address: '123 Test Street',
    city: 'Test City',
    state: 'Test State',
    pincode: '123456',
    phone: '+91-9876543210',
    website: 'https://testschool.com',
  },
  
  admin: {
    email: 'admin@school.com',
    password: 'TestPass123!',
    firstName: 'Admin',
    lastName: 'User',
    role: 'admin',
  },
  
  teacher: {
    email: 'teacher@school.com',
    password: 'TestPass123!',
    firstName: 'John',
    lastName: 'Teacher',
    phone: '+91-9876543211',
    employeeId: 'EMP001',
    qualification: 'M.Ed',
    subjects: ['Mathematics', 'Physics'],
    joiningDate: '2024-01-15',
  },
  
  student: {
    email: 'student@school.com',
    password: 'TestPass123!',
    firstName: 'Jane',
    lastName: 'Student',
    rollNumber: '001',
    admissionDate: '2024-01-15',
    fatherName: 'Robert Student',
    motherName: 'Sarah Student',
    fatherPhone: '+91-9876543212',
    motherPhone: '+91-9876543213',
  },
  
  class: {
    name: 'Class 5',
    section: 'A',
    academicYear: '2024-25',
    maxStudents: 40,
    roomNumber: 'Room 501',
  },
  
  subject: {
    name: 'Mathematics',
    code: 'MATH',
    description: 'Basic Mathematics',
    isCore: true,
  },
};

// Helper function to create test school
export async function createTestSchool() {
  return await testPrisma.school.create({
    data: testData.school,
  });
}

// Helper function to create test admin user
export async function createTestAdmin(schoolId: string) {
  const bcrypt = require('bcryptjs');
  const passwordHash = await bcrypt.hash(testData.admin.password, 12);
  
  return await testPrisma.user.create({
    data: {
      schoolId,
      email: testData.admin.email,
      passwordHash,
      role: testData.admin.role,
      firstName: testData.admin.firstName,
      lastName: testData.admin.lastName,
      emailVerified: true,
    },
  });
}

// Helper function to create test teacher
export async function createTestTeacher(schoolId: string) {
  const bcrypt = require('bcryptjs');
  const passwordHash = await bcrypt.hash(testData.teacher.password, 12);
  
  const user = await testPrisma.user.create({
    data: {
      schoolId,
      email: testData.teacher.email,
      passwordHash,
      role: 'subject_teacher',
      firstName: testData.teacher.firstName,
      lastName: testData.teacher.lastName,
      phone: testData.teacher.phone,
      emailVerified: true,
    },
  });
  
  const teacher = await testPrisma.teacher.create({
    data: {
      userId: user.id,
      employeeId: testData.teacher.employeeId,
      qualification: testData.teacher.qualification,
      subjects: testData.teacher.subjects,
      joiningDate: new Date(testData.teacher.joiningDate),
    },
  });
  
  return { user, teacher };
}

// Helper function to create test class
export async function createTestClass(schoolId: string, classTeacherId?: string) {
  return await testPrisma.class.create({
    data: {
      schoolId,
      name: testData.class.name,
      section: testData.class.section,
      academicYear: testData.class.academicYear,
      classTeacherId,
      maxStudents: testData.class.maxStudents,
      roomNumber: testData.class.roomNumber,
    },
  });
}

// Helper function to create test subject
export async function createTestSubject(schoolId: string) {
  return await testPrisma.subject.create({
    data: {
      schoolId,
      name: testData.subject.name,
      code: testData.subject.code,
      description: testData.subject.description,
      isCore: testData.subject.isCore,
    },
  });
}

// Helper function to generate JWT token
export function generateTestToken(payload: any) {
  const jwt = require('jsonwebtoken');
  const secret = process.env.JWT_SECRET || 'test-secret';
  
  return jwt.sign(payload, secret, { expiresIn: '1h' });
}
