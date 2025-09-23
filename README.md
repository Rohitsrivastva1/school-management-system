# 🏫 School Management System

A comprehensive, multi-tenant school management system built with modern web technologies. This system supports multiple schools with role-based access control for administrators, teachers, parents, and students.

## 🚀 Features

### 🏢 Multi-Tenant Architecture
- Support for multiple schools in a single system
- School-specific data isolation
- Scalable architecture supporting 1000+ users

### 👥 Role-Based Access Control
- **Admin**: Complete school management
- **Class Teacher**: Class coordination and student management
- **Subject Teacher**: Subject-specific teaching and grading
- **Parent**: Student information and communication
- **Student**: Personal academic information

### 📚 Core Functionality
- **School Registration & Management**
- **User Management** (Teachers, Students, Parents)
- **Class & Section Management**
- **Timetable Management**
- **Attendance Tracking**
- **Homework Management**
- **Grade Management**
- **Notification System**
- **Complaint Management**
- **Q&A Communication**

## 🛠️ Technology Stack

### Backend
- **Node.js** with **Express.js**
- **TypeScript** for type safety
- **PostgreSQL** database with **Prisma ORM**
- **JWT** authentication with refresh tokens
- **bcrypt** for password hashing
- **Jest** + **Supertest** for testing

### Frontend
- **Next.js 14** with App Router
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **Zustand** for state management
- **Axios** for API calls

### Security
- Password strength validation
- JWT token security
- CORS protection
- Input sanitization
- SQL injection prevention
- XSS protection
- Rate limiting

## 📁 Project Structure

```
schoolManagement/
├── backend/                 # Express.js API server
│   ├── src/
│   │   ├── controllers/     # API route handlers
│   │   ├── middleware/      # Authentication, validation, error handling
│   │   ├── routes/          # API routes
│   │   ├── utils/           # Utility functions
│   │   └── types/           # TypeScript type definitions
│   ├── prisma/              # Database schema and migrations
│   ├── tests/               # Comprehensive test suite
│   └── package.json
├── frontend/                # Next.js web application
│   ├── src/
│   │   ├── app/             # Next.js app router pages
│   │   ├── components/      # Reusable UI components
│   │   ├── lib/             # Utility functions
│   │   ├── stores/          # Zustand state management
│   │   └── types/           # TypeScript type definitions
│   └── package.json
├── docs/                    # Documentation
└── README.md
```

## 🚀 Quick Start

### Prerequisites
- Node.js (v18 or higher)
- PostgreSQL (v13 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd schoolManagement
```

2. **Install dependencies**
```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

3. **Set up the database**
```bash
# Install PostgreSQL (Ubuntu/Debian)
sudo apt update
sudo apt install postgresql postgresql-contrib

# Create databases
sudo -u postgres psql -c "CREATE DATABASE school_management;"
sudo -u postgres psql -c "CREATE DATABASE school_management_test;"

# Create users
sudo -u postgres psql -c "CREATE USER school_admin WITH PASSWORD 'secure_password';"
sudo -u postgres psql -c "CREATE USER test_user WITH PASSWORD 'test_password';"

# Grant privileges
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE school_management TO school_admin;"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE school_management_test TO test_user;"
```

4. **Configure environment variables**
```bash
# Backend
cd backend
cp env.example .env
# Edit .env with your database credentials

# Test environment
cp env.example env.test
# Edit env.test with test database credentials
```

5. **Run database migrations**
```bash
cd backend
npx prisma generate
npx prisma migrate dev --name init
```

6. **Start the applications**
```bash
# Backend (Terminal 1)
cd backend
npm run dev

# Frontend (Terminal 2)
cd frontend
npm run dev
```

## 🧪 Testing

### Run All Tests
```bash
cd backend
npm test
```

### Run Specific Test Suites
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

### Test Coverage
```bash
npm run test:coverage
```

## 📚 API Documentation

### Authentication Endpoints
- `POST /api/v1/auth/school/register` - School registration
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/refresh` - Refresh token
- `POST /api/v1/auth/logout` - User logout
- `GET /api/v1/auth/profile` - Get user profile
- `PUT /api/v1/auth/profile` - Update user profile

### School Management
- `GET /api/v1/schools/:id` - Get school details
- `PUT /api/v1/schools/:id/profile` - Update school profile
- `GET /api/v1/schools/stats` - Get school statistics

### User Management
- `POST /api/v1/users` - Create user
- `GET /api/v1/users` - Get users list
- `GET /api/v1/users/:id` - Get user details
- `PUT /api/v1/users/:id` - Update user
- `DELETE /api/v1/users/:id` - Deactivate user

### Class Management
- `POST /api/v1/classes` - Create class
- `GET /api/v1/classes` - Get classes list
- `GET /api/v1/classes/:id` - Get class details
- `PUT /api/v1/classes/:id` - Update class
- `DELETE /api/v1/classes/:id` - Deactivate class

## 🔧 Development

### Backend Development
```bash
cd backend
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run test         # Run tests
npm run test:watch   # Run tests in watch mode
```

### Frontend Development
```bash
cd frontend
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

## 📊 Database Schema

The system uses PostgreSQL with the following main entities:
- **Schools**: School information and settings
- **Users**: All user types (admin, teacher, parent, student)
- **Classes**: Class and section management
- **Students**: Student-specific information
- **Teachers**: Teacher-specific information
- **Subjects**: Subject management
- **Timetable**: Class schedules
- **Attendance**: Student attendance tracking
- **Homework**: Assignment management
- **Grades**: Academic performance tracking
- **Notifications**: Communication system
- **Complaints**: Issue management
- **Q&A**: Parent-teacher communication

## 🚀 Deployment

### Production Setup
1. Set up PostgreSQL database
2. Configure environment variables
3. Run database migrations
4. Build and start the applications
5. Set up reverse proxy (nginx)
6. Configure SSL certificates

### Docker Deployment
```bash
# Build and run with Docker Compose
docker-compose up -d
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the documentation in the `docs/` folder
- Review the API contract in `API_CONTRACT.md`

## 🎯 Roadmap

- [ ] Mobile application (React Native)
- [ ] Advanced reporting and analytics
- [ ] Integration with external systems
- [ ] Multi-language support
- [ ] Advanced notification system
- [ ] File upload and management
- [ ] Real-time communication features

---

**Built with ❤️ for modern education management**
