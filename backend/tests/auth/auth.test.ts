import request from 'supertest';
import app from '../../src/index';
import { testPrisma, testData, createTestSchool, createTestAdmin, generateTestToken } from '../setup';

describe('Authentication APIs', () => {
  let testSchool: any;
  let testAdmin: any;
  let authToken: string;

  beforeEach(async () => {
    // Clean up before each test
    await testPrisma.user.deleteMany();
    await testPrisma.school.deleteMany();
  });

  describe('POST /api/v1/auth/school/register', () => {
    it('should register a new school successfully', async () => {
      const response = await request(app)
        .post('/api/v1/auth/school/register')
        .send({
          name: 'New Test School',
          email: 'newtest@school.com',
          password: 'SecurePass123!',
          address: '456 New Street',
          city: 'New City',
          state: 'New State',
          pincode: '654321',
          phone: '+91-9876543210',
          website: 'https://newschool.com'
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.school).toHaveProperty('id');
      expect(response.body.data.school.name).toBe('New Test School');
      expect(response.body.data.admin).toHaveProperty('id');
      expect(response.body.data.tokens).toHaveProperty('accessToken');
      expect(response.body.data.tokens).toHaveProperty('refreshToken');
    });

    it('should fail with weak password', async () => {
      const response = await request(app)
        .post('/api/v1/auth/school/register')
        .send({
          name: 'Test School',
          email: 'test@school.com',
          password: 'weak',
          address: '123 Test Street'
        });

      expect(response.status).toBe(422);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('VALIDATION_ERROR');
    });

    it('should fail with invalid email', async () => {
      const response = await request(app)
        .post('/api/v1/auth/school/register')
        .send({
          name: 'Test School',
          email: 'invalid-email',
          password: 'SecurePass123!'
        });

      expect(response.status).toBe(422);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('VALIDATION_ERROR');
    });

    it('should fail if school already exists', async () => {
      // First registration
      await request(app)
        .post('/api/v1/auth/school/register')
        .send({
          name: 'Test School',
          email: 'test@school.com',
          password: 'SecurePass123!'
        });

      // Second registration with same email
      const response = await request(app)
        .post('/api/v1/auth/school/register')
        .send({
          name: 'Another School',
          email: 'test@school.com',
          password: 'SecurePass123!'
        });

      expect(response.status).toBe(409);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('CONFLICT');
    });
  });

  describe('POST /api/v1/auth/login', () => {
    beforeEach(async () => {
      // Create test school and admin
      testSchool = await createTestSchool();
      testAdmin = await createTestAdmin(testSchool.id);
    });

    it('should login successfully with valid credentials', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: testData.admin.email,
          password: testData.admin.password
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.user).toHaveProperty('id');
      expect(response.body.data.user.email).toBe(testData.admin.email);
      expect(response.body.data.user.role).toBe('admin');
      expect(response.body.data.tokens).toHaveProperty('accessToken');
      expect(response.body.data.tokens).toHaveProperty('refreshToken');
      
      authToken = response.body.data.tokens.accessToken;
    });

    it('should fail with invalid email', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'nonexistent@school.com',
          password: testData.admin.password
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('UNAUTHORIZED');
    });

    it('should fail with invalid password', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: testData.admin.email,
          password: 'wrongpassword'
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('UNAUTHORIZED');
    });

    it('should fail with missing credentials', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({});

      expect(response.status).toBe(422);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('VALIDATION_ERROR');
    });
  });

  describe('POST /api/v1/auth/refresh', () => {
    beforeEach(async () => {
      testSchool = await createTestSchool();
      testAdmin = await createTestAdmin(testSchool.id);
      
      // Get initial tokens
      const loginResponse = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: testData.admin.email,
          password: testData.admin.password
        });
      
      authToken = loginResponse.body.data.tokens.accessToken;
    });

    it('should refresh token successfully', async () => {
      const response = await request(app)
        .post('/api/v1/auth/refresh')
        .send({
          refreshToken: generateTestToken({
            userId: testAdmin.id,
            schoolId: testSchool.id
          })
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('accessToken');
    });

    it('should fail with invalid refresh token', async () => {
      const response = await request(app)
        .post('/api/v1/auth/refresh')
        .send({
          refreshToken: 'invalid-token'
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('UNAUTHORIZED');
    });

    it('should fail with missing refresh token', async () => {
      const response = await request(app)
        .post('/api/v1/auth/refresh')
        .send({});

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('UNAUTHORIZED');
    });
  });

  describe('POST /api/v1/auth/logout', () => {
    beforeEach(async () => {
      testSchool = await createTestSchool();
      testAdmin = await createTestAdmin(testSchool.id);
      
      const loginResponse = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: testData.admin.email,
          password: testData.admin.password
        });
      
      authToken = loginResponse.body.data.tokens.accessToken;
    });

    it('should logout successfully', async () => {
      const response = await request(app)
        .post('/api/v1/auth/logout')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Logout successful');
    });

    it('should fail without authentication', async () => {
      const response = await request(app)
        .post('/api/v1/auth/logout');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('UNAUTHORIZED');
    });
  });

  describe('GET /api/v1/auth/profile', () => {
    beforeEach(async () => {
      testSchool = await createTestSchool();
      testAdmin = await createTestAdmin(testSchool.id);
      
      const loginResponse = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: testData.admin.email,
          password: testData.admin.password
        });
      
      authToken = loginResponse.body.data.tokens.accessToken;
    });

    it('should get user profile successfully', async () => {
      const response = await request(app)
        .get('/api/v1/auth/profile')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.email).toBe(testData.admin.email);
      expect(response.body.data.role).toBe('admin');
      expect(response.body.data.school).toHaveProperty('id');
    });

    it('should fail without authentication', async () => {
      const response = await request(app)
        .get('/api/v1/auth/profile');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('UNAUTHORIZED');
    });

    it('should fail with invalid token', async () => {
      const response = await request(app)
        .get('/api/v1/auth/profile')
        .set('Authorization', 'Bearer invalid-token');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('UNAUTHORIZED');
    });
  });

  describe('PUT /api/v1/auth/profile', () => {
    beforeEach(async () => {
      testSchool = await createTestSchool();
      testAdmin = await createTestAdmin(testSchool.id);
      
      const loginResponse = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: testData.admin.email,
          password: testData.admin.password
        });
      
      authToken = loginResponse.body.data.tokens.accessToken;
    });

    it('should update profile successfully', async () => {
      const response = await request(app)
        .put('/api/v1/auth/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          firstName: 'Updated Admin',
          lastName: 'Updated User',
          phone: '+91-9876543210'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.firstName).toBe('Updated Admin');
      expect(response.body.data.lastName).toBe('Updated User');
      expect(response.body.data.phone).toBe('+91-9876543210');
    });

    it('should fail without authentication', async () => {
      const response = await request(app)
        .put('/api/v1/auth/profile')
        .send({
          firstName: 'Updated Admin'
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('UNAUTHORIZED');
    });
  });

  describe('PUT /api/v1/auth/change-password', () => {
    beforeEach(async () => {
      testSchool = await createTestSchool();
      testAdmin = await createTestAdmin(testSchool.id);
      
      const loginResponse = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: testData.admin.email,
          password: testData.admin.password
        });
      
      authToken = loginResponse.body.data.tokens.accessToken;
    });

    it('should change password successfully', async () => {
      const response = await request(app)
        .put('/api/v1/auth/change-password')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          currentPassword: testData.admin.password,
          newPassword: 'NewSecurePass123!'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Password changed successfully');
    });

    it('should fail with wrong current password', async () => {
      const response = await request(app)
        .put('/api/v1/auth/change-password')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          currentPassword: 'wrongpassword',
          newPassword: 'NewSecurePass123!'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('BAD_REQUEST');
    });

    it('should fail with weak new password', async () => {
      const response = await request(app)
        .put('/api/v1/auth/change-password')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          currentPassword: testData.admin.password,
          newPassword: 'weak'
        });

      expect(response.status).toBe(422);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('VALIDATION_ERROR');
    });

    it('should fail without authentication', async () => {
      const response = await request(app)
        .put('/api/v1/auth/change-password')
        .send({
          currentPassword: testData.admin.password,
          newPassword: 'NewSecurePass123!'
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('UNAUTHORIZED');
    });
  });
});
