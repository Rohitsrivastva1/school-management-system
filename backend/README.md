# 🏫 School Management System - Backend API

A comprehensive backend API for school management system built with Express.js, TypeScript, and PostgreSQL.

## 🚀 Quick Start

### Prerequisites
- Node.js (v18 or higher)
- PostgreSQL (v14 or higher)
- npm or yarn

### Installation

1. **Clone and install dependencies**
```bash
cd backend
npm install
```

2. **Set up environment variables**
```bash
cp env.example .env
# Edit .env with your database credentials and other settings
```

3. **Set up database**
```bash
# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push

# Or run migrations
npm run db:migrate
```

4. **Start development server**
```bash
npm run dev
```

The API will be available at `http://localhost:3001`

## 📋 API Endpoints

### Authentication
- `POST /api/v1/auth/school/register` - School registration
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/refresh` - Refresh token
- `POST /api/v1/auth/logout` - Logout
- `GET /api/v1/auth/profile` - Get user profile
- `PUT /api/v1/auth/profile` - Update profile
- `PUT /api/v1/auth/change-password` - Change password

### Health Check
- `GET /health` - API health status

## 🛠️ Development

### Available Scripts
- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run db:generate` - Generate Prisma client
- `npm run db:push` - Push schema changes to database
- `npm run db:migrate` - Run database migrations
- `npm run db:studio` - Open Prisma Studio

### Project Structure
```
src/
├── controllers/     # Route controllers
├── middleware/      # Custom middleware
├── routes/          # API routes
├── services/        # Business logic
├── types/           # TypeScript type definitions
├── utils/           # Utility functions
├── config/          # Configuration files
└── index.ts         # Application entry point
```

## 🔧 Configuration

### Environment Variables
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - JWT signing secret
- `JWT_REFRESH_SECRET` - JWT refresh token secret
- `PORT` - Server port (default: 3001)
- `NODE_ENV` - Environment (development/production)

### Database Schema
The database schema is defined in `prisma/schema.prisma` and includes:
- Multi-tenant school management
- User roles and permissions
- Class and student management
- Attendance tracking
- Homework management
- Communication system
- Timetable management

## 🔒 Security Features

- JWT authentication with refresh tokens
- Password hashing with bcrypt
- Rate limiting
- CORS protection
- Helmet security headers
- Input validation
- SQL injection prevention

## 📊 Performance

- Connection pooling
- Database indexing
- Query optimization
- Response caching (Redis recommended)
- File upload optimization

## 🧪 Testing

```bash
# Run tests (when implemented)
npm test

# Run tests with coverage
npm run test:coverage
```

## 🚀 Deployment

### Production Build
```bash
npm run build
npm start
```

### Docker Deployment
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3001
CMD ["npm", "start"]
```

## 📈 Monitoring

- Health check endpoint
- Error logging
- Performance metrics
- Database query monitoring

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details
