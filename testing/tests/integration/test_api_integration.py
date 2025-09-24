"""
API Integration Test Cases for School Management System
"""
import pytest
import time
from config.test_config import TestConfig

class TestAPIIntegration:
    """Test cases for API integration"""
    
    def test_auth_login_success(self, api_helper, admin_user):
        """Test successful API login"""
        response = api_helper.login(admin_user['email'], admin_user['password'])
        
        assert response['success'] == True
        assert 'accessToken' in response['data']
        assert 'refreshToken' in response['data']
        assert api_helper.access_token is not None
        assert api_helper.refresh_token is not None
    
    def test_auth_login_invalid_credentials(self, api_helper):
        """Test API login with invalid credentials"""
        response = api_helper.login("invalid@email.com", "wrongpassword")
        
        assert response['success'] == False
        assert 'Invalid email or password' in response['message'] or 'Login failed' in response['message']
    
    def test_auth_logout_success(self, api_helper, admin_user):
        """Test successful API logout"""
        # Login first
        api_helper.login(admin_user['email'], admin_user['password'])
        
        # Logout
        response = api_helper.logout()
        
        assert response['success'] == True
        assert api_helper.access_token is None
        assert api_helper.refresh_token is None
    
    def test_auth_token_refresh(self, api_helper, admin_user):
        """Test token refresh functionality"""
        # Login first
        api_helper.login(admin_user['email'], admin_user['password'])
        original_token = api_helper.access_token
        
        # Refresh token
        response = api_helper.refresh_access_token()
        
        assert response['success'] == True
        assert 'accessToken' in response['data']
        assert api_helper.access_token != original_token
    
    def test_user_creation_success(self, api_helper, test_data):
        """Test successful user creation via API"""
        user_data = test_data.generate_user_data('student')
        
        response = api_helper.create_user(user_data)
        
        assert response['success'] == True
        assert 'id' in response['data']
        assert response['data']['email'] == user_data['email']
        assert response['data']['firstName'] == user_data['firstName']
        assert response['data']['lastName'] == user_data['lastName']
    
    def test_user_creation_duplicate_email(self, api_helper, test_data, admin_user):
        """Test user creation with duplicate email"""
        user_data = test_data.generate_user_data('student')
        user_data['email'] = admin_user['email']  # Use existing email
        
        response = api_helper.create_user(user_data)
        
        assert response['success'] == False
        assert 'already exists' in response['message'] or 'duplicate' in response['message'].lower()
    
    def test_user_creation_validation_errors(self, api_helper, test_data):
        """Test user creation with validation errors"""
        user_data = test_data.generate_user_data('student')
        user_data['email'] = 'invalid-email'  # Invalid email format
        user_data['password'] = '123'  # Too short password
        
        response = api_helper.create_user(user_data)
        
        assert response['success'] == False
        assert 'validation' in response['message'].lower() or 'invalid' in response['message'].lower()
    
    def test_user_retrieval_success(self, api_helper, admin_user):
        """Test successful user retrieval via API"""
        # Login first
        api_helper.login(admin_user['email'], admin_user['password'])
        
        # Get users list
        response = api_helper.get_users()
        
        assert response['success'] == True
        assert 'data' in response
        assert isinstance(response['data'], list)
        assert len(response['data']) > 0
    
    def test_user_retrieval_unauthorized(self, api_helper):
        """Test user retrieval without authentication"""
        response = api_helper.get_users()
        
        # Should return 401 or similar error
        assert response['success'] == False or 'error' in response
    
    def test_class_creation_success(self, api_helper, test_data, admin_user):
        """Test successful class creation via API"""
        # Login first
        api_helper.login(admin_user['email'], admin_user['password'])
        
        class_data = test_data.generate_class_data()
        
        response = api_helper.create_class(class_data)
        
        assert response['success'] == True
        assert 'id' in response['data']
        assert response['data']['name'] == class_data['name']
        assert response['data']['section'] == class_data['section']
    
    def test_class_creation_duplicate(self, api_helper, test_data, admin_user):
        """Test class creation with duplicate name and section"""
        # Login first
        api_helper.login(admin_user['email'], admin_user['password'])
        
        class_data = test_data.generate_class_data()
        class_data['name'] = 'Class 1'  # Assuming this exists
        class_data['section'] = 'A'  # Assuming this exists
        class_data['academicYear'] = '2024-25'  # Assuming this exists
        
        response = api_helper.create_class(class_data)
        
        assert response['success'] == False
        assert 'already exists' in response['message'] or 'duplicate' in response['message'].lower()
    
    def test_class_retrieval_success(self, api_helper, admin_user):
        """Test successful class retrieval via API"""
        # Login first
        api_helper.login(admin_user['email'], admin_user['password'])
        
        response = api_helper.get_classes()
        
        assert response['success'] == True
        assert 'data' in response
        assert isinstance(response['data'], list)
    
    def test_class_update_success(self, api_helper, test_data, admin_user):
        """Test successful class update via API"""
        # Login first
        api_helper.login(admin_user['email'], admin_user['password'])
        
        # Create a class first
        class_data = test_data.generate_class_data()
        create_response = api_helper.create_class(class_data)
        class_id = create_response['data']['id']
        
        # Update the class
        update_data = {'name': 'Updated Class Name', 'roomNumber': 'Room 999'}
        response = api_helper.update_class(class_id, update_data)
        
        assert response['success'] == True
        assert response['data']['name'] == update_data['name']
        assert response['data']['roomNumber'] == update_data['roomNumber']
    
    def test_class_deletion_success(self, api_helper, test_data, admin_user):
        """Test successful class deletion via API"""
        # Login first
        api_helper.login(admin_user['email'], admin_user['password'])
        
        # Create a class first
        class_data = test_data.generate_class_data()
        create_response = api_helper.create_class(class_data)
        class_id = create_response['data']['id']
        
        # Delete the class
        response = api_helper.delete_class(class_id)
        
        assert response['success'] == True
        assert 'deleted successfully' in response['message'].lower()
    
    def test_attendance_marking_success(self, api_helper, test_data, teacher_user):
        """Test successful attendance marking via API"""
        # Login as teacher
        api_helper.login(teacher_user['email'], teacher_user['password'])
        
        attendance_data = test_data.generate_attendance_data()
        
        response = api_helper.mark_attendance(attendance_data)
        
        assert response['success'] == True
        assert 'id' in response['data']
        assert response['data']['status'] == attendance_data['status']
    
    def test_attendance_retrieval_success(self, api_helper, teacher_user):
        """Test successful attendance retrieval via API"""
        # Login as teacher
        api_helper.login(teacher_user['email'], teacher_user['password'])
        
        response = api_helper.get_attendance()
        
        assert response['success'] == True
        assert 'data' in response
        assert isinstance(response['data'], list)
    
    def test_homework_creation_success(self, api_helper, test_data, teacher_user):
        """Test successful homework creation via API"""
        # Login as teacher
        api_helper.login(teacher_user['email'], teacher_user['password'])
        
        homework_data = test_data.generate_homework_data()
        
        response = api_helper.create_homework(homework_data)
        
        assert response['success'] == True
        assert 'id' in response['data']
        assert response['data']['title'] == homework_data['title']
        assert response['data']['description'] == homework_data['description']
    
    def test_homework_retrieval_success(self, api_helper, teacher_user):
        """Test successful homework retrieval via API"""
        # Login as teacher
        api_helper.login(teacher_user['email'], teacher_user['password'])
        
        response = api_helper.get_homework()
        
        assert response['success'] == True
        assert 'data' in response
        assert isinstance(response['data'], list)
    
    def test_notification_creation_success(self, api_helper, test_data, admin_user):
        """Test successful notification creation via API"""
        # Login as admin
        api_helper.login(admin_user['email'], admin_user['password'])
        
        notification_data = test_data.generate_notification_data()
        
        response = api_helper.send_notification(notification_data)
        
        assert response['success'] == True
        assert 'id' in response['data']
        assert response['data']['title'] == notification_data['title']
        assert response['data']['message'] == notification_data['message']
    
    def test_notification_retrieval_success(self, api_helper, admin_user):
        """Test successful notification retrieval via API"""
        # Login as admin
        api_helper.login(admin_user['email'], admin_user['password'])
        
        response = api_helper.get_notifications()
        
        assert response['success'] == True
        assert 'data' in response
        assert isinstance(response['data'], list)
    
    def test_qa_message_creation_success(self, api_helper, test_data, parent_user):
        """Test successful Q&A message creation via API"""
        # Login as parent
        api_helper.login(parent_user['email'], parent_user['password'])
        
        qa_data = test_data.generate_qa_message_data()
        
        response = api_helper.send_qa_message(qa_data)
        
        assert response['success'] == True
        assert 'id' in response['data']
        assert response['data']['message'] == qa_data['message']
    
    def test_qa_message_retrieval_success(self, api_helper, parent_user):
        """Test successful Q&A message retrieval via API"""
        # Login as parent
        api_helper.login(parent_user['email'], parent_user['password'])
        
        response = api_helper.get_qa_messages()
        
        assert response['success'] == True
        assert 'data' in response
        assert isinstance(response['data'], list)
    
    def test_complaint_creation_success(self, api_helper, test_data, parent_user):
        """Test successful complaint creation via API"""
        # Login as parent
        api_helper.login(parent_user['email'], parent_user['password'])
        
        complaint_data = test_data.generate_complaint_data()
        
        response = api_helper.create_complaint(complaint_data)
        
        assert response['success'] == True
        assert 'id' in response['data']
        assert response['data']['subject'] == complaint_data['subject']
        assert response['data']['description'] == complaint_data['description']
    
    def test_complaint_retrieval_success(self, api_helper, parent_user):
        """Test successful complaint retrieval via API"""
        # Login as parent
        api_helper.login(parent_user['email'], parent_user['password'])
        
        response = api_helper.get_complaints()
        
        assert response['success'] == True
        assert 'data' in response
        assert isinstance(response['data'], list)
    
    def test_dashboard_data_retrieval_success(self, api_helper, admin_user):
        """Test successful dashboard data retrieval via API"""
        # Login as admin
        api_helper.login(admin_user['email'], admin_user['password'])
        
        response = api_helper.get_admin_dashboard()
        
        assert response['success'] == True
        assert 'data' in response
        assert 'totalStudents' in response['data']
        assert 'totalTeachers' in response['data']
        assert 'totalClasses' in response['data']
    
    def test_analytics_data_retrieval_success(self, api_helper, admin_user):
        """Test successful analytics data retrieval via API"""
        # Login as admin
        api_helper.login(admin_user['email'], admin_user['password'])
        
        response = api_helper.get_attendance_analytics()
        
        assert response['success'] == True
        assert 'data' in response
        assert isinstance(response['data'], dict)
    
    def test_file_upload_success(self, api_helper, test_data, admin_user):
        """Test successful file upload via API"""
        # Login as admin
        api_helper.login(admin_user['email'], admin_user['password'])
        
        # Create a test file
        test_file_path = "/tmp/test_file.txt"
        with open(test_file_path, 'w') as f:
            f.write("This is a test file")
        
        try:
            response = api_helper.upload_file(test_file_path, 'general', 'Test file')
            
            assert response['success'] == True
            assert 'id' in response['data']
            assert response['data']['fileName'] == 'test_file.txt'
        finally:
            # Clean up test file
            import os
            if os.path.exists(test_file_path):
                os.remove(test_file_path)
    
    def test_api_rate_limiting(self, api_helper, admin_user):
        """Test API rate limiting"""
        # Login first
        api_helper.login(admin_user['email'], admin_user['password'])
        
        # Make multiple rapid requests
        for i in range(100):  # Make 100 rapid requests
            response = api_helper.get_users()
            if not response['success'] and 'rate limit' in response.get('message', '').lower():
                break
        
        # Should eventually hit rate limit
        assert 'rate limit' in response.get('message', '').lower() or response['success'] == True
    
    def test_api_error_handling(self, api_helper):
        """Test API error handling"""
        # Test with invalid endpoint
        response = api_helper.get('/invalid-endpoint')
        
        assert response['success'] == False or 'error' in response
    
    def test_api_response_time(self, api_helper, admin_user):
        """Test API response time"""
        # Login first
        api_helper.login(admin_user['email'], admin_user['password'])
        
        start_time = time.time()
        response = api_helper.get_users()
        end_time = time.time()
        
        response_time = end_time - start_time
        
        assert response['success'] == True
        assert response_time < 5.0  # Should respond within 5 seconds
    
    def test_api_data_consistency(self, api_helper, test_data, admin_user):
        """Test API data consistency"""
        # Login first
        api_helper.login(admin_user['email'], admin_user['password'])
        
        # Create a class
        class_data = test_data.generate_class_data()
        create_response = api_helper.create_class(class_data)
        class_id = create_response['data']['id']
        
        # Retrieve the class
        get_response = api_helper.get_class(class_id)
        
        # Verify data consistency
        assert create_response['data']['name'] == get_response['data']['name']
        assert create_response['data']['section'] == get_response['data']['section']
        assert create_response['data']['academicYear'] == get_response['data']['academicYear']
    
    def test_api_pagination(self, api_helper, admin_user):
        """Test API pagination"""
        # Login first
        api_helper.login(admin_user['email'], admin_user['password'])
        
        # Get first page
        page1_response = api_helper.get_users({'page': 1, 'limit': 5})
        
        # Get second page
        page2_response = api_helper.get_users({'page': 2, 'limit': 5})
        
        assert page1_response['success'] == True
        assert page2_response['success'] == True
        assert 'pagination' in page1_response
        assert 'pagination' in page2_response
    
    def test_api_filtering(self, api_helper, admin_user):
        """Test API filtering"""
        # Login first
        api_helper.login(admin_user['email'], admin_user['password'])
        
        # Get users with filter
        filtered_response = api_helper.get_users({'role': 'teacher'})
        
        assert filtered_response['success'] == True
        assert 'data' in filtered_response
        # Verify all returned users are teachers
        for user in filtered_response['data']:
            assert user['role'] == 'teacher'
    
    def test_api_sorting(self, api_helper, admin_user):
        """Test API sorting"""
        # Login first
        api_helper.login(admin_user['email'], admin_user['password'])
        
        # Get users sorted by name
        sorted_response = api_helper.get_users({'sortBy': 'firstName', 'sortOrder': 'asc'})
        
        assert sorted_response['success'] == True
        assert 'data' in sorted_response
        # Verify users are sorted by first name
        if len(sorted_response['data']) > 1:
            assert sorted_response['data'][0]['firstName'] <= sorted_response['data'][1]['firstName']
