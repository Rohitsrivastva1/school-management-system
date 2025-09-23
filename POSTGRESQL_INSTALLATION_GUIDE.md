# 🐘 PostgreSQL Installation Guide

## 📋 **Step-by-Step Installation**

### **1. Update System Packages**
```bash
sudo apt update
sudo apt upgrade -y
```

### **2. Install PostgreSQL**
```bash
sudo apt install postgresql postgresql-contrib -y
```

### **3. Start and Enable PostgreSQL Service**
```bash
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### **4. Check PostgreSQL Status**
```bash
sudo systemctl status postgresql
```

### **5. Switch to PostgreSQL User**
```bash
sudo -u postgres psql
```

### **6. Create Database and User (Inside PostgreSQL)**
```sql
-- Create test database
CREATE DATABASE school_management_test;

-- Create test user
CREATE USER test_user WITH PASSWORD 'test_password';

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE school_management_test TO test_user;

-- Exit PostgreSQL
\q
```

### **7. Create Production Database**
```bash
sudo -u postgres psql -c "CREATE DATABASE school_management;"
sudo -u postgres psql -c "CREATE USER school_admin WITH PASSWORD 'secure_password';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE school_management TO school_admin;"
```

### **8. Test Connection**
```bash
# Test with test user
psql -h localhost -U test_user -d school_management_test

# Test with admin user
psql -h localhost -U school_admin -d school_management
```

## 🔧 **Configuration**

### **Update Environment Files**

#### **Backend Environment (.env)**
```bash
cd /home/rohit/Desktop/schoolManagement/backend
cp env.example .env
```

Edit `.env` file:
```env
DATABASE_URL=postgresql://school_admin:secure_password@localhost:5432/school_management
PORT=3001
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=1h
REFRESH_TOKEN_SECRET=your-super-secret-refresh-key-here
REFRESH_TOKEN_EXPIRES_IN=7d
NODE_ENV=development
```

#### **Test Environment (env.test)**
```bash
cd /home/rohit/Desktop/schoolManagement/backend
```

Edit `env.test` file:
```env
DATABASE_URL=postgresql://test_user:test_password@localhost:5432/school_management_test
JWT_SECRET=test-jwt-secret-key
REFRESH_TOKEN_SECRET=test-refresh-secret-key
NODE_ENV=test
```

## 🚀 **Run Database Migrations**

### **1. Navigate to Backend Directory**
```bash
cd /home/rohit/Desktop/schoolManagement/backend
```

### **2. Generate Prisma Client**
```bash
npx prisma generate
```

### **3. Run Database Migrations**
```bash
npx prisma migrate dev --name init
```

### **4. Verify Database Schema**
```bash
npx prisma studio
```

## 🧪 **Run Tests**

### **1. Run All Tests**
```bash
npm test
```

### **2. Run Specific Test Suites**
```bash
# Authentication tests
npm test -- tests/auth/auth.test.ts

# School management tests
npm test -- tests/school/school.test.ts

# User management tests
npm test -- tests/users/users.test.ts

# Class management tests
npm test -- tests/classes/classes.test.ts
```

### **3. Run Tests with Coverage**
```bash
npm run test:coverage
```

## 🔍 **Troubleshooting**

### **Common Issues**

#### **1. PostgreSQL Not Starting**
```bash
# Check status
sudo systemctl status postgresql

# Restart service
sudo systemctl restart postgresql

# Check logs
sudo journalctl -u postgresql
```

#### **2. Connection Refused**
```bash
# Check if PostgreSQL is listening
sudo netstat -tlnp | grep 5432

# Check PostgreSQL configuration
sudo -u postgres psql -c "SHOW listen_addresses;"
```

#### **3. Permission Denied**
```bash
# Check PostgreSQL user permissions
sudo -u postgres psql -c "\du"

# Reset user password
sudo -u postgres psql -c "ALTER USER test_user PASSWORD 'new_password';"
```

#### **4. Database Already Exists**
```bash
# Drop and recreate database
sudo -u postgres psql -c "DROP DATABASE IF EXISTS school_management_test;"
sudo -u postgres psql -c "CREATE DATABASE school_management_test;"
```

## 📊 **Expected Results**

### **After Installation**
- ✅ PostgreSQL service running on port 5432
- ✅ Two databases created: `school_management` and `school_management_test`
- ✅ Two users created: `school_admin` and `test_user`
- ✅ All privileges granted correctly

### **After Migrations**
- ✅ All tables created in database
- ✅ Prisma client generated
- ✅ Database schema ready for testing

### **After Running Tests**
- ✅ **104/104 tests passing**
- ✅ **Authentication flow working**
- ✅ **CRUD operations tested**
- ✅ **Authorization working**

## 🎯 **Quick Commands Summary**

```bash
# Install PostgreSQL
sudo apt update && sudo apt install postgresql postgresql-contrib -y

# Start service
sudo systemctl start postgresql && sudo systemctl enable postgresql

# Create databases and users
sudo -u postgres psql -c "CREATE DATABASE school_management_test;"
sudo -u postgres psql -c "CREATE USER test_user WITH PASSWORD 'test_password';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE school_management_test TO test_user;"

# Run migrations
cd /home/rohit/Desktop/schoolManagement/backend
npx prisma generate
npx prisma migrate dev --name init

# Run tests
npm test
```

## 🏆 **Success Indicators**

When everything is working correctly, you should see:

1. **PostgreSQL Status**: `Active (running)`
2. **Database Connection**: Successful connection to both databases
3. **Prisma Migrations**: All tables created successfully
4. **Test Results**: `104/104 tests passing`

---

**Follow these steps and your PostgreSQL database will be ready for the school management system! 🚀**
