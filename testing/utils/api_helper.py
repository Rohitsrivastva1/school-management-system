"""
API Helper for School Management System Testing
"""
import requests
import json
import time
from typing import Dict, Any, Optional
from config.test_config import TestConfig

class APIHelper:
    """Helper class for API testing"""
    
    def __init__(self):
        self.base_url = TestConfig.API_BASE_URL
        self.session = requests.Session()
        self.session.timeout = TestConfig.API_TIMEOUT
        self.access_token = None
        self.refresh_token = None
    
    def set_headers(self, headers: Dict[str, str] = None):
        """Set request headers"""
        default_headers = {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        }
        
        if self.access_token:
            default_headers['Authorization'] = f'Bearer {self.access_token}'
        
        if headers:
            default_headers.update(headers)
        
        self.session.headers.update(default_headers)
    
    def login(self, email: str, password: str) -> Dict[str, Any]:
        """Login and get access token"""
        url = f"{self.base_url}/auth/login"
        data = {
            'email': email,
            'password': password
        }
        
        response = self.session.post(url, json=data)
        response.raise_for_status()
        
        result = response.json()
        if result.get('success'):
            self.access_token = result['data']['accessToken']
            self.refresh_token = result['data']['refreshToken']
            self.set_headers()
        
        return result
    
    def logout(self) -> Dict[str, Any]:
        """Logout and clear tokens"""
        url = f"{self.base_url}/auth/logout"
        
        if self.refresh_token:
            data = {'refreshToken': self.refresh_token}
            response = self.session.post(url, json=data)
        else:
            response = self.session.post(url)
        
        self.access_token = None
        self.refresh_token = None
        self.set_headers()
        
        return response.json() if response.status_code == 200 else {'success': True}
    
    def refresh_access_token(self) -> Dict[str, Any]:
        """Refresh access token"""
        if not self.refresh_token:
            raise ValueError("No refresh token available")
        
        url = f"{self.base_url}/auth/refresh"
        data = {'refreshToken': self.refresh_token}
        
        response = self.session.post(url, json=data)
        response.raise_for_status()
        
        result = response.json()
        if result.get('success'):
            self.access_token = result['data']['accessToken']
            self.set_headers()
        
        return result
    
    def get(self, endpoint: str, params: Dict[str, Any] = None) -> Dict[str, Any]:
        """Make GET request"""
        url = f"{self.base_url}{endpoint}"
        response = self.session.get(url, params=params)
        response.raise_for_status()
        return response.json()
    
    def post(self, endpoint: str, data: Dict[str, Any] = None, files: Dict[str, Any] = None) -> Dict[str, Any]:
        """Make POST request"""
        url = f"{self.base_url}{endpoint}"
        
        if files:
            # Remove Content-Type header for file uploads
            headers = {k: v for k, v in self.session.headers.items() if k.lower() != 'content-type'}
            response = self.session.post(url, data=data, files=files, headers=headers)
        else:
            response = self.session.post(url, json=data)
        
        response.raise_for_status()
        return response.json()
    
    def put(self, endpoint: str, data: Dict[str, Any] = None) -> Dict[str, Any]:
        """Make PUT request"""
        url = f"{self.base_url}{endpoint}"
        response = self.session.put(url, json=data)
        response.raise_for_status()
        return response.json()
    
    def delete(self, endpoint: str) -> Dict[str, Any]:
        """Make DELETE request"""
        url = f"{self.base_url}{endpoint}"
        response = self.session.delete(url)
        response.raise_for_status()
        return response.json()
    
    def patch(self, endpoint: str, data: Dict[str, Any] = None) -> Dict[str, Any]:
        """Make PATCH request"""
        url = f"{self.base_url}{endpoint}"
        response = self.session.patch(url, json=data)
        response.raise_for_status()
        return response.json()
    
    # User Management APIs
    def create_user(self, user_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create a new user"""
        return self.post('/users', user_data)
    
    def get_users(self, params: Dict[str, Any] = None) -> Dict[str, Any]:
        """Get users list"""
        return self.get('/users', params)
    
    def get_user(self, user_id: str) -> Dict[str, Any]:
        """Get user by ID"""
        return self.get(f'/users/{user_id}')
    
    def update_user(self, user_id: str, user_data: Dict[str, Any]) -> Dict[str, Any]:
        """Update user"""
        return self.put(f'/users/{user_id}', user_data)
    
    def delete_user(self, user_id: str) -> Dict[str, Any]:
        """Delete user"""
        return self.delete(f'/users/{user_id}')
    
    # Class Management APIs
    def create_class(self, class_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create a new class"""
        return self.post('/classes', class_data)
    
    def get_classes(self, params: Dict[str, Any] = None) -> Dict[str, Any]:
        """Get classes list"""
        return self.get('/classes', params)
    
    def get_class(self, class_id: str) -> Dict[str, Any]:
        """Get class by ID"""
        return self.get(f'/classes/{class_id}')
    
    def update_class(self, class_id: str, class_data: Dict[str, Any]) -> Dict[str, Any]:
        """Update class"""
        return self.put(f'/classes/{class_id}', class_data)
    
    def delete_class(self, class_id: str) -> Dict[str, Any]:
        """Delete class"""
        return self.delete(f'/classes/{class_id}')
    
    # Attendance Management APIs
    def mark_attendance(self, attendance_data: Dict[str, Any]) -> Dict[str, Any]:
        """Mark attendance"""
        return self.post('/attendance', attendance_data)
    
    def get_attendance(self, params: Dict[str, Any] = None) -> Dict[str, Any]:
        """Get attendance records"""
        return self.get('/attendance', params)
    
    def get_attendance_by_class(self, class_id: str, params: Dict[str, Any] = None) -> Dict[str, Any]:
        """Get attendance by class"""
        return self.get(f'/attendance/class/{class_id}', params)
    
    def get_attendance_by_student(self, student_id: str, params: Dict[str, Any] = None) -> Dict[str, Any]:
        """Get attendance by student"""
        return self.get(f'/attendance/student/{student_id}', params)
    
    # Homework Management APIs
    def create_homework(self, homework_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create homework"""
        return self.post('/homework', homework_data)
    
    def get_homework(self, params: Dict[str, Any] = None) -> Dict[str, Any]:
        """Get homework list"""
        return self.get('/homework', params)
    
    def get_homework_by_id(self, homework_id: str) -> Dict[str, Any]:
        """Get homework by ID"""
        return self.get(f'/homework/{homework_id}')
    
    def update_homework(self, homework_id: str, homework_data: Dict[str, Any]) -> Dict[str, Any]:
        """Update homework"""
        return self.put(f'/homework/{homework_id}', homework_data)
    
    def delete_homework(self, homework_id: str) -> Dict[str, Any]:
        """Delete homework"""
        return self.delete(f'/homework/{homework_id}')
    
    # Notification APIs
    def send_notification(self, notification_data: Dict[str, Any]) -> Dict[str, Any]:
        """Send notification"""
        return self.post('/notifications', notification_data)
    
    def get_notifications(self, params: Dict[str, Any] = None) -> Dict[str, Any]:
        """Get notifications"""
        return self.get('/notifications', params)
    
    def mark_notification_read(self, notification_id: str) -> Dict[str, Any]:
        """Mark notification as read"""
        return self.put(f'/notifications/{notification_id}')
    
    # Q&A APIs
    def send_qa_message(self, qa_data: Dict[str, Any]) -> Dict[str, Any]:
        """Send Q&A message"""
        return self.post('/qa', qa_data)
    
    def get_qa_messages(self, params: Dict[str, Any] = None) -> Dict[str, Any]:
        """Get Q&A messages"""
        return self.get('/qa', params)
    
    def reply_to_qa(self, qa_id: str, reply_data: Dict[str, Any]) -> Dict[str, Any]:
        """Reply to Q&A message"""
        return self.put(f'/qa/{qa_id}/reply', reply_data)
    
    # Complaint APIs
    def create_complaint(self, complaint_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create complaint"""
        return self.post('/complaints', complaint_data)
    
    def get_complaints(self, params: Dict[str, Any] = None) -> Dict[str, Any]:
        """Get complaints"""
        return self.get('/complaints', params)
    
    def update_complaint(self, complaint_id: str, complaint_data: Dict[str, Any]) -> Dict[str, Any]:
        """Update complaint"""
        return self.put(f'/complaints/{complaint_id}', complaint_data)
    
    # Dashboard APIs
    def get_admin_dashboard(self) -> Dict[str, Any]:
        """Get admin dashboard data"""
        return self.get('/dashboard/admin')
    
    def get_teacher_dashboard(self) -> Dict[str, Any]:
        """Get teacher dashboard data"""
        return self.get('/dashboard/teacher')
    
    def get_student_dashboard(self) -> Dict[str, Any]:
        """Get student dashboard data"""
        return self.get('/dashboard/student')
    
    def get_parent_dashboard(self, student_id: str = None) -> Dict[str, Any]:
        """Get parent dashboard data"""
        params = {'studentId': student_id} if student_id else None
        return self.get('/dashboard/parent', params)
    
    # Analytics APIs
    def get_attendance_analytics(self, params: Dict[str, Any] = None) -> Dict[str, Any]:
        """Get attendance analytics"""
        return self.get('/analytics/attendance', params)
    
    def get_performance_analytics(self, params: Dict[str, Any] = None) -> Dict[str, Any]:
        """Get performance analytics"""
        return self.get('/analytics/performance', params)
    
    def get_class_analytics(self, params: Dict[str, Any] = None) -> Dict[str, Any]:
        """Get class analytics"""
        return self.get('/analytics/class', params)
    
    # File Upload APIs
    def upload_file(self, file_path: str, file_type: str = 'general', description: str = None) -> Dict[str, Any]:
        """Upload file"""
        with open(file_path, 'rb') as f:
            files = {'file': f}
            data = {
                'fileType': file_type,
                'description': description or ''
            }
            return self.post('/files/upload', data=data, files=files)
    
    def get_file(self, file_id: str) -> Dict[str, Any]:
        """Get file information"""
        return self.get(f'/files/{file_id}')
    
    def delete_file(self, file_id: str) -> Dict[str, Any]:
        """Delete file"""
        return self.delete(f'/files/{file_id}')
    
    def verify_response(self, response: Dict[str, Any], expected_status: int = 200, 
                       expected_fields: list = None) -> bool:
        """Verify API response"""
        if not response:
            return False
        
        if expected_fields:
            for field in expected_fields:
                if field not in response:
                    return False
        
        return True
    
    def wait_for_condition(self, condition_func, timeout: int = 30, interval: float = 1.0) -> bool:
        """Wait for a condition to be true"""
        start_time = time.time()
        
        while time.time() - start_time < timeout:
            if condition_func():
                return True
            time.sleep(interval)
        
        return False
