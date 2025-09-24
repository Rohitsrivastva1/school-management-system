"""
Database Helper for School Management System Testing
"""
import psycopg2
import psycopg2.extras
from typing import Dict, Any, List, Optional
from config.test_config import TestConfig

class DatabaseHelper:
    """Helper class for database operations during testing"""
    
    def __init__(self):
        self.connection = None
        self.cursor = None
        self.connect()
    
    def connect(self):
        """Connect to database"""
        try:
            self.connection = psycopg2.connect(
                host=TestConfig.DB_HOST,
                port=TestConfig.DB_PORT,
                database=TestConfig.DB_NAME,
                user=TestConfig.DB_USER,
                password=TestConfig.DB_PASSWORD
            )
            self.cursor = self.connection.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        except Exception as e:
            print(f"Database connection failed: {e}")
            raise
    
    def disconnect(self):
        """Disconnect from database"""
        if self.cursor:
            self.cursor.close()
        if self.connection:
            self.connection.close()
    
    def execute_query(self, query: str, params: tuple = None) -> List[Dict[str, Any]]:
        """Execute SELECT query and return results"""
        try:
            self.cursor.execute(query, params)
            return self.cursor.fetchall()
        except Exception as e:
            print(f"Query execution failed: {e}")
            raise
    
    def execute_update(self, query: str, params: tuple = None) -> int:
        """Execute INSERT/UPDATE/DELETE query and return affected rows"""
        try:
            self.cursor.execute(query, params)
            self.connection.commit()
            return self.cursor.rowcount
        except Exception as e:
            self.connection.rollback()
            print(f"Update execution failed: {e}")
            raise
    
    def get_user_by_email(self, email: str) -> Optional[Dict[str, Any]]:
        """Get user by email"""
        query = "SELECT * FROM users WHERE email = %s"
        results = self.execute_query(query, (email,))
        return results[0] if results else None
    
    def get_user_by_id(self, user_id: str) -> Optional[Dict[str, Any]]:
        """Get user by ID"""
        query = "SELECT * FROM users WHERE id = %s"
        results = self.execute_query(query, (user_id,))
        return results[0] if results else None
    
    def create_user(self, user_data: Dict[str, Any]) -> str:
        """Create user and return ID"""
        query = """
        INSERT INTO users (id, school_id, first_name, last_name, email, password_hash, 
                          phone, date_of_birth, gender, address, role, is_active, created_at, updated_at)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, NOW(), NOW())
        RETURNING id
        """
        
        params = (
            user_data.get('id'),
            user_data.get('schoolId'),
            user_data.get('firstName'),
            user_data.get('lastName'),
            user_data.get('email'),
            user_data.get('passwordHash'),
            user_data.get('phone'),
            user_data.get('dateOfBirth'),
            user_data.get('gender'),
            user_data.get('address'),
            user_data.get('role'),
            user_data.get('isActive', True)
        )
        
        result = self.execute_query(query, params)
        return result[0]['id'] if result else None
    
    def delete_user(self, user_id: str) -> bool:
        """Delete user by ID"""
        query = "DELETE FROM users WHERE id = %s"
        affected_rows = self.execute_update(query, (user_id,))
        return affected_rows > 0
    
    def get_class_by_id(self, class_id: str) -> Optional[Dict[str, Any]]:
        """Get class by ID"""
        query = "SELECT * FROM classes WHERE id = %s"
        results = self.execute_query(query, (class_id,))
        return results[0] if results else None
    
    def create_class(self, class_data: Dict[str, Any]) -> str:
        """Create class and return ID"""
        query = """
        INSERT INTO classes (id, school_id, name, section, academic_year, class_teacher_id,
                           max_students, room_number, is_active, created_at, updated_at)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, NOW(), NOW())
        RETURNING id
        """
        
        params = (
            class_data.get('id'),
            class_data.get('schoolId'),
            class_data.get('name'),
            class_data.get('section'),
            class_data.get('academicYear'),
            class_data.get('classTeacherId'),
            class_data.get('maxStudents'),
            class_data.get('roomNumber'),
            class_data.get('isActive', True)
        )
        
        result = self.execute_query(query, params)
        return result[0]['id'] if result else None
    
    def delete_class(self, class_id: str) -> bool:
        """Delete class by ID"""
        query = "DELETE FROM classes WHERE id = %s"
        affected_rows = self.execute_update(query, (class_id,))
        return affected_rows > 0
    
    def get_attendance_by_date(self, date: str, class_id: str = None) -> List[Dict[str, Any]]:
        """Get attendance records by date"""
        if class_id:
            query = "SELECT * FROM attendance WHERE date = %s AND class_id = %s"
            params = (date, class_id)
        else:
            query = "SELECT * FROM attendance WHERE date = %s"
            params = (date,)
        
        return self.execute_query(query, params)
    
    def create_attendance(self, attendance_data: Dict[str, Any]) -> str:
        """Create attendance record and return ID"""
        query = """
        INSERT INTO attendance (id, student_id, class_id, date, status, marked_by, remarks, created_at, updated_at)
        VALUES (%s, %s, %s, %s, %s, %s, %s, NOW(), NOW())
        RETURNING id
        """
        
        params = (
            attendance_data.get('id'),
            attendance_data.get('studentId'),
            attendance_data.get('classId'),
            attendance_data.get('date'),
            attendance_data.get('status'),
            attendance_data.get('markedBy'),
            attendance_data.get('remarks')
        )
        
        result = self.execute_query(query, params)
        return result[0]['id'] if result else None
    
    def get_homework_by_id(self, homework_id: str) -> Optional[Dict[str, Any]]:
        """Get homework by ID"""
        query = "SELECT * FROM homework WHERE id = %s"
        results = self.execute_query(query, (homework_id,))
        return results[0] if results else None
    
    def create_homework(self, homework_data: Dict[str, Any]) -> str:
        """Create homework and return ID"""
        query = """
        INSERT INTO homework (id, class_id, subject_id, teacher_id, title, description,
                            due_date, max_marks, is_published, created_at, updated_at)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, NOW(), NOW())
        RETURNING id
        """
        
        params = (
            homework_data.get('id'),
            homework_data.get('classId'),
            homework_data.get('subjectId'),
            homework_data.get('teacherId'),
            homework_data.get('title'),
            homework_data.get('description'),
            homework_data.get('dueDate'),
            homework_data.get('maxMarks'),
            homework_data.get('isPublished', False)
        )
        
        result = self.execute_query(query, params)
        return result[0]['id'] if result else None
    
    def delete_homework(self, homework_id: str) -> bool:
        """Delete homework by ID"""
        query = "DELETE FROM homework WHERE id = %s"
        affected_rows = self.execute_update(query, (homework_id,))
        return affected_rows > 0
    
    def get_notification_by_id(self, notification_id: str) -> Optional[Dict[str, Any]]:
        """Get notification by ID"""
        query = "SELECT * FROM notifications WHERE id = %s"
        results = self.execute_query(query, (notification_id,))
        return results[0] if results else None
    
    def create_notification(self, notification_data: Dict[str, Any]) -> str:
        """Create notification and return ID"""
        query = """
        INSERT INTO notifications (id, school_id, title, message, type, priority, is_active, created_at, updated_at)
        VALUES (%s, %s, %s, %s, %s, %s, %s, NOW(), NOW())
        RETURNING id
        """
        
        params = (
            notification_data.get('id'),
            notification_data.get('schoolId'),
            notification_data.get('title'),
            notification_data.get('message'),
            notification_data.get('type'),
            notification_data.get('priority'),
            notification_data.get('isActive', True)
        )
        
        result = self.execute_query(query, params)
        return result[0]['id'] if result else None
    
    def get_qa_message_by_id(self, qa_id: str) -> Optional[Dict[str, Any]]:
        """Get Q&A message by ID"""
        query = "SELECT * FROM qa_messages WHERE id = %s"
        results = self.execute_query(query, (qa_id,))
        return results[0] if results else None
    
    def create_qa_message(self, qa_data: Dict[str, Any]) -> str:
        """Create Q&A message and return ID"""
        query = """
        INSERT INTO qa_messages (id, student_id, parent_id, message, priority, status, created_at, updated_at)
        VALUES (%s, %s, %s, %s, %s, %s, NOW(), NOW())
        RETURNING id
        """
        
        params = (
            qa_data.get('id'),
            qa_data.get('studentId'),
            qa_data.get('parentId'),
            qa_data.get('message'),
            qa_data.get('priority'),
            qa_data.get('status', 'pending')
        )
        
        result = self.execute_query(query, params)
        return result[0]['id'] if result else None
    
    def get_complaint_by_id(self, complaint_id: str) -> Optional[Dict[str, Any]]:
        """Get complaint by ID"""
        query = "SELECT * FROM complaints WHERE id = %s"
        results = self.execute_query(query, (complaint_id,))
        return results[0] if results else None
    
    def create_complaint(self, complaint_data: Dict[str, Any]) -> str:
        """Create complaint and return ID"""
        query = """
        INSERT INTO complaints (id, student_id, parent_id, subject, description, category,
                              priority, status, created_at, updated_at)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, NOW(), NOW())
        RETURNING id
        """
        
        params = (
            complaint_data.get('id'),
            complaint_data.get('studentId'),
            complaint_data.get('parentId'),
            complaint_data.get('subject'),
            complaint_data.get('description'),
            complaint_data.get('category'),
            complaint_data.get('priority'),
            complaint_data.get('status', 'open')
        )
        
        result = self.execute_query(query, params)
        return result[0]['id'] if result else None
    
    def cleanup_test_data(self, table: str, condition: str = None):
        """Clean up test data from specified table"""
        if condition:
            query = f"DELETE FROM {table} WHERE {condition}"
        else:
            query = f"DELETE FROM {table} WHERE created_at > NOW() - INTERVAL '1 hour'"
        
        affected_rows = self.execute_update(query)
        return affected_rows
    
    def get_table_count(self, table: str, condition: str = None) -> int:
        """Get count of records in table"""
        if condition:
            query = f"SELECT COUNT(*) FROM {table} WHERE {condition}"
        else:
            query = f"SELECT COUNT(*) FROM {table}"
        
        result = self.execute_query(query)
        return result[0]['count'] if result else 0
    
    def verify_data_integrity(self, table: str, record_id: str) -> bool:
        """Verify data integrity for a record"""
        query = f"SELECT * FROM {table} WHERE id = %s"
        result = self.execute_query(query, (record_id,))
        return len(result) > 0
    
    def get_recent_records(self, table: str, limit: int = 10) -> List[Dict[str, Any]]:
        """Get recent records from table"""
        query = f"SELECT * FROM {table} ORDER BY created_at DESC LIMIT %s"
        return self.execute_query(query, (limit,))
    
    def __enter__(self):
        """Context manager entry"""
        return self
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        """Context manager exit"""
        self.disconnect()
