import request from 'supertest';
import app from '../../src/index';
import { testPrisma, testData, createTestSchool, createTestAdmin, createTestTeacher, createTestClass, generateTestToken } from '../setup';

describe('User Management APIs', () => {
  let testSchool: any;
  let testAdmin: any;
  let testTeacher: any;
  let testClass: any;
  let adminToken: string;
  let teacherToken: string;

  beforeEach(async () => {
    // Clean up before each test
    await testPrisma.user.deleteMany();
    await testPrisma.school.deleteMany();
    
    // Create test data
    testSchool = await createTestSchool();
    testAdmin = await createTestAdmin(testSchool.id);
    const teacherData = await createTestTeacher(testSchool.id);
    testTeacher = teacherData.user;
    testClass = await createTestClass(testSchool.id);
    
    // Get auth tokens
    adminToken = generateTestToken({
      userId: testAdmin.id,
      schoolId: testSchool.id,
      role: 'admin',
      email: testAdmin.email
    });

    teacherToken = generateTestToken({
      userId: testTeacher.id,
      schoolId: testSchool.id,
      role: 'subject_teacher',
      email: testTeacher.email
    });
  });

  describe('POST /api/v1/users/teachers', () => {
    it('should create teacher successfully', async () => {
      const teacherData = {
        email: 'newteacher@school.com',
        firstName: 'New',
        lastName: 'Teacher',
        phone: '+91-9876543210',
        employeeId: 'EMP003',
        qualification: 'B.Ed',
        subjects: ['Chemistry', 'Biology'],
        joiningDate: '2024-02-01',
        salary: 50000,
        department: 'Science',
        experienceYears: 5
      };

      const response = await request(app)
        .post('/api/v1/users/teachers')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(teacherData);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.email).toBe(teacherData.email);
      expect(response.body.data.firstName).toBe(teacherData.firstName);
      expect(response.body.data.lastName).toBe(teacherData.lastName);
      expect(response.body.data.role).toBe('subject_teacher');
      expect(response.body.data.employeeId).toBe(teacherData.employeeId);
      expect(response.body.data.subjects).toEqual(teacherData.subjects);
      expect(response.body.message).toBe('Teacher created successfully. Temporary password sent to email.');
    });

    it('should fail with invalid email', async () => {
      const response = await request(app)
        .post('/api/v1/users/teachers')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          email: 'invalid-email',
          firstName: 'Teacher',
          lastName: 'User',
          employeeId: 'EMP004',
          subjects: ['Mathematics'],
          joiningDate: '2024-02-01'
        });

      expect(response.status).toBe(422);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('VALIDATION_ERROR');
    });

    it('should fail with duplicate email', async () => {
      const response = await request(app)
        .post('/api/v1/users/teachers')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          email: testTeacher.email, // Already exists
          firstName: 'Teacher',
          lastName: 'User',
          employeeId: 'EMP005',
          subjects: ['Mathematics'],
          joiningDate: '2024-02-01'
        });

      expect(response.status).toBe(409);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('CONFLICT');
    });

    it('should fail without admin role', async () => {
      const response = await request(app)
        .post('/api/v1/users/teachers')
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({
          email: 'teacher@school.com',
          firstName: 'Teacher',
          lastName: 'User',
          employeeId: 'EMP006',
          subjects: ['Mathematics'],
          joiningDate: '2024-02-01'
        });

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('FORBIDDEN');
    });

    it('should fail without authentication', async () => {
      const response = await request(app)
        .post('/api/v1/users/teachers')
        .send({
          email: 'teacher@school.com',
          firstName: 'Teacher',
          lastName: 'User',
          employeeId: 'EMP007',
          subjects: ['Mathematics'],
          joiningDate: '2024-02-01'
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('UNAUTHORIZED');
    });
  });

  describe('GET /api/v1/users/teachers', () => {
    it('should get teachers list successfully', async () => {
      const response = await request(app)
        .get('/api/v1/users/teachers')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.data.length).toBeGreaterThan(0);
      expect(response.body.pagination).toHaveProperty('page');
      expect(response.body.pagination).toHaveProperty('limit');
      expect(response.body.pagination).toHaveProperty('total');
      expect(response.body.pagination).toHaveProperty('totalPages');
    });

    it('should get teachers with pagination', async () => {
      const response = await request(app)
        .get('/api/v1/users/teachers?page=1&limit=5')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.pagination.page).toBe(1);
      expect(response.body.pagination.limit).toBe(5);
    });

    it('should search teachers by name', async () => {
      const response = await request(app)
        .get('/api/v1/users/teachers?search=John')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
    });

    it('should filter teachers by active status', async () => {
      const response = await request(app)
        .get('/api/v1/users/teachers?isActive=true')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
    });

    it('should fail without admin role', async () => {
      const response = await request(app)
        .get('/api/v1/users/teachers')
        .set('Authorization', `Bearer ${teacherToken}`);

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('FORBIDDEN');
    });
  });

  describe('POST /api/v1/users/students/bulk', () => {
    it('should create student successfully', async () => {
      const response = await request(app)
        .post('/api/v1/users/students/bulk')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          classId: testClass.id
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data).toHaveProperty('rollNumber');
      expect(response.body.data).toHaveProperty('firstName');
      expect(response.body.data).toHaveProperty('lastName');
      expect(response.body.data).toHaveProperty('classId');
      expect(response.body.message).toBe('Student created successfully');
    });

    it('should fail with invalid class ID', async () => {
      const response = await request(app)
        .post('/api/v1/users/students/bulk')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          classId: 'invalid-class-id'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('BAD_REQUEST');
    });

    it('should fail without admin or class teacher role', async () => {
      // Create a student user
      const bcrypt = require('bcryptjs');
      const passwordHash = await bcrypt.hash('password123', 12);
      
      const student = await testPrisma.user.create({
        data: {
          schoolId: testSchool.id,
          email: 'student@school.com',
          passwordHash,
          role: 'student',
          firstName: 'Student',
          lastName: 'User',
          emailVerified: true,
        },
      });

      const studentToken = generateTestToken({
        userId: student.id,
        schoolId: testSchool.id,
        role: 'student',
        email: student.email
      });

      const response = await request(app)
        .post('/api/v1/users/students/bulk')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          classId: testClass.id
        });

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('FORBIDDEN');
    });
  });

  describe('GET /api/v1/users/students', () => {
    beforeEach(async () => {
      // Create test students
      const bcrypt = require('bcryptjs');
      const passwordHash = await bcrypt.hash('password123', 12);
      
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

      await testPrisma.student.createMany({
        data: [
          {
            userId: student1.id,
            classId: testClass.id,
            rollNumber: '001',
            admissionDate: new Date('2024-01-15'),
            fatherName: 'Father One',
            motherName: 'Mother One',
            fatherPhone: '+91-9876543210',
            motherPhone: '+91-9876543211',
          },
          {
            userId: student2.id,
            classId: testClass.id,
            rollNumber: '002',
            admissionDate: new Date('2024-01-20'),
            fatherName: 'Father Two',
            motherName: 'Mother Two',
            fatherPhone: '+91-9876543212',
            motherPhone: '+91-9876543213',
          },
        ]
      });
    });

    it('should get students list successfully', async () => {
      const response = await request(app)
        .get('/api/v1/users/students')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.data.length).toBe(2);
      expect(response.body.pagination).toHaveProperty('page');
      expect(response.body.pagination).toHaveProperty('limit');
      expect(response.body.pagination).toHaveProperty('total');
      expect(response.body.pagination).toHaveProperty('totalPages');
    });

    it('should filter students by class', async () => {
      const response = await request(app)
        .get(`/api/v1/users/students?classId=${testClass.id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.data.length).toBe(2);
    });

    it('should search students by roll number', async () => {
      const response = await request(app)
        .get('/api/v1/users/students?search=001')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.data.length).toBe(1);
      expect(response.body.data[0].rollNumber).toBe('001');
    });

    it('should filter students by active status', async () => {
      const response = await request(app)
        .get('/api/v1/users/students?isActive=true')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
    });

    it('should work with class teacher role', async () => {
      const response = await request(app)
        .get('/api/v1/users/students')
        .set('Authorization', `Bearer ${teacherToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
    });

    it('should fail without proper role', async () => {
      // Create a student user
      const bcrypt = require('bcryptjs');
      const passwordHash = await bcrypt.hash('password123', 12);
      
      const student = await testPrisma.user.create({
        data: {
          schoolId: testSchool.id,
          email: 'student@school.com',
          passwordHash,
          role: 'student',
          firstName: 'Student',
          lastName: 'User',
          emailVerified: true,
        },
      });

      const studentToken = generateTestToken({
        userId: student.id,
        schoolId: testSchool.id,
        role: 'student',
        email: student.email
      });

      const response = await request(app)
        .get('/api/v1/users/students')
        .set('Authorization', `Bearer ${studentToken}`);

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('FORBIDDEN');
    });
  });

  describe('PUT /api/v1/users/:userId', () => {
    it('should update user successfully', async () => {
      const updateData = {
        firstName: 'Updated',
        lastName: 'Teacher',
        phone: '+91-9876543210',
        isActive: true
      };

      const response = await request(app)
        .put(`/api/v1/users/${testTeacher.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.firstName).toBe(updateData.firstName);
      expect(response.body.data.lastName).toBe(updateData.lastName);
      expect(response.body.data.phone).toBe(updateData.phone);
      expect(response.body.data.isActive).toBe(updateData.isActive);
      expect(response.body.message).toBe('User updated successfully');
    });

    it('should fail with invalid user ID', async () => {
      const response = await request(app)
        .put('/api/v1/users/invalid-id')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          firstName: 'Updated'
        });

      expect(response.status).toBe(422);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('VALIDATION_ERROR');
    });

    it('should fail with non-existent user', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      const response = await request(app)
        .put(`/api/v1/users/${fakeId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          firstName: 'Updated'
        });

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('NOT_FOUND');
    });

    it('should fail without admin role', async () => {
      const response = await request(app)
        .put(`/api/v1/users/${testTeacher.id}`)
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({
          firstName: 'Updated'
        });

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('FORBIDDEN');
    });
  });

  describe('DELETE /api/v1/users/:userId', () => {
    it('should deactivate user successfully', async () => {
      const response = await request(app)
        .delete(`/api/v1/users/${testTeacher.id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('User deactivated successfully');

      // Verify user is deactivated
      const updatedUser = await testPrisma.user.findUnique({
        where: { id: testTeacher.id }
      });
      expect(updatedUser?.isActive).toBe(false);
    });

    it('should fail with invalid user ID', async () => {
      const response = await request(app)
        .delete('/api/v1/users/invalid-id')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(422);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('VALIDATION_ERROR');
    });

    it('should fail with non-existent user', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      const response = await request(app)
        .delete(`/api/v1/users/${fakeId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('NOT_FOUND');
    });

    it('should fail without admin role', async () => {
      const response = await request(app)
        .delete(`/api/v1/users/${testTeacher.id}`)
        .set('Authorization', `Bearer ${teacherToken}`);

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('FORBIDDEN');
    });
  });
});
