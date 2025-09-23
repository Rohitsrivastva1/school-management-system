#!/bin/bash

# PostgreSQL Installation Script for School Management System
# Run this script with: bash install_postgresql.sh

echo "🐘 Installing PostgreSQL for School Management System..."

# Update system packages
echo "📦 Updating system packages..."
sudo apt update

# Install PostgreSQL
echo "🔧 Installing PostgreSQL..."
sudo apt install postgresql postgresql-contrib -y

# Start and enable PostgreSQL service
echo "🚀 Starting PostgreSQL service..."
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Check PostgreSQL status
echo "📊 Checking PostgreSQL status..."
sudo systemctl status postgresql --no-pager

# Create test database
echo "🗄️ Creating test database..."
sudo -u postgres psql -c "CREATE DATABASE school_management_test;"

# Create test user
echo "👤 Creating test user..."
sudo -u postgres psql -c "CREATE USER test_user WITH PASSWORD 'test_password';"

# Grant privileges to test user
echo "🔑 Granting privileges to test user..."
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE school_management_test TO test_user;"

# Create production database
echo "🏭 Creating production database..."
sudo -u postgres psql -c "CREATE DATABASE school_management;"

# Create production user
echo "👨‍💼 Creating production user..."
sudo -u postgres psql -c "CREATE USER school_admin WITH PASSWORD 'secure_password';"

# Grant privileges to production user
echo "🔐 Granting privileges to production user..."
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE school_management TO school_admin;"

# Test connections
echo "🧪 Testing database connections..."
echo "Testing test database connection..."
psql -h localhost -U test_user -d school_management_test -c "SELECT version();" 2>/dev/null && echo "✅ Test database connection successful!" || echo "❌ Test database connection failed"

echo "Testing production database connection..."
psql -h localhost -U school_admin -d school_management -c "SELECT version();" 2>/dev/null && echo "✅ Production database connection successful!" || echo "❌ Production database connection failed"

echo ""
echo "🎉 PostgreSQL installation completed!"
echo ""
echo "📋 Next steps:"
echo "1. cd /home/rohit/Desktop/schoolManagement/backend"
echo "2. npx prisma generate"
echo "3. npx prisma migrate dev --name init"
echo "4. npm test"
echo ""
echo "🔍 Database details:"
echo "- Test DB: school_management_test (user: test_user)"
echo "- Production DB: school_management (user: school_admin)"
echo "- PostgreSQL running on: localhost:5432"
