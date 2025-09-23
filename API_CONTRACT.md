# 📋 School Management System - API Contract

## 🔗 Base URL
```
Production: https://api.schoolmanagement.com/v1
Development: http://localhost:3001/api/v1
```

## 🔐 Authentication
All protected endpoints require JWT token in Authorization header:
```
Authorization: Bearer <jwt_token>
```

## 📊 Response Format
```typescript
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
```

## 🏫 School Management APIs

### 1. School Registration
```http
POST /auth/school/register
Content-Type: application/json

{
  "name": "Delhi Public School",
  "email": "admin@dps.com",
  "password": "securePassword123",
  "address": "123 Main Street, Delhi",
  "city": "Delhi",
  "state": "Delhi",
  "pincode": "110001",
  "phone": "+91-9876543210",
  "website": "https://dps.com"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "school": {
      "id": "uuid",
      "name": "Delhi Public School",
      "domain": "dps.schoolmanagement.com",
      "isActive": true
    },
    "admin": {
      "id": "uuid",
      "email": "admin@dps.com",
      "role": "admin"
    },
    "tokens": {
      "accessToken": "jwt_token",
      "refreshToken": "refresh_token"
    }
  }
}
```

### 2. User Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "admin@dps.com",
  "password": "securePassword123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "admin@dps.com",
      "role": "admin",
      "schoolId": "uuid",
      "firstName": "John",
      "lastName": "Doe"
    },
    "tokens": {
      "accessToken": "jwt_token",
      "refreshToken": "refresh_token"
    }
  }
}
```

### 3. Refresh Token
```http
POST /auth/refresh
Content-Type: application/json

{
  "refreshToken": "refresh_token"
}
```

## 🏫 School Management

### 4. Get School Profile
```http
GET /schools/profile
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Delhi Public School",
    "address": "123 Main Street, Delhi",
    "city": "Delhi",
    "state": "Delhi",
    "pincode": "110001",
    "phone": "+91-9876543210",
    "email": "admin@dps.com",
    "website": "https://dps.com",
    "logoUrl": "https://cdn.schoolmanagement.com/logos/dps.png",
    "domain": "dps.schoolmanagement.com",
    "academicYearStart": "2024-04-01",
    "academicYearEnd": "2025-03-31"
  }
}
```

### 5. Update School Profile
```http
PUT /schools/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Delhi Public School Updated",
  "address": "456 New Street, Delhi",
  "phone": "+91-9876543211"
}
```

## 👥 User Management

### 6. Create Teacher
```http
POST /users/teachers
Authorization: Bearer <token>
Content-Type: application/json

{
  "email": "teacher@dps.com",
  "firstName": "Jane",
  "lastName": "Smith",
  "phone": "+91-9876543212",
  "employeeId": "EMP001",
  "qualification": "M.Ed",
  "subjects": ["Mathematics", "Physics"],
  "joiningDate": "2024-01-15"
}
```

### 7. Get Teachers List
```http
GET /users/teachers?page=1&limit=10&search=math
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "email": "teacher@dps.com",
      "firstName": "Jane",
      "lastName": "Smith",
      "phone": "+91-9876543212",
      "role": "subject_teacher",
      "employeeId": "EMP001",
      "qualification": "M.Ed",
      "subjects": ["Mathematics", "Physics"],
      "isActive": true,
      "createdAt": "2024-01-15T10:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "totalPages": 3
  }
}
```

### 8. Bulk Upload Students
```http
POST /users/students/bulk
Authorization: Bearer <token>
Content-Type: multipart/form-data

FormData:
- file: students.csv
- classId: uuid
```

**CSV Format:**
```csv
rollNumber,firstName,lastName,dateOfBirth,gender,fatherName,motherName,fatherPhone,motherPhone,admissionDate
001,John,Doe,2010-05-15,male,Robert Doe,Jane Doe,+91-9876543210,+91-9876543211,2024-01-15
002,Jane,Smith,2010-08-20,female,Mike Smith,Sarah Smith,+91-9876543212,+91-9876543213,2024-01-15
```

### 9. Get Students List
```http
GET /users/students?classId=uuid&page=1&limit=20
Authorization: Bearer <token>
```

## 🏫 Class Management

### 10. Create Class
```http
POST /classes
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Class 5",
  "section": "A",
  "academicYear": "2024-25",
  "classTeacherId": "uuid",
  "maxStudents": 40,
  "roomNumber": "Room 501"
}
```

### 11. Get Classes List
```http
GET /classes?academicYear=2024-25&page=1&limit=10
Authorization: Bearer <token>
```

### 12. Update Class
```http
PUT /classes/{classId}
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Class 5",
  "section": "B",
  "classTeacherId": "uuid",
  "roomNumber": "Room 502"
}
```

## 📅 Timetable Management

### 13. Create Timetable Entry
```http
POST /timetable
Authorization: Bearer <token>
Content-Type: application/json

{
  "classId": "uuid",
  "subjectId": "uuid",
  "teacherId": "uuid",
  "dayOfWeek": 1,
  "periodNumber": 1,
  "startTime": "09:00",
  "endTime": "09:45",
  "roomNumber": "Room 501",
  "academicYear": "2024-25"
}
```

### 14. Get Timetable
```http
GET /timetable?classId=uuid&academicYear=2024-25
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "monday": [
      {
        "id": "uuid",
        "periodNumber": 1,
        "startTime": "09:00",
        "endTime": "09:45",
        "subject": {
          "id": "uuid",
          "name": "Mathematics",
          "code": "MATH"
        },
        "teacher": {
          "id": "uuid",
          "firstName": "Jane",
          "lastName": "Smith"
        },
        "roomNumber": "Room 501"
      }
    ],
    "tuesday": [...],
    "wednesday": [...]
  }
}
```

## 📊 Attendance Management

### 15. Mark Attendance
```http
POST /attendance/mark
Authorization: Bearer <token>
Content-Type: application/json

{
  "classId": "uuid",
  "date": "2024-01-15",
  "attendance": [
    {
      "studentId": "uuid",
      "status": "present",
      "remarks": ""
    },
    {
      "studentId": "uuid",
      "status": "absent",
      "remarks": "Sick"
    }
  ]
}
```

### 16. Get Attendance Records
```http
GET /attendance?classId=uuid&startDate=2024-01-01&endDate=2024-01-31&studentId=uuid
Authorization: Bearer <token>
```

### 17. Get Attendance Statistics
```http
GET /attendance/stats?classId=uuid&studentId=uuid&period=monthly
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalDays": 22,
    "presentDays": 20,
    "absentDays": 2,
    "attendancePercentage": 90.91,
    "trend": [
      {
        "date": "2024-01-01",
        "status": "present"
      },
      {
        "date": "2024-01-02",
        "status": "absent"
      }
    ]
  }
}
```

## 📝 Homework Management

### 18. Create Homework
```http
POST /homework
Authorization: Bearer <token>
Content-Type: multipart/form-data

FormData:
- classId: uuid
- subjectId: uuid
- title: "Math Assignment"
- description: "Complete exercises 1-10"
- dueDate: "2024-01-20T23:59:59Z"
- attachments: [file1.pdf, file2.jpg]
```

### 19. Get Homework List
```http
GET /homework?classId=uuid&teacherId=uuid&page=1&limit=10
Authorization: Bearer <token>
```

### 20. Submit Homework (Student)
```http
POST /homework/{homeworkId}/submit
Authorization: Bearer <token>
Content-Type: multipart/form-data

FormData:
- submissionText: "Completed assignment"
- attachments: [submission.pdf]
```

## 💬 Communication System

### 21. Send Notification
```http
POST /notifications
Authorization: Bearer <token>
Content-Type: application/json

{
  "recipientType": "class",
  "recipientClassId": "uuid",
  "title": "School Holiday",
  "message": "School will be closed on Republic Day",
  "type": "announcement",
  "priority": "normal"
}
```

### 22. Get Notifications
```http
GET /notifications?page=1&limit=20&type=announcement
Authorization: Bearer <token>
```

### 23. Send Q&A Message
```http
POST /qa
Authorization: Bearer <token>
Content-Type: application/json

{
  "studentId": "uuid",
  "message": "My child is having difficulty with mathematics",
  "priority": "normal"
}
```

### 24. Reply to Q&A
```http
PUT /qa/{messageId}/reply
Authorization: Bearer <token>
Content-Type: application/json

{
  "reply": "I will arrange extra classes for your child",
  "status": "replied"
}
```

### 25. File Complaint
```http
POST /complaints
Authorization: Bearer <token>
Content-Type: application/json

{
  "studentId": "uuid",
  "subject": "Bullying Issue",
  "description": "My child is being bullied by classmates",
  "category": "behavioral",
  "priority": "high"
}
```

## 📊 Dashboard APIs

### 26. Admin Dashboard
```http
GET /dashboard/admin
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "overview": {
      "totalStudents": 500,
      "totalTeachers": 25,
      "totalClasses": 20,
      "attendanceRate": 92.5
    },
    "recentActivities": [
      {
        "type": "student_admission",
        "message": "New student John Doe admitted to Class 5A",
        "timestamp": "2024-01-15T10:00:00Z"
      }
    ],
    "charts": {
      "attendanceTrend": [...],
      "classPerformance": [...],
      "teacherWorkload": [...]
    }
  }
}
```

### 27. Teacher Dashboard
```http
GET /dashboard/teacher
Authorization: Bearer <token>
```

### 28. Parent Dashboard
```http
GET /dashboard/parent?studentId=uuid
Authorization: Bearer <token>
```

## 🔧 File Management

### 29. Upload File
```http
POST /files/upload
Authorization: Bearer <token>
Content-Type: multipart/form-data

FormData:
- file: [file]
- type: "homework" | "profile" | "document"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "fileId": "uuid",
    "fileName": "assignment.pdf",
    "fileUrl": "https://cdn.schoolmanagement.com/files/uuid.pdf",
    "fileSize": 1024000,
    "mimeType": "application/pdf"
  }
}
```

### 30. Get File
```http
GET /files/{fileId}
Authorization: Bearer <token>
```

## 🚨 Error Codes

| Code | Description |
|------|-------------|
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 409 | Conflict |
| 422 | Validation Error |
| 429 | Too Many Requests |
| 500 | Internal Server Error |

## 📝 Error Response Format
```json
{
  "success": false,
  "error": "VALIDATION_ERROR",
  "message": "Invalid email format",
  "details": [
    {
      "field": "email",
      "message": "Email must be valid"
    }
  ]
}
```

## 🔄 WebSocket Events (Real-time)

### Connection
```javascript
const socket = io('ws://localhost:3001', {
  auth: {
    token: 'jwt_token'
  }
});
```

### Events
```javascript
// Listen for notifications
socket.on('notification', (data) => {
  console.log('New notification:', data);
});

// Listen for attendance updates
socket.on('attendance_update', (data) => {
  console.log('Attendance updated:', data);
});

// Listen for homework assignments
socket.on('homework_assigned', (data) => {
  console.log('New homework:', data);
});
```
