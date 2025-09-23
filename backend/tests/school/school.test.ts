import request from 'supertest';
import app from '../../src/index';
import { testPrisma, testData, createTestSchool, createTestAdmin, generateTestToken } from '../setup';

describe('School Management APIs', () => {
  let testSchool: any;
  let testAdmin: any;
  let authToken: string;

  beforeEach(async () => {
    // Clean up before each test
    await testPrisma.user.deleteMany();
    await testPrisma.school.deleteMany();
    
    // Create test school and admin
    testSchool = await createTestSchool();
    testAdmin = await createTestAdmin(testSchool.id);
    
    // Get auth token
    authToken = generateTestToken({
      userId: testAdmin.id,
      schoolId: testSchool.id,
      role: 'admin',
      email: testAdmin.email
    });
  });

  describe('GET /api/v1/schools/profile', () => {
    it('should get school profile successfully', async () => {
      const response = await request(app)
        .get('/api/v1/schools/profile')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.name).toBe(testData.school.name);
      expect(response.body.data.email).toBe(testData.school.email);
      expect(response.body.data.address).toBe(testData.school.address);
      expect(response.body.data.city).toBe(testData.school.city);
      expect(response.body.data.state).toBe(testData.school.state);
      expect(response.body.data.pincode).toBe(testData.school.pincode);
      expect(response.body.data.phone).toBe(testData.school.phone);
      expect(response.body.data.website).toBe(testData.school.website);
    });

    it('should fail without authentication', async () => {
      const response = await request(app)
        .get('/api/v1/schools/profile');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('UNAUTHORIZED');
    });

    it('should fail with invalid token', async () => {
      const response = await request(app)
        .get('/api/v1/schools/profile')
        .set('Authorization', 'Bearer invalid-token');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('UNAUTHORIZED');
    });
  });

  describe('PUT /api/v1/schools/profile', () => {
    it('should update school profile successfully', async () => {
      const updateData = {
        name: 'Updated Test School',
        address: '789 Updated Street',
        city: 'Updated City',
        state: 'Updated State',
        pincode: '789012',
        phone: '+91-9876543211',
        website: 'https://updatedschool.com'
      };

      const response = await request(app)
        .put('/api/v1/schools/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe(updateData.name);
      expect(response.body.data.address).toBe(updateData.address);
      expect(response.body.data.city).toBe(updateData.city);
      expect(response.body.data.state).toBe(updateData.state);
      expect(response.body.data.pincode).toBe(updateData.pincode);
      expect(response.body.data.phone).toBe(updateData.phone);
      expect(response.body.data.website).toBe(updateData.website);
      expect(response.body.message).toBe('School profile updated successfully');
    });

    it('should update partial school profile', async () => {
      const updateData = {
        name: 'Partially Updated School',
        phone: '+91-9876543212'
      };

      const response = await request(app)
        .put('/api/v1/schools/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe(updateData.name);
      expect(response.body.data.phone).toBe(updateData.phone);
      // Other fields should remain unchanged
      expect(response.body.data.email).toBe(testData.school.email);
      expect(response.body.data.address).toBe(testData.school.address);
    });

    it('should fail without authentication', async () => {
      const response = await request(app)
        .put('/api/v1/schools/profile')
        .send({
          name: 'Updated School'
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('UNAUTHORIZED');
    });

    it('should fail without admin role', async () => {
      // Create a teacher user
      const bcrypt = require('bcryptjs');
      const passwordHash = await bcrypt.hash('password123', 12);
      
      const teacher = await testPrisma.user.create({
        data: {
          schoolId: testSchool.id,
          email: 'teacher@school.com',
          passwordHash,
          role: 'subject_teacher',
          firstName: 'Teacher',
          lastName: 'User',
          emailVerified: true,
        },
      });

      const teacherToken = generateTestToken({
        userId: teacher.id,
        schoolId: testSchool.id,
        role: 'subject_teacher',
        email: teacher.email
      });

      const response = await request(app)
        .put('/api/v1/schools/profile')
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({
          name: 'Updated School'
        });

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('FORBIDDEN');
    });
  });

  describe('GET /api/v1/schools/stats', () => {
    beforeEach(async () => {
      // Create test data for statistics
      const bcrypt = require('bcryptjs');
      const passwordHash = await bcrypt.hash('password123', 12);
      
      // Create teachers
      const teacher1 = await testPrisma.user.create({
        data: {
          schoolId: testSchool.id,
          email: 'teacher1@school.com',
          passwordHash,
          role: 'subject_teacher',
          firstName: 'Teacher',
          lastName: 'One',
          emailVerified: true,
        },
      });

      const teacher2 = await testPrisma.user.create({
        data: {
          schoolId: testSchool.id,
          email: 'teacher2@school.com',
          passwordHash,
          role: 'class_teacher',
          firstName: 'Teacher',
          lastName: 'Two',
          emailVerified: true,
        },
      });

      await testPrisma.teacher.createMany({
        data: [
          {
            userId: teacher1.id,
            employeeId: 'EMP001',
            subjects: ['Mathematics'],
            joiningDate: new Date('2024-01-15'),
          },
          {
            userId: teacher2.id,
            employeeId: 'EMP002',
            subjects: ['English'],
            joiningDate: new Date('2024-01-15'),
          },
        ]
      });

      // Create classes
      await testPrisma.class.createMany({
        data: [
          {
            schoolId: testSchool.id,
            name: 'Class 5',
            section: 'A',
            academicYear: '2024-25',
            classTeacherId: teacher2.id,
            maxStudents: 40,
            roomNumber: 'Room 501',
          },
          {
            schoolId: testSchool.id,
            name: 'Class 6',
            section: 'A',
            academicYear: '2024-25',
            maxStudents: 40,
            roomNumber: 'Room 502',
          },
        ]
      });

      // Create students
      const student1 = await testPrisma.user.create({
        data: {
          schoolId: testSchool.id,
          email: 'student1@school.com',
          passwordHash,
          role: 'student',
          firstName: 'Student',
          lastName: 'One',
          emailVerified: true,
        },
      });

      const student2 = await testPrisma.user.create({
        data: {
          schoolId: testSchool.id,
          email: 'student2@school.com',
          passwordHash,
          role: 'student',
          firstName: 'Student',
          lastName: 'Two',
          emailVerified: true,
        },
      });

      const class1 = await testPrisma.class.findFirst({
        where: { name: 'Class 5', schoolId: testSchool.id }
      });

      await testPrisma.student.createMany({
        data: [
          {
            userId: student1.id,
            classId: class1!.id,
            rollNumber: '001',
            admissionDate: new Date('2024-01-15'),
          },
          {
            userId: student2.id,
            classId: class1!.id,
            rollNumber: '002',
            admissionDate: new Date('2024-01-20'),
          },
        ]
      });
    });

    it('should get school statistics successfully', async () => {
      const response = await request(app)
        .get('/api/v1/schools/stats')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('totalStudents');
      expect(response.body.data).toHaveProperty('totalTeachers');
      expect(response.body.data).toHaveProperty('totalClasses');
      expect(response.body.data).toHaveProperty('activeClasses');
      expect(response.body.data).toHaveProperty('recentAdmissions');
      
      expect(response.body.data.totalStudents).toBe(2);
      expect(response.body.data.totalTeachers).toBe(2);
      expect(response.body.data.totalClasses).toBe(2);
      expect(response.body.data.activeClasses).toBe(2);
      expect(response.body.data.recentAdmissions).toBe(2);
    });

    it('should fail without authentication', async () => {
      const response = await request(app)
        .get('/api/v1/schools/stats');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('UNAUTHORIZED');
    });

    it('should fail without admin role', async () => {
      // Create a teacher user
      const bcrypt = require('bcryptjs');
      const passwordHash = await bcrypt.hash('password123', 12);
      
      const teacher = await testPrisma.user.create({
        data: {
          schoolId: testSchool.id,
          email: 'teacher@school.com',
          passwordHash,
          role: 'subject_teacher',
          firstName: 'Teacher',
          lastName: 'User',
          emailVerified: true,
        },
      });

      const teacherToken = generateTestToken({
        userId: teacher.id,
        schoolId: testSchool.id,
        role: 'subject_teacher',
        email: teacher.email
      });

      const response = await request(app)
        .get('/api/v1/schools/stats')
        .set('Authorization', `Bearer ${teacherToken}`);

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('FORBIDDEN');
    });
  });
});
