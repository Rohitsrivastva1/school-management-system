import request from 'supertest';
import app from '../../src/index';
import { testPrisma, testData, createTestSchool, createTestAdmin, createTestTeacher, createTestClass, createTestSubject, generateTestToken } from '../setup';

describe('Class Management APIs', () => {
  let testSchool: any;
  let testAdmin: any;
  let testTeacher: any;
  let testClass: any;
  let testSubject: any;
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
    testSubject = await createTestSubject(testSchool.id);
    
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
      role: 'class_teacher',
      email: testTeacher.email
    });
  });

  describe('POST /api/v1/classes', () => {
    it('should create class successfully', async () => {
      const classData = {
        name: 'Class 7',
        section: 'B',
        academicYear: '2024-25',
        classTeacherId: testTeacher.id,
        maxStudents: 35,
        roomNumber: 'Room 703'
      };

      const response = await request(app)
        .post('/api/v1/classes')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(classData);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.name).toBe(classData.name);
      expect(response.body.data.section).toBe(classData.section);
      expect(response.body.data.academicYear).toBe(classData.academicYear);
      expect(response.body.data.classTeacherId).toBe(classData.classTeacherId);
      expect(response.body.data.maxStudents).toBe(classData.maxStudents);
      expect(response.body.data.roomNumber).toBe(classData.roomNumber);
      expect(response.body.message).toBe('Class created successfully');
    });

    it('should create class without class teacher', async () => {
      const classData = {
        name: 'Class 8',
        section: 'A',
        academicYear: '2024-25',
        maxStudents: 40,
        roomNumber: 'Room 804'
      };

      const response = await request(app)
        .post('/api/v1/classes')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(classData);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe(classData.name);
      expect(response.body.data.classTeacherId).toBeNull();
    });

    it('should fail with duplicate class name and section', async () => {
      const classData = {
        name: testClass.name, // Same as existing
        section: testClass.section, // Same as existing
        academicYear: testClass.academicYear, // Same as existing
        maxStudents: 40
      };

      const response = await request(app)
        .post('/api/v1/classes')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(classData);

      expect(response.status).toBe(409);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('CONFLICT');
    });

    it('should fail with invalid class teacher', async () => {
      const classData = {
        name: 'Class 9',
        section: 'A',
        academicYear: '2024-25',
        classTeacherId: 'invalid-teacher-id',
        maxStudents: 40
      };

      const response = await request(app)
        .post('/api/v1/classes')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(classData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('BAD_REQUEST');
    });

    it('should fail with invalid academic year format', async () => {
      const classData = {
        name: 'Class 10',
        section: 'A',
        academicYear: '2024', // Invalid format
        maxStudents: 40
      };

      const response = await request(app)
        .post('/api/v1/classes')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(classData);

      expect(response.status).toBe(422);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('VALIDATION_ERROR');
    });

    it('should work with class teacher role', async () => {
      const classData = {
        name: 'Class 11',
        section: 'A',
        academicYear: '2024-25',
        maxStudents: 40
      };

      const response = await request(app)
        .post('/api/v1/classes')
        .set('Authorization', `Bearer ${teacherToken}`)
        .send(classData);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
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
        .post('/api/v1/classes')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          name: 'Class 12',
          section: 'A',
          academicYear: '2024-25',
          maxStudents: 40
        });

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('FORBIDDEN');
    });
  });

  describe('GET /api/v1/classes', () => {
    beforeEach(async () => {
      // Create additional test classes
      await testPrisma.class.createMany({
        data: [
          {
            schoolId: testSchool.id,
            name: 'Class 6',
            section: 'A',
            academicYear: '2024-25',
            maxStudents: 40,
            roomNumber: 'Room 601',
          },
          {
            schoolId: testSchool.id,
            name: 'Class 7',
            section: 'A',
            academicYear: '2024-25',
            maxStudents: 40,
            roomNumber: 'Room 701',
          },
          {
            schoolId: testSchool.id,
            name: 'Class 5',
            section: 'B',
            academicYear: '2024-25',
            maxStudents: 40,
            roomNumber: 'Room 502',
          },
        ]
      });
    });

    it('should get classes list successfully', async () => {
      const response = await request(app)
        .get('/api/v1/classes')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.data.length).toBe(4); // Including the one created in beforeEach
      expect(response.body.pagination).toHaveProperty('page');
      expect(response.body.pagination).toHaveProperty('limit');
      expect(response.body.pagination).toHaveProperty('total');
      expect(response.body.pagination).toHaveProperty('totalPages');
    });

    it('should filter classes by academic year', async () => {
      const response = await request(app)
        .get('/api/v1/classes?academicYear=2024-25')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.data.length).toBe(4);
    });

    it('should filter classes by active status', async () => {
      const response = await request(app)
        .get('/api/v1/classes?isActive=true')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
    });

    it('should work with pagination', async () => {
      const response = await request(app)
        .get('/api/v1/classes?page=1&limit=2')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.pagination.page).toBe(1);
      expect(response.body.pagination.limit).toBe(2);
      expect(response.body.data.length).toBeLessThanOrEqual(2);
    });

    it('should work with class teacher role', async () => {
      const response = await request(app)
        .get('/api/v1/classes')
        .set('Authorization', `Bearer ${teacherToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
    });
  });

  describe('GET /api/v1/classes/stats', () => {
    beforeEach(async () => {
      // Create additional test data for statistics
      await testPrisma.class.createMany({
        data: [
          {
            schoolId: testSchool.id,
            name: 'Class 6',
            section: 'A',
            academicYear: '2024-25',
            classTeacherId: testTeacher.id,
            maxStudents: 40,
            roomNumber: 'Room 601',
          },
          {
            schoolId: testSchool.id,
            name: 'Class 7',
            section: 'A',
            academicYear: '2024-25',
            maxStudents: 40,
            roomNumber: 'Room 701',
          },
        ]
      });

      // Create students for the classes
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

      const class6 = await testPrisma.class.findFirst({
        where: { name: 'Class 6', schoolId: testSchool.id }
      });

      await testPrisma.student.createMany({
        data: [
          {
            userId: student1.id,
            classId: class6!.id,
            rollNumber: '001',
            admissionDate: new Date('2024-01-15'),
          },
          {
            userId: student2.id,
            classId: class6!.id,
            rollNumber: '002',
            admissionDate: new Date('2024-01-20'),
          },
        ]
      });
    });

    it('should get class statistics successfully', async () => {
      const response = await request(app)
        .get('/api/v1/classes/stats')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('totalClasses');
      expect(response.body.data).toHaveProperty('activeClasses');
      expect(response.body.data).toHaveProperty('totalStudents');
      expect(response.body.data).toHaveProperty('classesWithTeachers');
      expect(response.body.data).toHaveProperty('averageClassSize');
      expect(response.body.data).toHaveProperty('academicYear');
      
      expect(response.body.data.totalClasses).toBe(3);
      expect(response.body.data.activeClasses).toBe(3);
      expect(response.body.data.totalStudents).toBe(2);
      expect(response.body.data.classesWithTeachers).toBe(2);
      expect(response.body.data.academicYear).toBe('All');
    });

    it('should filter statistics by academic year', async () => {
      const response = await request(app)
        .get('/api/v1/classes/stats?academicYear=2024-25')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.academicYear).toBe('2024-25');
    });

    it('should fail without admin role', async () => {
      const response = await request(app)
        .get('/api/v1/classes/stats')
        .set('Authorization', `Bearer ${teacherToken}`);

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('FORBIDDEN');
    });
  });

  describe('GET /api/v1/classes/:classId', () => {
    beforeEach(async () => {
      // Create students for the test class
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
          },
          {
            userId: student2.id,
            classId: testClass.id,
            rollNumber: '002',
            admissionDate: new Date('2024-01-20'),
            fatherName: 'Father Two',
            motherName: 'Mother Two',
          },
        ]
      });

      // Create timetable entries
      await testPrisma.timetable.createMany({
        data: [
          {
            schoolId: testSchool.id,
            classId: testClass.id,
            subjectId: testSubject.id,
            teacherId: testTeacher.id,
            dayOfWeek: 1, // Monday
            periodNumber: 1,
            startTime: '09:00',
            endTime: '09:45',
            roomNumber: 'Room 501',
            academicYear: '2024-25',
          },
          {
            schoolId: testSchool.id,
            classId: testClass.id,
            subjectId: testSubject.id,
            teacherId: testTeacher.id,
            dayOfWeek: 1, // Monday
            periodNumber: 2,
            startTime: '09:45',
            endTime: '10:30',
            roomNumber: 'Room 501',
            academicYear: '2024-25',
          },
        ]
      });
    });

    it('should get class details successfully', async () => {
      const response = await request(app)
        .get(`/api/v1/classes/${testClass.id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data).toHaveProperty('name');
      expect(response.body.data).toHaveProperty('section');
      expect(response.body.data).toHaveProperty('academicYear');
      expect(response.body.data).toHaveProperty('students');
      expect(response.body.data).toHaveProperty('timetable');
      expect(response.body.data.students).toBeInstanceOf(Array);
      expect(response.body.data.students.length).toBe(2);
      expect(response.body.data.timetable).toBeInstanceOf(Array);
      expect(response.body.data.timetable.length).toBe(2);
    });

    it('should fail with invalid class ID', async () => {
      const response = await request(app)
        .get('/api/v1/classes/invalid-id')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(422);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('VALIDATION_ERROR');
    });

    it('should fail with non-existent class', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      const response = await request(app)
        .get(`/api/v1/classes/${fakeId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('NOT_FOUND');
    });

    it('should work with class teacher role', async () => {
      const response = await request(app)
        .get(`/api/v1/classes/${testClass.id}`)
        .set('Authorization', `Bearer ${teacherToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });

  describe('PUT /api/v1/classes/:classId', () => {
    it('should update class successfully', async () => {
      const updateData = {
        name: 'Updated Class 5',
        section: 'B',
        classTeacherId: testTeacher.id,
        maxStudents: 35,
        roomNumber: 'Room 503',
        isActive: true
      };

      const response = await request(app)
        .put(`/api/v1/classes/${testClass.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe(updateData.name);
      expect(response.body.data.section).toBe(updateData.section);
      expect(response.body.data.classTeacherId).toBe(updateData.classTeacherId);
      expect(response.body.data.maxStudents).toBe(updateData.maxStudents);
      expect(response.body.data.roomNumber).toBe(updateData.roomNumber);
      expect(response.body.data.isActive).toBe(updateData.isActive);
      expect(response.body.message).toBe('Class updated successfully');
    });

    it('should fail with invalid class teacher', async () => {
      const response = await request(app)
        .put(`/api/v1/classes/${testClass.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          classTeacherId: 'invalid-teacher-id'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('BAD_REQUEST');
    });

    it('should fail with invalid class ID', async () => {
      const response = await request(app)
        .put('/api/v1/classes/invalid-id')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Updated Class'
        });

      expect(response.status).toBe(422);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('VALIDATION_ERROR');
    });

    it('should work with class teacher role', async () => {
      const response = await request(app)
        .put(`/api/v1/classes/${testClass.id}`)
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({
          name: 'Updated Class 5',
          maxStudents: 35
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });

  describe('DELETE /api/v1/classes/:classId', () => {
    it('should deactivate class successfully', async () => {
      const response = await request(app)
        .delete(`/api/v1/classes/${testClass.id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Class deactivated successfully');

      // Verify class is deactivated
      const updatedClass = await testPrisma.class.findUnique({
        where: { id: testClass.id }
      });
      expect(updatedClass?.isActive).toBe(false);
    });

    it('should fail if class has students', async () => {
      // Create a student for the class
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

      await testPrisma.student.create({
        data: {
          userId: student.id,
          classId: testClass.id,
          rollNumber: '001',
          admissionDate: new Date('2024-01-15'),
        },
      });

      const response = await request(app)
        .delete(`/api/v1/classes/${testClass.id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('BAD_REQUEST');
      expect(response.body.message).toContain('Cannot delete class with existing students');
    });

    it('should fail with invalid class ID', async () => {
      const response = await request(app)
        .delete('/api/v1/classes/invalid-id')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(422);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('VALIDATION_ERROR');
    });

    it('should fail with non-existent class', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      const response = await request(app)
        .delete(`/api/v1/classes/${fakeId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('NOT_FOUND');
    });

    it('should fail without admin role', async () => {
      const response = await request(app)
        .delete(`/api/v1/classes/${testClass.id}`)
        .set('Authorization', `Bearer ${teacherToken}`);

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('FORBIDDEN');
    });
  });
});
