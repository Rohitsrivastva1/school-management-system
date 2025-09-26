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

### 4. Logout
```http
POST /auth/logout
Authorization: Bearer <token>
```

### 5. Get My Profile
```http
GET /auth/profile
Authorization: Bearer <token>
```

### 6. Update My Profile
```http
PUT /auth/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+91-9876543210"
}
```

### 7. Change Password
```http
PUT /auth/change-password
Authorization: Bearer <token>
Content-Type: application/json

{
  "currentPassword": "oldPass",
  "newPassword": "newPass123!"
}
```

## 🏫 School Management

### 8. Get School Profile
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

### 9. Update School Profile (Admin)
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

### 10. Get School Stats (Admin)
```http
GET /schools/stats
Authorization: Bearer <token>
```

## 👥 User Management

### 11. Create Teacher (Admin)
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

### 12. Get Teachers List (Admin)
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

### 13. Bulk Upload Students (Admin, Class Teacher)
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

### 14. Get Students List (Admin, Class/Subject Teacher)
```http
GET /users/students?classId=uuid&page=1&limit=20
Authorization: Bearer <token>
```

### 15. Get Student By ID (Admin, Class/Subject Teacher)
```http
GET /users/students/{id}
Authorization: Bearer <token>
```

### 16. Create Student (Admin)
```http
POST /users/students
Authorization: Bearer <token>
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "classId": "uuid",
  "rollNumber": "001"
}
```

### 17. Update Student (Admin, Class Teacher)
```http
PUT /users/students/{id}
Authorization: Bearer <token>
Content-Type: application/json

{
  "classId": "uuid",
  "rollNumber": "002"
}
```

### 18. Delete Student (Admin)
```http
DELETE /users/students/{id}
Authorization: Bearer <token>
```

### 19. Update User (Admin)
```http
PUT /users/{userId}
Authorization: Bearer <token>
Content-Type: application/json
```

### 20. Delete User (Admin)
```http
DELETE /users/{userId}
Authorization: Bearer <token>
```

## 🏫 Class Management

### 21. Create Class (Admin, Class Teacher)
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

### 22. Get Classes List (Admin, Class/Subject Teacher)
```http
GET /classes?academicYear=2024-25&page=1&limit=10
Authorization: Bearer <token>
```

### 23. Get Class Details (Admin, Class/Subject Teacher)
```http
GET /classes/{classId}
Authorization: Bearer <token>
```

### 24. Update Class (Admin, Class Teacher)
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

### 25. Delete Class (Admin)
```http
DELETE /classes/{classId}
Authorization: Bearer <token>
```

## 📅 Timetable Management

### 26. Create Timetable Entry (Admin)
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

### 27. Get Timetable (Admin, Class/Subject Teacher)
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

### 28. Get Timetable By Class (Admin, Class/Subject Teacher, Parent, Student)
```http
GET /timetable/class/{classId}
Authorization: Bearer <token>
```

### 29. Get Timetable By Teacher (Admin, Class/Subject Teacher)
```http
GET /timetable/teacher/{teacherId}
Authorization: Bearer <token>
```

### 30. Update Timetable Entry (Admin)
```http
PUT /timetable/{id}
Authorization: Bearer <token>
Content-Type: application/json
```

### 31. Delete Timetable Entry (Admin)
```http
DELETE /timetable/{id}
Authorization: Bearer <token>
```

## 📊 Attendance Management

### 32. Mark Attendance (Admin, Class/Subject Teacher)
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

### 33. Get Attendance By Class (Admin, Class/Subject Teacher)
```http
GET /attendance/class/{classId}?page=1&limit=20
Authorization: Bearer <token>
```

### 34. Get Attendance By Student (Admin, Class/Subject Teacher)
```http
GET /attendance/student/{studentId}?page=1&limit=20
Authorization: Bearer <token>
```

### 35. Update Attendance (Admin, Class/Subject Teacher)
```http
PUT /attendance/{attendanceId}
Authorization: Bearer <token>
Content-Type: application/json
```

### 36. Delete Attendance (Admin)
```http
DELETE /attendance/{attendanceId}
Authorization: Bearer <token>
```

### 37. Get Attendance Statistics (Admin, Class Teacher)
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

### 38. Create Homework (Admin, Teachers)
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

### 39. Get Homework List (Admin, Teachers)
```http
GET /homework?classId=uuid&teacherId=uuid&page=1&limit=10
Authorization: Bearer <token>
```

### 40. Get Homework By Teacher (Admin, Teachers)
```http
GET /homework/teacher/{teacherId}?page=1&limit=10
Authorization: Bearer <token>
```

### 41. Get Homework By Class (Admin, Teachers)
```http
GET /homework/class/{classId}?page=1&limit=10
Authorization: Bearer <token>
```

### 42. Get Homework By ID (Admin, Teachers)
```http
GET /homework/{homeworkId}
Authorization: Bearer <token>
```

### 43. Update Homework (Admin, Teachers)
```http
PUT /homework/{homeworkId}
Authorization: Bearer <token>
Content-Type: application/json
```

### 44. Delete Homework (Admin, Teachers)
```http
DELETE /homework/{homeworkId}
Authorization: Bearer <token>
```

### 45. Publish Homework (Admin, Teachers)
```http
PATCH /homework/{homeworkId}/publish
Authorization: Bearer <token>
```

## 💬 Communication System

### 46. Send Notification (Admin, Class Teacher)
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

### 47. Get Notifications (All roles)
```http
GET /notifications?page=1&limit=20&type=announcement
Authorization: Bearer <token>
```

### 48. Get Notification By ID (All roles)
```http
GET /notifications/{notificationId}
Authorization: Bearer <token>
```

### 49. Mark Notification As Read (All roles)
```http
PUT /notifications/{notificationId}/read
Authorization: Bearer <token>
```

### 50. Notification Stats (Admin, Class Teacher)
```http
GET /notifications/stats
Authorization: Bearer <token>
```

### 51. Send Q&A Message (Parent, Class Teacher)
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

### 52. Get Q&A Messages (Parent, Class Teacher, Admin)
```http
GET /qa?page=1&limit=20
Authorization: Bearer <token>
```

### 53. Get Q&A By ID (Parent, Class Teacher, Admin)
```http
GET /qa/{messageId}
Authorization: Bearer <token>
```

### 54. Reply to Q&A (Class Teacher, Admin)
```http
PUT /qa/{messageId}/reply
Authorization: Bearer <token>
Content-Type: application/json

{
  "reply": "I will arrange extra classes for your child",
  "status": "replied"
}
```

### 55. Update Q&A Status (Class Teacher, Admin)
```http
PUT /qa/{messageId}/status
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "replied"
}
```

### 56. File Complaint (Parent, Student, Admin)
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

### 57. Get Complaints (Admin, Class Teacher, Parent)
```http
GET /complaints?page=1&limit=20
Authorization: Bearer <token>
```

### 58. Get Complaint By ID (Admin, Class Teacher, Parent)
```http
GET /complaints/{complaintId}
Authorization: Bearer <token>
```

### 59. Update Complaint (Admin, Class Teacher)
```http
PUT /complaints/{complaintId}
Authorization: Bearer <token>
Content-Type: application/json
```

### 60. Resolve Complaint (Admin, Class Teacher)
```http
PUT /complaints/{complaintId}/resolve
Authorization: Bearer <token>
```

### 61. Delete Complaint (Admin)
```http
DELETE /complaints/{complaintId}
Authorization: Bearer <token>
```

## 📊 Dashboard APIs

### 62. Admin Dashboard (Admin)
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

### 63. Teacher Dashboard (Teacher)
```http
GET /dashboard/teacher
Authorization: Bearer <token>
```

### 64. Parent Dashboard (Parent)
```http
GET /dashboard/parent?studentId=uuid
Authorization: Bearer <token>
```

### 65. Student Dashboard (Student)
```http
GET /dashboard/student
Authorization: Bearer <token>
```

## 🔧 File Management

### 66. Upload File (All roles)
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

### 67. Get File (All roles)
```http
GET /files/{fileId}
Authorization: Bearer <token>
```

### 68. Delete File (Admin, Class/Subject Teacher)
```http
DELETE /files/{fileId}
Authorization: Bearer <token>
```

### 69. File Stats Overview (Admin)
```http
GET /files/stats/overview
Authorization: Bearer <token>
```

## 📚 Subjects

### 70. List Subjects (Admin, Class/Subject Teacher)
```http
GET /subjects?page=1&limit=20
Authorization: Bearer <token>
```

### 71. Get Subject By ID (Admin, Class/Subject Teacher)
```http
GET /subjects/{id}
Authorization: Bearer <token>
```

### 72. Create Subject (Admin)
```http
POST /subjects
Authorization: Bearer <token>
Content-Type: application/json
```

### 73. Update Subject (Admin)
```http
PUT /subjects/{id}
Authorization: Bearer <token>
Content-Type: application/json
```

### 74. Delete Subject (Admin)
```http
DELETE /subjects/{id}
Authorization: Bearer <token>
```

## 👩‍🏫 Teachers Resource

Note: This is separate from `GET /users/teachers` under User Management.

### 75. Teacher Stats (Admin)
```http
GET /teachers/stats
Authorization: Bearer <token>
```

### 76. My Subjects (Teacher)
```http
GET /teachers/subjects
Authorization: Bearer <token>
```

### 77. Create Teacher (Admin)
```http
POST /teachers
Authorization: Bearer <token>
Content-Type: application/json
```

### 78. List Teachers (Admin, Class Teacher)
```http
GET /teachers
Authorization: Bearer <token>
```

### 79. Get Teacher By ID (Admin, Class Teacher)
```http
GET /teachers/{id}
Authorization: Bearer <token>
```

### 80. Update Teacher (Admin)
```http
PUT /teachers/{id}
Authorization: Bearer <token>
Content-Type: application/json
```

### 81. Delete Teacher (Admin)
```http
DELETE /teachers/{id}
Authorization: Bearer <token>
```

## 📈 Analytics (Admin unless noted)

```http
GET /analytics/attendance?page=1&limit=20
GET /analytics/performance?page=1&limit=20
GET /analytics/class?page=1&limit=20
GET /analytics/teacher?page=1&limit=20
GET /analytics/student?page=1&limit=20   # Admin, Class Teacher, Parent
GET /analytics/school
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
