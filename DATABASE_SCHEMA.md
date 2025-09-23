# 🗄️ School Management System - Database Schema

## 📋 Overview
Multi-tenant PostgreSQL database schema designed for scalable school management system with role-based access control.

## 🏗️ Schema Design Principles
- **Multi-tenancy**: School isolation via `school_id` foreign keys
- **Normalization**: Proper 3NF design to avoid data redundancy
- **Scalability**: Indexed columns for optimal query performance
- **Security**: Encrypted sensitive data, audit trails
- **Flexibility**: Extensible design for future requirements

## 📊 Core Tables

### 1. Schools Table
```sql
CREATE TABLE schools (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    country VARCHAR(100) DEFAULT 'India',
    pincode VARCHAR(10),
    phone VARCHAR(20),
    email VARCHAR(255) UNIQUE NOT NULL,
    website VARCHAR(255),
    logo_url TEXT,
    domain VARCHAR(255) UNIQUE,
    academic_year_start DATE,
    academic_year_end DATE,
    timezone VARCHAR(50) DEFAULT 'Asia/Kolkata',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_schools_email ON schools(email);
CREATE INDEX idx_schools_domain ON schools(domain);
CREATE INDEX idx_schools_active ON schools(is_active);
```

### 2. Users Table
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'class_teacher', 'subject_teacher', 'parent', 'student')),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    profile_image_url TEXT,
    date_of_birth DATE,
    gender VARCHAR(10) CHECK (gender IN ('male', 'female', 'other')),
    address TEXT,
    is_active BOOLEAN DEFAULT true,
    email_verified BOOLEAN DEFAULT false,
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(school_id, email)
);

-- Indexes
CREATE INDEX idx_users_school_id ON users(school_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_active ON users(is_active);
CREATE INDEX idx_users_school_role ON users(school_id, role);
```

### 3. Classes Table
```sql
CREATE TABLE classes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    name VARCHAR(50) NOT NULL, -- e.g., "Class 1", "Grade 5"
    section VARCHAR(10), -- e.g., "A", "B", "C"
    academic_year VARCHAR(9) NOT NULL, -- e.g., "2024-25"
    class_teacher_id UUID REFERENCES users(id),
    max_students INTEGER DEFAULT 40,
    room_number VARCHAR(20),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(school_id, name, section, academic_year)
);

-- Indexes
CREATE INDEX idx_classes_school_id ON classes(school_id);
CREATE INDEX idx_classes_academic_year ON classes(academic_year);
CREATE INDEX idx_classes_teacher ON classes(class_teacher_id);
CREATE INDEX idx_classes_active ON classes(is_active);
```

### 4. Students Table
```sql
CREATE TABLE students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    roll_number VARCHAR(20) NOT NULL,
    admission_number VARCHAR(50) UNIQUE,
    admission_date DATE NOT NULL,
    parent_id UUID REFERENCES users(id),
    father_name VARCHAR(100),
    mother_name VARCHAR(100),
    father_phone VARCHAR(20),
    mother_phone VARCHAR(20),
    father_email VARCHAR(255),
    mother_email VARCHAR(255),
    emergency_contact VARCHAR(20),
    blood_group VARCHAR(5),
    medical_conditions TEXT,
    transport_mode VARCHAR(50), -- 'bus', 'private', 'walking'
    bus_route VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(class_id, roll_number)
);

-- Indexes
CREATE INDEX idx_students_user_id ON students(user_id);
CREATE INDEX idx_students_class_id ON students(class_id);
CREATE INDEX idx_students_parent_id ON students(parent_id);
CREATE INDEX idx_students_roll_number ON students(roll_number);
CREATE INDEX idx_students_admission_number ON students(admission_number);
```

### 5. Teachers Table
```sql
CREATE TABLE teachers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    employee_id VARCHAR(50) NOT NULL,
    qualification VARCHAR(255),
    subjects TEXT[], -- Array of subjects
    joining_date DATE NOT NULL,
    salary DECIMAL(10,2),
    department VARCHAR(100),
    experience_years INTEGER,
    is_class_teacher BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(user_id, employee_id)
);

-- Indexes
CREATE INDEX idx_teachers_user_id ON teachers(user_id);
CREATE INDEX idx_teachers_employee_id ON teachers(employee_id);
CREATE INDEX idx_teachers_subjects ON teachers USING GIN(subjects);
CREATE INDEX idx_teachers_active ON teachers(is_active);
```

### 6. Subjects Table
```sql
CREATE TABLE subjects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(20),
    description TEXT,
    is_core BOOLEAN DEFAULT true,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(school_id, name)
);

-- Indexes
CREATE INDEX idx_subjects_school_id ON subjects(school_id);
CREATE INDEX idx_subjects_name ON subjects(name);
CREATE INDEX idx_subjects_active ON subjects(is_active);
```

### 7. Timetable Table
```sql
CREATE TABLE timetable (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
    teacher_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6), -- 0=Sunday, 6=Saturday
    period_number INTEGER NOT NULL CHECK (period_number BETWEEN 1 AND 10),
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    room_number VARCHAR(20),
    academic_year VARCHAR(9) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(class_id, day_of_week, period_number, academic_year)
);

-- Indexes
CREATE INDEX idx_timetable_school_id ON timetable(school_id);
CREATE INDEX idx_timetable_class_id ON timetable(class_id);
CREATE INDEX idx_timetable_teacher_id ON timetable(teacher_id);
CREATE INDEX idx_timetable_day_period ON timetable(day_of_week, period_number);
CREATE INDEX idx_timetable_academic_year ON timetable(academic_year);
```

### 8. Attendance Table
```sql
CREATE TABLE attendance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('present', 'absent', 'late', 'excused')),
    marked_by UUID NOT NULL REFERENCES users(id),
    remarks TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(student_id, date)
);

-- Indexes
CREATE INDEX idx_attendance_student_id ON attendance(student_id);
CREATE INDEX idx_attendance_class_id ON attendance(class_id);
CREATE INDEX idx_attendance_date ON attendance(date);
CREATE INDEX idx_attendance_status ON attendance(status);
CREATE INDEX idx_attendance_marked_by ON attendance(marked_by);
CREATE INDEX idx_attendance_class_date ON attendance(class_id, date);
```

### 9. Homework Table
```sql
CREATE TABLE homework (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
    teacher_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    due_date TIMESTAMP WITH TIME ZONE NOT NULL,
    attachments JSONB, -- Array of file objects
    is_published BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_homework_class_id ON homework(class_id);
CREATE INDEX idx_homework_teacher_id ON homework(teacher_id);
CREATE INDEX idx_homework_due_date ON homework(due_date);
CREATE INDEX idx_homework_published ON homework(is_published);
```

### 10. Homework Submissions Table
```sql
CREATE TABLE homework_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    homework_id UUID NOT NULL REFERENCES homework(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    submission_text TEXT,
    attachments JSONB,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    graded_at TIMESTAMP WITH TIME ZONE,
    grade VARCHAR(10),
    feedback TEXT,
    is_late BOOLEAN DEFAULT false,
    
    UNIQUE(homework_id, student_id)
);

-- Indexes
CREATE INDEX idx_homework_submissions_homework_id ON homework_submissions(homework_id);
CREATE INDEX idx_homework_submissions_student_id ON homework_submissions(student_id);
CREATE INDEX idx_homework_submissions_submitted_at ON homework_submissions(submitted_at);
```

### 11. Notifications Table
```sql
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    recipient_id UUID REFERENCES users(id) ON DELETE CASCADE,
    recipient_type VARCHAR(20) CHECK (recipient_type IN ('all', 'class', 'parent', 'teacher', 'student')),
    recipient_class_id UUID REFERENCES classes(id),
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('announcement', 'homework', 'attendance', 'complaint', 'qa', 'general')),
    priority VARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_notifications_school_id ON notifications(school_id);
CREATE INDEX idx_notifications_sender_id ON notifications(sender_id);
CREATE INDEX idx_notifications_recipient_id ON notifications(recipient_id);
CREATE INDEX idx_notifications_type ON notifications(type);
CREATE INDEX idx_notifications_read ON notifications(is_read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);
```

### 12. Q&A Messages Table
```sql
CREATE TABLE qa_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    parent_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    class_teacher_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    reply TEXT,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'replied', 'closed')),
    priority VARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    replied_at TIMESTAMP WITH TIME ZONE,
    closed_at TIMESTAMP WITH TIME ZONE
);

-- Indexes
CREATE INDEX idx_qa_messages_parent_id ON qa_messages(parent_id);
CREATE INDEX idx_qa_messages_teacher_id ON qa_messages(class_teacher_id);
CREATE INDEX idx_qa_messages_student_id ON qa_messages(student_id);
CREATE INDEX idx_qa_messages_status ON qa_messages(status);
CREATE INDEX idx_qa_messages_created_at ON qa_messages(created_at);
```

### 13. Complaints Table
```sql
CREATE TABLE complaints (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    complainant_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    class_teacher_id UUID REFERENCES users(id),
    subject VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(50) CHECK (category IN ('academic', 'behavioral', 'disciplinary', 'other')),
    status VARCHAR(20) DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
    priority VARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    resolution TEXT,
    resolved_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    resolved_at TIMESTAMP WITH TIME ZONE,
    closed_at TIMESTAMP WITH TIME ZONE
);

-- Indexes
CREATE INDEX idx_complaints_student_id ON complaints(student_id);
CREATE INDEX idx_complaints_complainant_id ON complaints(complainant_id);
CREATE INDEX idx_complaints_teacher_id ON complaints(class_teacher_id);
CREATE INDEX idx_complaints_status ON complaints(status);
CREATE INDEX idx_complaints_category ON complaints(category);
CREATE INDEX idx_complaints_created_at ON complaints(created_at);
```

### 14. Grades/Marks Table
```sql
CREATE TABLE grades (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
    exam_type VARCHAR(50) NOT NULL, -- 'unit_test', 'mid_term', 'final', 'assignment'
    exam_name VARCHAR(255) NOT NULL,
    marks_obtained DECIMAL(5,2) NOT NULL,
    total_marks DECIMAL(5,2) NOT NULL,
    percentage DECIMAL(5,2),
    grade VARCHAR(5),
    exam_date DATE NOT NULL,
    teacher_id UUID NOT NULL REFERENCES users(id),
    remarks TEXT,
    academic_year VARCHAR(9) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_grades_student_id ON grades(student_id);
CREATE INDEX idx_grades_subject_id ON grades(subject_id);
CREATE INDEX idx_grades_exam_type ON grades(exam_type);
CREATE INDEX idx_grades_exam_date ON grades(exam_date);
CREATE INDEX idx_grades_academic_year ON grades(academic_year);
```

## 🔐 Security & Audit Tables

### 15. Audit Logs Table
```sql
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    table_name VARCHAR(100) NOT NULL,
    record_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_audit_logs_school_id ON audit_logs(school_id);
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_table_name ON audit_logs(table_name);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);
```

### 16. Sessions Table
```sql
CREATE TABLE sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    ip_address INET,
    user_agent TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_sessions_token_hash ON sessions(token_hash);
CREATE INDEX idx_sessions_expires_at ON sessions(expires_at);
CREATE INDEX idx_sessions_active ON sessions(is_active);
```

## 📈 Views for Common Queries

### Student Dashboard View
```sql
CREATE VIEW student_dashboard AS
SELECT 
    s.id as student_id,
    s.roll_number,
    u.first_name,
    u.last_name,
    c.name as class_name,
    c.section,
    COUNT(a.id) as total_attendance,
    COUNT(CASE WHEN a.status = 'present' THEN 1 END) as present_days,
    COUNT(CASE WHEN a.status = 'absent' THEN 1 END) as absent_days,
    ROUND(
        COUNT(CASE WHEN a.status = 'present' THEN 1 END) * 100.0 / 
        NULLIF(COUNT(a.id), 0), 2
    ) as attendance_percentage
FROM students s
JOIN users u ON s.user_id = u.id
JOIN classes c ON s.class_id = c.id
LEFT JOIN attendance a ON s.id = a.student_id 
    AND a.date >= CURRENT_DATE - INTERVAL '30 days'
WHERE s.is_active = true
GROUP BY s.id, s.roll_number, u.first_name, u.last_name, c.name, c.section;
```

### Teacher Workload View
```sql
CREATE VIEW teacher_workload AS
SELECT 
    t.id as teacher_id,
    u.first_name,
    u.last_name,
    COUNT(DISTINCT tt.class_id) as classes_count,
    COUNT(DISTINCT tt.subject_id) as subjects_count,
    COUNT(tt.id) as total_periods,
    COUNT(DISTINCT tt.day_of_week) as working_days
FROM teachers t
JOIN users u ON t.user_id = u.id
LEFT JOIN timetable tt ON t.user_id = tt.teacher_id 
    AND tt.is_active = true
WHERE t.is_active = true
GROUP BY t.id, u.first_name, u.last_name;
```

## 🔧 Database Functions & Triggers

### Update Timestamp Trigger
```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply to all tables
CREATE TRIGGER update_schools_updated_at BEFORE UPDATE ON schools FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_classes_updated_at BEFORE UPDATE ON classes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
-- ... (apply to all tables)
```

### Attendance Percentage Function
```sql
CREATE OR REPLACE FUNCTION calculate_attendance_percentage(
    p_student_id UUID,
    p_start_date DATE,
    p_end_date DATE
)
RETURNS DECIMAL AS $$
DECLARE
    total_days INTEGER;
    present_days INTEGER;
    percentage DECIMAL;
BEGIN
    SELECT COUNT(*), COUNT(CASE WHEN status = 'present' THEN 1 END)
    INTO total_days, present_days
    FROM attendance
    WHERE student_id = p_student_id
    AND date BETWEEN p_start_date AND p_end_date;
    
    IF total_days = 0 THEN
        RETURN 0;
    END IF;
    
    percentage := (present_days * 100.0) / total_days;
    RETURN ROUND(percentage, 2);
END;
$$ LANGUAGE plpgsql;
```

## 📊 Performance Optimization

### Indexing Strategy
- **Primary Keys**: UUID with default generation
- **Foreign Keys**: Indexed for join performance
- **Search Columns**: Email, phone, roll numbers
- **Composite Indexes**: Multi-column queries
- **Partial Indexes**: Active records only

### Partitioning Strategy
```sql
-- Partition attendance table by month
CREATE TABLE attendance_y2024m01 PARTITION OF attendance
FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');

CREATE TABLE attendance_y2024m02 PARTITION OF attendance
FOR VALUES FROM ('2024-02-01') TO ('2024-03-01');
```

## 🔒 Security Considerations

### Row Level Security (RLS)
```sql
-- Enable RLS on sensitive tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;

-- Create policies for school isolation
CREATE POLICY school_isolation ON users
FOR ALL TO authenticated
USING (school_id = current_setting('app.current_school_id')::UUID);
```

### Data Encryption
- Password hashing with bcrypt
- Sensitive data encryption at rest
- SSL/TLS for data in transit
- Secure session management

## 📋 Migration Strategy

### Version Control
- Prisma migrations for schema changes
- Backward compatibility maintenance
- Data migration scripts
- Rollback procedures

### Sample Migration
```sql
-- Example: Add new column with default value
ALTER TABLE users ADD COLUMN phone_verified BOOLEAN DEFAULT false;

-- Update existing records
UPDATE users SET phone_verified = true WHERE phone IS NOT NULL;

-- Add index
CREATE INDEX idx_users_phone_verified ON users(phone_verified);
```
