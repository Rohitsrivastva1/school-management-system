# School Management App - UI/UX Specification

## 1. Information Architecture

- Primary roles: Admin, Class Teacher, Subject Teacher, Parent, Student
- Global navigation (role-aware): Dashboard, Classes, Timetable, Attendance, Homework, Notifications, Q&A, Complaints, Files, Analytics (admin), Settings/Profile
- Authentication: Login, Forgot password (future), Logout

## 2. Navigation & Routing

- Persistent top bar: school logo/name, role switch (if multi-role), quick search, profile avatar menu
- Left sidebar (collapsible): context-aware menu per role
- Breadcrumbs inside content area for deep pages

## 3. Screen Blueprints and API Mapping

Notes:
- Base URL: /api/v1
- Auth: Authorization: Bearer <token>
- Use optimistic UI where safe; otherwise show determinate loaders.

### 3.1 Auth
- Login
  - Inputs: email, password
  - API: POST /auth/login
  - Success: store tokens, fetch GET /auth/profile, route to role default dashboard
  - Errors: 400/401 → inline field errors and toast

### 3.2 Dashboard
- Admin Dashboard
  - API: GET /dashboard/admin
  - Widgets: Overview KPIs, charts (attendance trend, class performance), recent activities
- Teacher Dashboard
  - API: GET /dashboard/teacher
  - Widgets: Today’s classes, pending homework, quick mark attendance
- Parent Dashboard
  - API: GET /dashboard/parent?studentId=uuid
  - Widgets: Attendance summary, notifications, homework due
- Student Dashboard
  - API: GET /dashboard/student
  - Widgets: Today’s timetable, homework due, notifications

### 3.3 Classes (Admin, Class/Subject Teacher)
- List
  - API: GET /classes?page&limit&academicYear
  - Table: name, section, teacher, room, students, actions
  - Empty: CTA to Create Class (if permitted)
- Create/Edit
  - APIs: POST /classes, PUT /classes/{classId}
  - Validation: required name, section, academicYear, classTeacherId
- Details
  - API: GET /classes/{classId}
  - Tabs: Overview, Students, Timetable, Attendance, Homework

### 3.4 Users - Teachers and Students
- Teachers (Admin)
  - List: GET /users/teachers?page&limit&search
  - Create: POST /users/teachers
- Students (Admin, Class Teacher)
  - List: GET /users/students?classId&page&limit
  - Bulk import: POST /users/students/bulk (CSV upload)
  - CRUD: POST/PUT/DELETE /users/students/{id}

### 3.5 Timetable
- Class/Teacher timetable views (week grid)
  - APIs: GET /timetable/class/{classId}, GET /timetable/teacher/{teacherId}
- Admin management
  - CRUD: POST /timetable, PUT /timetable/{id}, DELETE /timetable/{id}
  - Validation: overlapping periods, time range, teacher availability

### 3.6 Attendance
- Mark attendance (class session)
  - API: POST /attendance/mark
  - Form: date, list of students with Present/Absent/Late, remarks
- Browse
  - By class: GET /attendance/class/{classId}?page&limit
  - By student: GET /attendance/student/{studentId}?page&limit
  - Stats: GET /attendance/stats?classId&studentId&period
  - Edit/Delete: PUT/DELETE /attendance/{attendanceId}

### 3.7 Homework
- List and filters (class, teacher, date)
  - APIs: GET /homework, /homework/class/{classId}, /homework/teacher/{teacherId}
- Create/Edit
  - APIs: POST /homework (multipart), PUT /homework/{homeworkId}
  - Publish: PATCH /homework/{homeworkId}/publish
- Detail
  - API: GET /homework/{homeworkId}
  - Attachments via Files module

### 3.8 Notifications
- Inbox with filters
  - APIs: GET /notifications, GET /notifications/{notificationId}
  - Mark read: PUT /notifications/{notificationId}/read
- Create (Admin, Class Teacher)
  - API: POST /notifications

### 3.9 Q&A
- Threads list and details
  - APIs: GET /qa, GET /qa/{messageId}
- Create and reply
  - APIs: POST /qa, PUT /qa/{messageId}/reply, PUT /qa/{messageId}/status

### 3.10 Complaints
- List and details
  - APIs: GET /complaints, GET /complaints/{complaintId}
- Create/Update/Resolve/Delete
  - APIs: POST /complaints, PUT /complaints/{complaintId}, PUT /complaints/{complaintId}/resolve, DELETE /complaints/{complaintId}

### 3.11 Files
- Upload and browse
  - APIs: POST /files/upload, GET /files/{fileId}, DELETE /files/{fileId}, GET /files/stats/overview

### 3.12 Subjects
- List/CRUD (Admin)
  - APIs: GET /subjects, GET /subjects/{id}, POST /subjects, PUT /subjects/{id}, DELETE /subjects/{id}

### 3.13 Analytics (Admin)
- Overview and reports
  - APIs: GET /analytics/attendance|performance|class|teacher|student|school

## 4. Component States & Patterns

- Loading: skeletons for tables/cards; spinner for modal submits
- Empty: explanation + primary CTA; secondary import/upload where relevant
- Error: inline field errors for 4xx; toast/banner for 5xx; retry CTA
- Validation: disable submit until valid; server errors mapped to fields
- Pagination: server-driven with page/limit; show total and pages
- Search/Filters: debounced 300ms; query params in URL for shareability

## 5. Forms & Validation Rules (high-level)

- Required: email (format), password (min 8, complexity), names (letters and spaces), dates (ISO)
- IDs: UUID format where applicable
- Files: max 10MB; allowed types as per backend

## 6. Accessibility & Usability

- Keyboard navigability, focus outlines, ARIA for interactive components
- Color contrast WCAG AA minimum; avoid color-only signals
- Announce async updates (loading/success/error) to screen readers

## 7. Visual Language

- Design tokens: primary, surface, muted; spacing scale 4/8; radius 8
- Components: AppShell, DataTable, Form, Modal, Tabs, EmptyState, Toast

## 8. Default Routes by Role

- Admin → /dashboard/admin
- Class/Subject Teacher → /dashboard/teacher
- Parent → /dashboard/parent?studentId={firstChildId}
- Student → /dashboard/student

## 9. Security & Session

- Store access token in memory; refresh token rotation; logout clears all
- 401 interceptor → route to /login; preserve intended route

## 10. Example Flow Diagrams (text)

- Create Class: open modal → validate → POST /classes → success toast → refetch GET /classes → close modal
- Mark Attendance: open session → toggle statuses → POST /attendance/mark → success → update local list → optional export

# 🎨 School Management System - Frontend Development Plan

## 📋 System Overview
Web portal built with Next.js for school admins and teachers, providing comprehensive school management capabilities.

## 🛠️ Technology Stack
- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui components
- **State Management**: Zustand + React Query
- **Forms**: React Hook Form + Zod validation
- **Charts**: Recharts
- **File Upload**: React Dropzone
- **Authentication**: NextAuth.js
- **Deployment**: Vercel

## 🏗️ Application Architecture

### Role-Based Access Control
```typescript
enum UserRole {
  ADMIN = 'admin',
  CLASS_TEACHER = 'class_teacher',
  SUBJECT_TEACHER = 'subject_teacher',
  PARENT = 'parent',
  STUDENT = 'student'
}

interface User {
  id: string;
  email: string;
  role: UserRole;
  schoolId: string;
  firstName: string;
  lastName: string;
  profileImage?: string;
}
```

### Multi-Tenant Structure
- School-specific routing (`/school/[schoolId]/...`)
- Dynamic theming based on school branding
- Isolated data access per school
- Custom domain support

## 📁 Project Structure
```
frontend/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/            # Auth group routes
│   │   │   ├── login/
│   │   │   ├── register/
│   │   │   └── forgot-password/
│   │   ├── (dashboard)/       # Protected dashboard routes
│   │   │   ├── admin/
│   │   │   ├── teacher/
│   │   │   └── parent/
│   │   ├── api/               # API routes
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/            # Reusable components
│   │   ├── ui/                # shadcn/ui components
│   │   ├── forms/             # Form components
│   │   ├── charts/            # Chart components
│   │   ├── tables/            # Data table components
│   │   └── layout/            # Layout components
│   ├── lib/                   # Utilities and configurations
│   │   ├── auth.ts            # NextAuth configuration
│   │   ├── api.ts             # API client
│   │   ├── utils.ts           # Helper functions
│   │   └── validations.ts     # Zod schemas
│   ├── hooks/                 # Custom React hooks
│   ├── stores/                # Zustand stores
│   ├── types/                 # TypeScript type definitions
│   └── styles/                # Additional styles
├── public/                    # Static assets
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── next.config.js
```

## 🎯 Core Features & Components

### 1. Authentication System
```typescript
// Login Component
- Email/password authentication
- Role-based redirect
- Remember me functionality
- Password strength indicator

// Registration Component
- School registration form
- Admin account creation
- Email verification
- Terms and conditions
```

### 2. School Management Dashboard (Admin)
```typescript
// School Profile Management
- School information form
- Logo upload
- Contact details
- Domain configuration

// Class Management
- Create/edit classes and sections
- Assign class teachers
- Bulk operations
- Academic year management

// Teacher Management
- Add/edit teacher profiles
- Subject assignments
- Bulk import from CSV
- Teacher performance tracking

// Student Management
- Bulk student upload (CSV/Excel)
- Individual student profiles
- Parent linking
- Admission management
```

### 3. Teacher Dashboard
```typescript
// Class Overview
- Assigned classes display
- Student list with photos
- Quick attendance marking
- Class performance summary

// Timetable Management
- Visual timetable editor
- Drag-and-drop scheduling
- Teacher availability
- Conflict detection

// Homework Management
- Create homework assignments
- File attachments
- Due date management
- Submission tracking

// Communication Hub
- Parent messages
- Q&A responses
- Complaint handling
- Notification center
```

### 4. Parent Dashboard
```typescript
// Student Progress
- Attendance overview
- Grade tracking
- Homework completion
- Performance analytics

// Communication
- Message class teacher
- View school announcements
- Complaint submission
- Calendar events
```

## 🎨 UI/UX Design System

### Design Principles
- **Clean & Modern**: Minimalist design with clear hierarchy
- **Responsive**: Mobile-first approach
- **Accessible**: WCAG 2.1 compliance
- **Consistent**: Unified design language
- **Intuitive**: User-friendly navigation

### Color Palette
```css
:root {
  --primary: 220 14% 96%;      /* Light blue */
  --primary-foreground: 220 9% 46%;
  --secondary: 220 14% 96%;
  --secondary-foreground: 220 9% 46%;
  --accent: 220 14% 96%;
  --accent-foreground: 220 9% 46%;
  --destructive: 0 84% 60%;
  --destructive-foreground: 0 0% 98%;
  --border: 220 13% 91%;
  --input: 220 13% 91%;
  --ring: 220 14% 83%;
  --background: 0 0% 100%;
  --foreground: 220 9% 46%;
}
```

### Component Library
- **Buttons**: Primary, secondary, outline, ghost variants
- **Forms**: Input, select, textarea, checkbox, radio
- **Tables**: Sortable, filterable, paginated
- **Cards**: Information cards, stat cards
- **Modals**: Confirmation, form, information
- **Navigation**: Sidebar, breadcrumbs, tabs
- **Charts**: Line, bar, pie, area charts
- **File Upload**: Drag-and-drop, progress indicator

## 📱 Responsive Design

### Breakpoints
```css
sm: 640px   /* Mobile landscape */
md: 768px   /* Tablet */
lg: 1024px  /* Desktop */
xl: 1280px  /* Large desktop */
2xl: 1536px /* Extra large */
```

### Layout Adaptations
- **Mobile**: Single column, collapsible sidebar
- **Tablet**: Two column layout, expanded sidebar
- **Desktop**: Multi-column dashboard, persistent sidebar

## 🔄 State Management

### Zustand Stores
```typescript
// Auth Store
interface AuthStore {
  user: User | null;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => Promise<void>;
}

// School Store
interface SchoolStore {
  currentSchool: School | null;
  classes: Class[];
  teachers: Teacher[];
  students: Student[];
  setSchool: (school: School) => void;
  fetchClasses: () => Promise<void>;
  fetchTeachers: () => Promise<void>;
  fetchStudents: () => Promise<void>;
}

// UI Store
interface UIStore {
  sidebarOpen: boolean;
  theme: 'light' | 'dark';
  notifications: Notification[];
  toggleSidebar: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
  addNotification: (notification: Notification) => void;
}
```

### React Query Integration
```typescript
// API Hooks
const useClasses = (schoolId: string) => {
  return useQuery({
    queryKey: ['classes', schoolId],
    queryFn: () => api.getClasses(schoolId),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

const useCreateClass = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.createClass,
    onSuccess: () => {
      queryClient.invalidateQueries(['classes']);
    },
  });
};
```

## 📊 Dashboard Components

### Admin Dashboard
```typescript
// Key Metrics Cards
- Total Students
- Total Teachers
- Attendance Rate
- Active Classes

// Charts
- Attendance Trends (Line Chart)
- Class Performance (Bar Chart)
- Teacher Workload (Pie Chart)
- Student Distribution (Area Chart)

// Recent Activities
- New student admissions
- Teacher assignments
- Attendance alerts
- System notifications
```

### Teacher Dashboard
```typescript
// Class Overview
- Today's schedule
- Attendance summary
- Pending homework
- Parent messages

// Quick Actions
- Mark attendance
- Post homework
- Send notification
- View timetable
```

### Parent Dashboard
```typescript
// Child Progress
- Weekly attendance
- Homework completion
- Grade trends
- Upcoming events

// Communication
- Recent messages
- School announcements
- Calendar events
- Quick contact
```

## 🔧 Advanced Features

### File Management
```typescript
// File Upload Component
- Drag and drop interface
- Progress indicators
- File type validation
- Size limits
- Preview functionality

// File Types Supported
- Images: JPG, PNG, GIF
- Documents: PDF, DOC, DOCX
- Spreadsheets: XLS, XLSX, CSV
- Presentations: PPT, PPTX
```

### Data Tables
```typescript
// Advanced Table Features
- Sorting by columns
- Filtering and search
- Pagination
- Bulk actions
- Export functionality
- Column visibility toggle
- Row selection
```

### Real-time Updates
```typescript
// WebSocket Integration
- Live attendance updates
- Real-time notifications
- Instant message delivery
- Live dashboard updates
```

## 🧪 Testing Strategy

### Testing Tools
- **Unit Tests**: Jest + React Testing Library
- **Integration Tests**: Cypress
- **E2E Tests**: Playwright
- **Visual Tests**: Chromatic

### Test Coverage
- Component rendering
- User interactions
- Form validations
- API integrations
- Authentication flows
- Role-based access

## 🚀 Performance Optimization

### Code Splitting
```typescript
// Route-based splitting
const AdminDashboard = lazy(() => import('./AdminDashboard'));
const TeacherDashboard = lazy(() => import('./TeacherDashboard'));

// Component-based splitting
const HeavyChart = lazy(() => import('./HeavyChart'));
```

### Image Optimization
```typescript
// Next.js Image component
<Image
  src="/student-photo.jpg"
  alt="Student Photo"
  width={100}
  height={100}
  priority
  placeholder="blur"
/>
```

### Caching Strategy
- Static page caching
- API response caching
- Image optimization
- Bundle optimization

## 🔒 Security Implementation

### Authentication
- JWT token management
- Automatic token refresh
- Secure cookie handling
- Session timeout

### Data Protection
- Input sanitization
- XSS prevention
- CSRF protection
- Secure file uploads

### Access Control
- Route protection
- Component-level permissions
- API call authorization
- Role-based UI rendering

## 📈 Analytics & Monitoring

### User Analytics
- Page views tracking
- User behavior analysis
- Performance metrics
- Error tracking

### Business Metrics
- Feature usage statistics
- User engagement metrics
- System performance data
- Error rates and patterns

## 🚀 Deployment Strategy

### Development Environment
- Local development server
- Hot reloading
- Environment variables
- Mock API integration

### Production Deployment
- Vercel deployment
- Environment configuration
- CDN optimization
- SSL certificate
- Domain configuration

### CI/CD Pipeline
- Automated testing
- Code quality checks
- Build optimization
- Deployment automation
