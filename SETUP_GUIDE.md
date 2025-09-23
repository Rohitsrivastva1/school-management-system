# 🚀 School Management System - Setup Guide

## 📋 Prerequisites
- Node.js (v18 or higher)
- PostgreSQL (v14 or higher)
- npm or yarn

## 🗄️ Database Setup

### 1. Install PostgreSQL
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install postgresql postgresql-contrib

# macOS (with Homebrew)
brew install postgresql
brew services start postgresql

# Windows
# Download from https://www.postgresql.org/download/windows/
```

### 2. Create Database
```bash
# Connect to PostgreSQL
sudo -u postgres psql

# Create database and user
CREATE DATABASE school_management;
CREATE USER school_admin WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE school_management TO school_admin;
\q
```

### 3. Update Environment Variables
```bash
# Backend .env file
DATABASE_URL="postgresql://school_admin:your_secure_password@localhost:5432/school_management"
```

## 🏗️ Backend Setup

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Generate Prisma Client
```bash
npm run db:generate
```

### 3. Push Database Schema
```bash
npm run db:push
```

### 4. Start Development Server
```bash
npm run dev
```

## 🎨 Frontend Setup

### 1. Install Dependencies
```bash
cd frontend
npm install
```

### 2. Start Development Server
```bash
npm run dev
```

## 🧪 Testing the System

### 1. Test School Registration
```bash
curl -X POST http://localhost:3001/api/v1/auth/school/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test School",
    "email": "admin@testschool.com",
    "password": "SecurePass123!",
    "address": "123 Test Street",
    "city": "Test City",
    "state": "Test State",
    "phone": "+91-9876543210"
  }'
```

### 2. Test User Login
```bash
curl -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@testschool.com",
    "password": "SecurePass123!"
  }'
```

## 🔧 Development Workflow

### 1. Database Changes
```bash
# After modifying schema.prisma
npm run db:generate
npm run db:push

# For production migrations
npm run db:migrate
```

### 2. API Development
- Add new endpoints in `src/routes/`
- Create controllers in `src/controllers/`
- Add validation in `src/middleware/validation.ts`

### 3. Frontend Development
- Add new pages in `src/app/`
- Create components in `src/components/`
- Update types in `src/types/`

## 🚀 Next Development Steps

### Phase 1: Core Features (Week 1-2)
1. ✅ Authentication system
2. 🔄 User management (teachers, students)
3. 🔄 Class management
4. 🔄 Basic dashboard

### Phase 2: Academic Features (Week 3-4)
1. Timetable management
2. Attendance system
3. Homework management
4. Grade management

### Phase 3: Communication (Week 5-6)
1. Notification system
2. Q&A system
3. Complaint management
4. Parent communication

### Phase 4: Advanced Features (Week 7-8)
1. Analytics dashboard
2. Report generation
3. File management
4. Mobile optimization

## 🐛 Troubleshooting

### Database Connection Issues
```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Restart PostgreSQL
sudo systemctl restart postgresql

# Check connection
psql -h localhost -U school_admin -d school_management
```

### Port Conflicts
```bash
# Check if ports are in use
lsof -i :3001  # Backend
lsof -i :3000  # Frontend

# Kill processes if needed
kill -9 <PID>
```

### Environment Variables
- Ensure `.env` file exists in backend directory
- Check all required variables are set
- Restart server after changing environment variables

## 📊 Monitoring

### Health Checks
- Backend: `http://localhost:3001/health`
- Frontend: `http://localhost:3000`

### Database Monitoring
```bash
# Open Prisma Studio
npm run db:studio
```

## 🔒 Security Checklist

- [ ] Change default database passwords
- [ ] Set strong JWT secrets
- [ ] Configure CORS properly
- [ ] Enable HTTPS in production
- [ ] Set up rate limiting
- [ ] Configure file upload limits

## 📈 Performance Optimization

### Database
- [ ] Add proper indexes
- [ ] Configure connection pooling
- [ ] Set up read replicas

### Application
- [ ] Implement caching (Redis)
- [ ] Optimize queries
- [ ] Add compression
- [ ] Set up CDN

## 🚀 Deployment Preparation

### Production Environment
- [ ] Set up production database
- [ ] Configure environment variables
- [ ] Set up SSL certificates
- [ ] Configure domain names
- [ ] Set up monitoring
- [ ] Configure backups

### Docker Setup
```bash
# Build and run with Docker
docker-compose up -d
```

---

## 🎯 Success Metrics

After setup, you should be able to:
- ✅ Register a new school
- ✅ Login with admin credentials
- ✅ Access the frontend dashboard
- ✅ View school profile
- ✅ Create and manage users

**Ready to continue development! 🚀**
