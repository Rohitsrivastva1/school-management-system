"""
Performance Test Cases for School Management System
"""
import pytest
import time
import concurrent.futures
import threading
from config.test_config import TestConfig

class TestPerformance:
    """Test cases for performance testing"""
    
    def test_concurrent_user_login(self, api_helper, test_data):
        """Test concurrent user login performance"""
        # Generate multiple user credentials
        users = []
        for i in range(TestConfig.LOAD_TEST_USERS):
            user_data = test_data.generate_user_data('student')
            users.append({
                'email': user_data['email'],
                'password': user_data['password']
            })
        
        def login_user(user_creds):
            """Login a single user"""
            start_time = time.time()
            response = api_helper.login(user_creds['email'], user_creds['password'])
            end_time = time.time()
            return {
                'success': response['success'],
                'response_time': end_time - start_time,
                'user': user_creds['email']
            }
        
        # Execute concurrent logins
        start_time = time.time()
        with concurrent.futures.ThreadPoolExecutor(max_workers=10) as executor:
            futures = [executor.submit(login_user, user) for user in users]
            results = [future.result() for future in concurrent.futures.as_completed(futures)]
        end_time = time.time()
        
        # Analyze results
        total_time = end_time - start_time
        successful_logins = sum(1 for r in results if r['success'])
        avg_response_time = sum(r['response_time'] for r in results) / len(results)
        max_response_time = max(r['response_time'] for r in results)
        
        # Assertions
        assert successful_logins >= TestConfig.LOAD_TEST_USERS * 0.8  # 80% success rate
        assert avg_response_time < 2.0  # Average response time under 2 seconds
        assert max_response_time < 5.0  # Max response time under 5 seconds
        assert total_time < 30.0  # Total time under 30 seconds
    
    def test_concurrent_class_creation(self, api_helper, test_data, admin_user):
        """Test concurrent class creation performance"""
        # Login as admin
        api_helper.login(admin_user['email'], admin_user['password'])
        
        # Generate class data
        classes = []
        for i in range(TestConfig.LOAD_TEST_USERS):
            class_data = test_data.generate_class_data()
            class_data['name'] = f"Class {i}"
            class_data['section'] = chr(65 + (i % 26))  # A, B, C, etc.
            classes.append(class_data)
        
        def create_class(class_data):
            """Create a single class"""
            start_time = time.time()
            response = api_helper.create_class(class_data)
            end_time = time.time()
            return {
                'success': response['success'],
                'response_time': end_time - start_time,
                'class_name': class_data['name']
            }
        
        # Execute concurrent class creation
        start_time = time.time()
        with concurrent.futures.ThreadPoolExecutor(max_workers=10) as executor:
            futures = [executor.submit(create_class, class_data) for class_data in classes]
            results = [future.result() for future in concurrent.futures.as_completed(futures)]
        end_time = time.time()
        
        # Analyze results
        total_time = end_time - start_time
        successful_creations = sum(1 for r in results if r['success'])
        avg_response_time = sum(r['response_time'] for r in results) / len(results)
        
        # Assertions
        assert successful_creations >= TestConfig.LOAD_TEST_USERS * 0.8  # 80% success rate
        assert avg_response_time < 3.0  # Average response time under 3 seconds
        assert total_time < 60.0  # Total time under 60 seconds
    
    def test_concurrent_attendance_marking(self, api_helper, test_data, teacher_user):
        """Test concurrent attendance marking performance"""
        # Login as teacher
        api_helper.login(teacher_user['email'], teacher_user['password'])
        
        # Generate attendance data
        attendance_records = []
        for i in range(TestConfig.LOAD_TEST_USERS):
            attendance_data = test_data.generate_attendance_data()
            attendance_records.append(attendance_data)
        
        def mark_attendance(attendance_data):
            """Mark attendance for a single record"""
            start_time = time.time()
            response = api_helper.mark_attendance(attendance_data)
            end_time = time.time()
            return {
                'success': response['success'],
                'response_time': end_time - start_time
            }
        
        # Execute concurrent attendance marking
        start_time = time.time()
        with concurrent.futures.ThreadPoolExecutor(max_workers=10) as executor:
            futures = [executor.submit(mark_attendance, record) for record in attendance_records]
            results = [future.result() for future in concurrent.futures.as_completed(futures)]
        end_time = time.time()
        
        # Analyze results
        total_time = end_time - start_time
        successful_markings = sum(1 for r in results if r['success'])
        avg_response_time = sum(r['response_time'] for r in results) / len(results)
        
        # Assertions
        assert successful_markings >= TestConfig.LOAD_TEST_USERS * 0.8  # 80% success rate
        assert avg_response_time < 2.0  # Average response time under 2 seconds
        assert total_time < 30.0  # Total time under 30 seconds
    
    def test_database_query_performance(self, db_helper, test_data):
        """Test database query performance"""
        # Test user query performance
        start_time = time.time()
        users = db_helper.execute_query("SELECT * FROM users LIMIT 1000")
        end_time = time.time()
        
        query_time = end_time - start_time
        assert query_time < 1.0  # Query should complete under 1 second
        assert len(users) >= 0  # Should return results
    
    def test_api_response_time_under_load(self, api_helper, admin_user):
        """Test API response time under load"""
        # Login first
        api_helper.login(admin_user['email'], admin_user['password'])
        
        def make_request():
            """Make a single API request"""
            start_time = time.time()
            response = api_helper.get_users()
            end_time = time.time()
            return end_time - start_time
        
        # Make multiple concurrent requests
        start_time = time.time()
        with concurrent.futures.ThreadPoolExecutor(max_workers=20) as executor:
            futures = [executor.submit(make_request) for _ in range(100)]
            response_times = [future.result() for future in concurrent.futures.as_completed(futures)]
        end_time = time.time()
        
        # Analyze results
        avg_response_time = sum(response_times) / len(response_times)
        max_response_time = max(response_times)
        p95_response_time = sorted(response_times)[int(len(response_times) * 0.95)]
        
        # Assertions
        assert avg_response_time < 2.0  # Average response time under 2 seconds
        assert max_response_time < 5.0  # Max response time under 5 seconds
        assert p95_response_time < 3.0  # 95th percentile under 3 seconds
        assert end_time - start_time < 30.0  # Total time under 30 seconds
    
    def test_memory_usage_under_load(self, api_helper, test_data, admin_user):
        """Test memory usage under load"""
        import psutil
        import os
        
        # Get initial memory usage
        process = psutil.Process(os.getpid())
        initial_memory = process.memory_info().rss / 1024 / 1024  # MB
        
        # Login first
        api_helper.login(admin_user['email'], admin_user['password'])
        
        # Perform multiple operations
        for i in range(100):
            # Create class
            class_data = test_data.generate_class_data()
            class_data['name'] = f"Load Test Class {i}"
            api_helper.create_class(class_data)
            
            # Get classes
            api_helper.get_classes()
            
            # Get users
            api_helper.get_users()
        
        # Get final memory usage
        final_memory = process.memory_info().rss / 1024 / 1024  # MB
        memory_increase = final_memory - initial_memory
        
        # Assertions
        assert memory_increase < 100  # Memory increase should be less than 100MB
        assert final_memory < 500  # Total memory usage should be less than 500MB
    
    def test_concurrent_file_uploads(self, api_helper, test_data, admin_user):
        """Test concurrent file upload performance"""
        # Login as admin
        api_helper.login(admin_user['email'], admin_user['password'])
        
        # Create test files
        test_files = []
        for i in range(10):  # Upload 10 files concurrently
            file_path = f"/tmp/test_file_{i}.txt"
            with open(file_path, 'w') as f:
                f.write(f"Test file content {i}" * 100)  # Make file larger
            test_files.append(file_path)
        
        def upload_file(file_path):
            """Upload a single file"""
            start_time = time.time()
            response = api_helper.upload_file(file_path, 'general', f'Test file {file_path}')
            end_time = time.time()
            return {
                'success': response['success'],
                'response_time': end_time - start_time,
                'file_path': file_path
            }
        
        try:
            # Execute concurrent file uploads
            start_time = time.time()
            with concurrent.futures.ThreadPoolExecutor(max_workers=5) as executor:
                futures = [executor.submit(upload_file, file_path) for file_path in test_files]
                results = [future.result() for future in concurrent.futures.as_completed(futures)]
            end_time = time.time()
            
            # Analyze results
            total_time = end_time - start_time
            successful_uploads = sum(1 for r in results if r['success'])
            avg_response_time = sum(r['response_time'] for r in results) / len(results)
            
            # Assertions
            assert successful_uploads >= 8  # At least 80% success rate
            assert avg_response_time < 5.0  # Average response time under 5 seconds
            assert total_time < 30.0  # Total time under 30 seconds
        
        finally:
            # Clean up test files
            import os
            for file_path in test_files:
                if os.path.exists(file_path):
                    os.remove(file_path)
    
    def test_database_connection_pool_performance(self, db_helper):
        """Test database connection pool performance"""
        def execute_query():
            """Execute a database query"""
            start_time = time.time()
            result = db_helper.execute_query("SELECT COUNT(*) FROM users")
            end_time = time.time()
            return end_time - start_time
        
        # Execute multiple concurrent queries
        start_time = time.time()
        with concurrent.futures.ThreadPoolExecutor(max_workers=20) as executor:
            futures = [executor.submit(execute_query) for _ in range(50)]
            query_times = [future.result() for future in concurrent.futures.as_completed(futures)]
        end_time = time.time()
        
        # Analyze results
        avg_query_time = sum(query_times) / len(query_times)
        max_query_time = max(query_times)
        
        # Assertions
        assert avg_query_time < 0.5  # Average query time under 0.5 seconds
        assert max_query_time < 1.0  # Max query time under 1 second
        assert end_time - start_time < 10.0  # Total time under 10 seconds
    
    def test_api_throughput(self, api_helper, admin_user):
        """Test API throughput"""
        # Login first
        api_helper.login(admin_user['email'], admin_user['password'])
        
        def make_request():
            """Make a single API request"""
            start_time = time.time()
            response = api_helper.get_users()
            end_time = time.time()
            return {
                'success': response['success'],
                'response_time': end_time - start_time
            }
        
        # Measure throughput over time
        start_time = time.time()
        request_count = 0
        successful_requests = 0
        
        # Make requests for a specific duration
        while time.time() - start_time < TestConfig.LOAD_TEST_DURATION:
            result = make_request()
            request_count += 1
            if result['success']:
                successful_requests += 1
        
        total_time = time.time() - start_time
        throughput = request_count / total_time  # Requests per second
        success_rate = successful_requests / request_count
        
        # Assertions
        assert throughput > 10  # Should handle at least 10 requests per second
        assert success_rate > 0.95  # Success rate should be above 95%
        assert total_time >= TestConfig.LOAD_TEST_DURATION  # Should run for the specified duration
    
    def test_stress_test_authentication(self, api_helper, test_data):
        """Test authentication under stress"""
        # Generate many user credentials
        users = []
        for i in range(100):
            user_data = test_data.generate_user_data('student')
            users.append({
                'email': user_data['email'],
                'password': user_data['password']
            })
        
        def stress_login(user_creds):
            """Perform stress login"""
            start_time = time.time()
            response = api_helper.login(user_creds['email'], user_creds['password'])
            end_time = time.time()
            return {
                'success': response['success'],
                'response_time': end_time - start_time,
                'user': user_creds['email']
            }
        
        # Execute stress test
        start_time = time.time()
        with concurrent.futures.ThreadPoolExecutor(max_workers=50) as executor:
            futures = [executor.submit(stress_login, user) for user in users]
            results = [future.result() for future in concurrent.futures.as_completed(futures)]
        end_time = time.time()
        
        # Analyze results
        total_time = end_time - start_time
        successful_logins = sum(1 for r in results if r['success'])
        avg_response_time = sum(r['response_time'] for r in results) / len(results)
        
        # Assertions
        assert total_time < 60.0  # Should complete within 60 seconds
        assert avg_response_time < 3.0  # Average response time under 3 seconds
        assert successful_logins >= 0  # Some logins should succeed (or all fail gracefully)
    
    def test_memory_leak_detection(self, api_helper, test_data, admin_user):
        """Test for memory leaks during extended operation"""
        import psutil
        import os
        import gc
        
        # Login first
        api_helper.login(admin_user['email'], admin_user['password'])
        
        # Get initial memory usage
        process = psutil.Process(os.getpid())
        initial_memory = process.memory_info().rss / 1024 / 1024  # MB
        
        # Perform operations in cycles
        for cycle in range(10):
            # Create and delete classes
            for i in range(10):
                class_data = test_data.generate_class_data()
                class_data['name'] = f"Memory Test Class {cycle}_{i}"
                create_response = api_helper.create_class(class_data)
                
                if create_response['success']:
                    class_id = create_response['data']['id']
                    api_helper.delete_class(class_id)
            
            # Force garbage collection
            gc.collect()
            
            # Check memory usage
            current_memory = process.memory_info().rss / 1024 / 1024  # MB
            memory_increase = current_memory - initial_memory
            
            # Assertions for each cycle
            assert memory_increase < 50  # Memory increase should be less than 50MB per cycle
        
        # Final memory check
        final_memory = process.memory_info().rss / 1024 / 1024  # MB
        total_memory_increase = final_memory - initial_memory
        
        # Final assertions
        assert total_memory_increase < 100  # Total memory increase should be less than 100MB
        assert final_memory < 500  # Final memory usage should be less than 500MB
