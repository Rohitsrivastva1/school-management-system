"""
Test Data Generator for School Management System
"""
import random
import string
from faker import Faker
from datetime import datetime, timedelta
import json
import os

class TestDataGenerator:
    """Generate test data for various test scenarios"""
    
    def __init__(self):
        self.fake = Faker()
        self.fake.seed_instance(42)  # For consistent test data
    
    def generate_user_data(self, role='student'):
        """Generate user data based on role"""
        base_data = {
            'firstName': self.fake.first_name(),
            'lastName': self.fake.last_name(),
            'email': self.fake.email(),
            'password': self.generate_password(),
            'phone': self.fake.phone_number()[:15],
            'dateOfBirth': self.fake.date_of_birth(minimum_age=5, maximum_age=65).strftime('%Y-%m-%d'),
            'gender': random.choice(['male', 'female', 'other']),
            'address': self.fake.address(),
            'isActive': True
        }
        
        if role == 'admin':
            base_data.update({
                'role': 'admin',
                'employeeId': f"ADM{random.randint(1000, 9999)}"
            })
        elif role == 'teacher':
            base_data.update({
                'role': 'teacher',
                'employeeId': f"TCH{random.randint(1000, 9999)}",
                'qualification': random.choice(['B.Ed', 'M.Ed', 'PhD', 'Masters']),
                'experienceYears': random.randint(1, 20),
                'subjects': random.sample(['Math', 'Science', 'English', 'History', 'Geography'], random.randint(1, 3)),
                'isClassTeacher': random.choice([True, False])
            })
        elif role == 'student':
            base_data.update({
                'role': 'student',
                'admissionNumber': f"STU{random.randint(10000, 99999)}",
                'admissionDate': self.fake.date_between(start_date='-2y', end_date='today').strftime('%Y-%m-%d'),
                'rollNumber': random.randint(1, 50),
                'fatherName': self.fake.name_male(),
                'motherName': self.fake.name_female(),
                'fatherPhone': self.fake.phone_number()[:15],
                'motherPhone': self.fake.phone_number()[:15],
                'classId': None  # Will be set when creating class
            })
        elif role == 'parent':
            base_data.update({
                'role': 'parent',
                'occupation': self.fake.job(),
                'relationship': random.choice(['father', 'mother', 'guardian'])
            })
        
        return base_data
    
    def generate_class_data(self):
        """Generate class data"""
        return {
            'name': f"Class {random.randint(1, 12)}",
            'section': random.choice(['A', 'B', 'C', 'D']),
            'academicYear': f"{datetime.now().year}-{datetime.now().year + 1}",
            'roomNumber': f"Room {random.randint(100, 999)}",
            'maxStudents': random.randint(30, 50),
            'isActive': True
        }
    
    def generate_subject_data(self):
        """Generate subject data"""
        subjects = [
            {'name': 'Mathematics', 'code': 'MATH', 'description': 'Core mathematics subject'},
            {'name': 'Science', 'code': 'SCI', 'description': 'General science subject'},
            {'name': 'English', 'code': 'ENG', 'description': 'English language and literature'},
            {'name': 'History', 'code': 'HIST', 'description': 'World and Indian history'},
            {'name': 'Geography', 'code': 'GEO', 'description': 'Physical and human geography'},
            {'name': 'Computer Science', 'code': 'CS', 'description': 'Computer programming and concepts'},
            {'name': 'Physical Education', 'code': 'PE', 'description': 'Sports and physical activities'},
            {'name': 'Art', 'code': 'ART', 'description': 'Visual arts and crafts'},
            {'name': 'Music', 'code': 'MUS', 'description': 'Music theory and practice'},
            {'name': 'Economics', 'code': 'ECON', 'description': 'Basic economic principles'}
        ]
        return random.choice(subjects)
    
    def generate_homework_data(self, class_id=None, subject_id=None, teacher_id=None):
        """Generate homework data"""
        return {
            'title': f"Homework {random.randint(1, 100)}",
            'description': self.fake.text(max_nb_chars=200),
            'dueDate': (datetime.now() + timedelta(days=random.randint(1, 7))).strftime('%Y-%m-%d'),
            'maxMarks': random.randint(10, 100),
            'classId': class_id,
            'subjectId': subject_id,
            'teacherId': teacher_id,
            'isPublished': random.choice([True, False])
        }
    
    def generate_attendance_data(self, student_id=None, class_id=None, teacher_id=None):
        """Generate attendance data"""
        return {
            'studentId': student_id,
            'classId': class_id,
            'date': datetime.now().strftime('%Y-%m-%d'),
            'status': random.choice(['present', 'absent', 'late', 'excused']),
            'markedBy': teacher_id,
            'remarks': self.fake.text(max_nb_chars=100) if random.choice([True, False]) else None
        }
    
    def generate_timetable_data(self, class_id=None, subject_id=None, teacher_id=None):
        """Generate timetable data"""
        days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
        periods = list(range(1, 9))
        
        return {
            'classId': class_id,
            'subjectId': subject_id,
            'teacherId': teacher_id,
            'dayOfWeek': random.choice(days),
            'periodNumber': random.choice(periods),
            'startTime': f"{random.randint(8, 15):02d}:00",
            'endTime': f"{random.randint(9, 16):02d}:00",
            'roomNumber': f"Room {random.randint(100, 999)}"
        }
    
    def generate_notification_data(self):
        """Generate notification data"""
        return {
            'title': f"Notification {random.randint(1, 100)}",
            'message': self.fake.text(max_nb_chars=500),
            'type': random.choice(['announcement', 'homework', 'attendance', 'complaint', 'qa', 'general']),
            'priority': random.choice(['low', 'medium', 'high', 'urgent']),
            'isActive': True
        }
    
    def generate_qa_message_data(self, student_id=None, parent_id=None):
        """Generate Q&A message data"""
        return {
            'studentId': student_id,
            'parentId': parent_id,
            'message': self.fake.text(max_nb_chars=300),
            'priority': random.choice(['low', 'medium', 'high']),
            'status': 'pending'
        }
    
    def generate_complaint_data(self, student_id=None, parent_id=None):
        """Generate complaint data"""
        return {
            'studentId': student_id,
            'parentId': parent_id,
            'subject': f"Complaint {random.randint(1, 100)}",
            'description': self.fake.text(max_nb_chars=500),
            'category': random.choice(['academic', 'behavioral', 'disciplinary', 'other']),
            'priority': random.choice(['low', 'medium', 'high', 'urgent']),
            'status': 'open'
        }
    
    def generate_grade_data(self, student_id=None, subject_id=None, teacher_id=None):
        """Generate grade data"""
        return {
            'studentId': student_id,
            'subjectId': subject_id,
            'teacherId': teacher_id,
            'examType': random.choice(['quiz', 'midterm', 'final', 'assignment', 'project']),
            'marksObtained': random.randint(0, 100),
            'maxMarks': 100,
            'grade': self.calculate_grade(random.randint(0, 100)),
            'remarks': self.fake.text(max_nb_chars=100) if random.choice([True, False]) else None
        }
    
    def generate_file_data(self):
        """Generate file upload data"""
        file_types = ['pdf', 'doc', 'docx', 'jpg', 'png', 'txt']
        file_type = random.choice(file_types)
        
        return {
            'fileName': f"test_file_{random.randint(1, 1000)}.{file_type}",
            'fileType': random.choice(['homework', 'profile', 'document', 'general']),
            'description': self.fake.text(max_nb_chars=100),
            'fileSize': random.randint(1024, 10485760)  # 1KB to 10MB
        }
    
    def generate_password(self, length=8):
        """Generate a random password"""
        characters = string.ascii_letters + string.digits + "!@#$%^&*"
        return ''.join(random.choice(characters) for _ in range(length))
    
    def calculate_grade(self, marks):
        """Calculate grade based on marks"""
        if marks >= 90:
            return 'A+'
        elif marks >= 80:
            return 'A'
        elif marks >= 70:
            return 'B+'
        elif marks >= 60:
            return 'B'
        elif marks >= 50:
            return 'C+'
        elif marks >= 40:
            return 'C'
        else:
            return 'F'
    
    def generate_invalid_data(self, data_type='user'):
        """Generate invalid data for negative testing"""
        invalid_data_sets = {
            'user': [
                {'email': 'invalid-email', 'password': '123'},  # Invalid email, short password
                {'email': '', 'password': ''},  # Empty fields
                {'email': 'test@test.com', 'password': 'a' * 100},  # Too long password
                {'firstName': '', 'lastName': ''},  # Empty names
                {'phone': 'invalid-phone'},  # Invalid phone
                {'dateOfBirth': 'invalid-date'},  # Invalid date
            ],
            'class': [
                {'name': '', 'section': ''},  # Empty fields
                {'name': 'A' * 100, 'section': 'B' * 100},  # Too long
                {'maxStudents': -1},  # Negative number
                {'maxStudents': 'invalid'},  # Invalid type
            ],
            'homework': [
                {'title': '', 'description': ''},  # Empty fields
                {'dueDate': 'invalid-date'},  # Invalid date
                {'maxMarks': -1},  # Negative marks
                {'maxMarks': 'invalid'},  # Invalid type
            ]
        }
        
        return random.choice(invalid_data_sets.get(data_type, []))
    
    def generate_edge_case_data(self, data_type='user'):
        """Generate edge case data"""
        edge_cases = {
            'user': {
                'email': 'a' * 50 + '@' + 'b' * 50 + '.com',  # Very long email
                'firstName': 'A',  # Single character
                'lastName': 'B' * 100,  # Very long last name
                'phone': '12345678901234567890',  # Very long phone
            },
            'class': {
                'name': 'A',  # Single character
                'section': 'B' * 100,  # Very long section
                'maxStudents': 0,  # Zero students
                'maxStudents': 999999,  # Very large number
            }
        }
        
        return edge_cases.get(data_type, {})
    
    def save_test_data(self, data, filename):
        """Save test data to file"""
        data_dir = os.path.join(os.path.dirname(__file__), '..', 'data')
        os.makedirs(data_dir, exist_ok=True)
        
        filepath = os.path.join(data_dir, filename)
        with open(filepath, 'w') as f:
            json.dump(data, f, indent=2)
        
        return filepath
    
    def load_test_data(self, filename):
        """Load test data from file"""
        data_dir = os.path.join(os.path.dirname(__file__), '..', 'data')
        filepath = os.path.join(data_dir, filename)
        
        if os.path.exists(filepath):
            with open(filepath, 'r') as f:
                return json.load(f)
        return None
