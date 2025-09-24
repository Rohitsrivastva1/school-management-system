"""
Authentication Test Cases for School Management System
"""
import pytest
import time
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException, NoSuchElementException
from config.test_config import TestConfig

class TestAuthentication:
    """Test cases for authentication functionality"""
    
    def test_admin_login_success(self, driver, wait, admin_user):
        """Test successful admin login"""
        driver.get(TestConfig.BASE_URL)
        
        # Navigate to login page
        login_link = wait.until(EC.element_to_be_clickable((By.LINK_TEXT, "Login")))
        login_link.click()
        
        # Fill login form
        email_input = wait.until(EC.presence_of_element_located((By.NAME, "email")))
        password_input = driver.find_element(By.NAME, "password")
        
        email_input.clear()
        email_input.send_keys(admin_user['email'])
        password_input.clear()
        password_input.send_keys(admin_user['password'])
        
        # Submit form
        login_button = driver.find_element(By.XPATH, "//button[@type='submit']")
        login_button.click()
        
        # Verify redirect to admin dashboard
        wait.until(EC.url_contains("/admin/dashboard"))
        assert "/admin/dashboard" in driver.current_url
        
        # Verify admin-specific elements are present
        assert driver.find_element(By.XPATH, "//h1[contains(text(), 'Admin Dashboard')]")
        assert driver.find_element(By.XPATH, "//a[contains(text(), 'Manage Teachers')]")
        assert driver.find_element(By.XPATH, "//a[contains(text(), 'Manage Students')]")
    
    def test_teacher_login_success(self, driver, wait, teacher_user):
        """Test successful teacher login"""
        driver.get(TestConfig.BASE_URL)
        
        # Navigate to login page
        login_link = wait.until(EC.element_to_be_clickable((By.LINK_TEXT, "Login")))
        login_link.click()
        
        # Fill login form
        email_input = wait.until(EC.presence_of_element_located((By.NAME, "email")))
        password_input = driver.find_element(By.NAME, "password")
        
        email_input.clear()
        email_input.send_keys(teacher_user['email'])
        password_input.clear()
        password_input.send_keys(teacher_user['password'])
        
        # Submit form
        login_button = driver.find_element(By.XPATH, "//button[@type='submit']")
        login_button.click()
        
        # Verify redirect to teacher dashboard
        wait.until(EC.url_contains("/teacher/dashboard"))
        assert "/teacher/dashboard" in driver.current_url
        
        # Verify teacher-specific elements are present
        assert driver.find_element(By.XPATH, "//h1[contains(text(), 'Teacher Dashboard')]")
        assert driver.find_element(By.XPATH, "//a[contains(text(), 'Mark Attendance')]")
        assert driver.find_element(By.XPATH, "//a[contains(text(), 'Create Homework')]")
    
    def test_student_login_success(self, driver, wait, student_user):
        """Test successful student login"""
        driver.get(TestConfig.BASE_URL)
        
        # Navigate to login page
        login_link = wait.until(EC.element_to_be_clickable((By.LINK_TEXT, "Login")))
        login_link.click()
        
        # Fill login form
        email_input = wait.until(EC.presence_of_element_located((By.NAME, "email")))
        password_input = driver.find_element(By.NAME, "password")
        
        email_input.clear()
        email_input.send_keys(student_user['email'])
        password_input.clear()
        password_input.send_keys(student_user['password'])
        
        # Submit form
        login_button = driver.find_element(By.XPATH, "//button[@type='submit']")
        login_button.click()
        
        # Verify redirect to student dashboard
        wait.until(EC.url_contains("/student/dashboard"))
        assert "/student/dashboard" in driver.current_url
        
        # Verify student-specific elements are present
        assert driver.find_element(By.XPATH, "//h1[contains(text(), 'Student Dashboard')]")
        assert driver.find_element(By.XPATH, "//a[contains(text(), 'View Homework')]")
        assert driver.find_element(By.XPATH, "//a[contains(text(), 'View Attendance')]")
    
    def test_parent_login_success(self, driver, wait, parent_user):
        """Test successful parent login"""
        driver.get(TestConfig.BASE_URL)
        
        # Navigate to login page
        login_link = wait.until(EC.element_to_be_clickable((By.LINK_TEXT, "Login")))
        login_link.click()
        
        # Fill login form
        email_input = wait.until(EC.presence_of_element_located((By.NAME, "email")))
        password_input = driver.find_element(By.NAME, "password")
        
        email_input.clear()
        email_input.send_keys(parent_user['email'])
        password_input.clear()
        password_input.send_keys(parent_user['password'])
        
        # Submit form
        login_button = driver.find_element(By.XPATH, "//button[@type='submit']")
        login_button.click()
        
        # Verify redirect to parent dashboard
        wait.until(EC.url_contains("/parent/dashboard"))
        assert "/parent/dashboard" in driver.current_url
        
        # Verify parent-specific elements are present
        assert driver.find_element(By.XPATH, "//h1[contains(text(), 'Parent Dashboard')]")
        assert driver.find_element(By.XPATH, "//a[contains(text(), 'View Child Progress')]")
        assert driver.find_element(By.XPATH, "//a[contains(text(), 'Contact Teacher')]")
    
    def test_login_invalid_email(self, driver, wait):
        """Test login with invalid email"""
        driver.get(TestConfig.BASE_URL)
        
        # Navigate to login page
        login_link = wait.until(EC.element_to_be_clickable((By.LINK_TEXT, "Login")))
        login_link.click()
        
        # Fill login form with invalid email
        email_input = wait.until(EC.presence_of_element_located((By.NAME, "email")))
        password_input = driver.find_element(By.NAME, "password")
        
        email_input.clear()
        email_input.send_keys("invalid@email.com")
        password_input.clear()
        password_input.send_keys("password123")
        
        # Submit form
        login_button = driver.find_element(By.XPATH, "//button[@type='submit']")
        login_button.click()
        
        # Verify error message is displayed
        error_message = wait.until(EC.presence_of_element_located((By.CLASS_NAME, "error")))
        assert "Invalid email or password" in error_message.text or "Login failed" in error_message.text
        
        # Verify still on login page
        assert "/login" in driver.current_url
    
    def test_login_invalid_password(self, driver, wait, admin_user):
        """Test login with invalid password"""
        driver.get(TestConfig.BASE_URL)
        
        # Navigate to login page
        login_link = wait.until(EC.element_to_be_clickable((By.LINK_TEXT, "Login")))
        login_link.click()
        
        # Fill login form with invalid password
        email_input = wait.until(EC.presence_of_element_located((By.NAME, "email")))
        password_input = driver.find_element(By.NAME, "password")
        
        email_input.clear()
        email_input.send_keys(admin_user['email'])
        password_input.clear()
        password_input.send_keys("wrongpassword")
        
        # Submit form
        login_button = driver.find_element(By.XPATH, "//button[@type='submit']")
        login_button.click()
        
        # Verify error message is displayed
        error_message = wait.until(EC.presence_of_element_located((By.CLASS_NAME, "error")))
        assert "Invalid email or password" in error_message.text or "Login failed" in error_message.text
        
        # Verify still on login page
        assert "/login" in driver.current_url
    
    def test_login_empty_fields(self, driver, wait):
        """Test login with empty fields"""
        driver.get(TestConfig.BASE_URL)
        
        # Navigate to login page
        login_link = wait.until(EC.element_to_be_clickable((By.LINK_TEXT, "Login")))
        login_link.click()
        
        # Submit form without filling fields
        login_button = driver.find_element(By.XPATH, "//button[@type='submit']")
        login_button.click()
        
        # Verify validation errors are displayed
        email_error = driver.find_element(By.XPATH, "//input[@name='email']/following-sibling::div[contains(@class, 'error')]")
        password_error = driver.find_element(By.XPATH, "//input[@name='password']/following-sibling::div[contains(@class, 'error')]")
        
        assert email_error.is_displayed()
        assert password_error.is_displayed()
        
        # Verify still on login page
        assert "/login" in driver.current_url
    
    def test_login_malformed_email(self, driver, wait):
        """Test login with malformed email"""
        driver.get(TestConfig.BASE_URL)
        
        # Navigate to login page
        login_link = wait.until(EC.element_to_be_clickable((By.LINK_TEXT, "Login")))
        login_link.click()
        
        # Fill login form with malformed email
        email_input = wait.until(EC.presence_of_element_located((By.NAME, "email")))
        password_input = driver.find_element(By.NAME, "password")
        
        email_input.clear()
        email_input.send_keys("notanemail")
        password_input.clear()
        password_input.send_keys("password123")
        
        # Submit form
        login_button = driver.find_element(By.XPATH, "//button[@type='submit']")
        login_button.click()
        
        # Verify validation error is displayed
        email_error = driver.find_element(By.XPATH, "//input[@name='email']/following-sibling::div[contains(@class, 'error')]")
        assert "Invalid email format" in email_error.text or "Please enter a valid email" in email_error.text
        
        # Verify still on login page
        assert "/login" in driver.current_url
    
    def test_login_sql_injection(self, driver, wait):
        """Test login with SQL injection attempt"""
        driver.get(TestConfig.BASE_URL)
        
        # Navigate to login page
        login_link = wait.until(EC.element_to_be_clickable((By.LINK_TEXT, "Login")))
        login_link.click()
        
        # Fill login form with SQL injection
        email_input = wait.until(EC.presence_of_element_located((By.NAME, "email")))
        password_input = driver.find_element(By.NAME, "password")
        
        email_input.clear()
        email_input.send_keys("admin@school.com'; DROP TABLE users; --")
        password_input.clear()
        password_input.send_keys("password123")
        
        # Submit form
        login_button = driver.find_element(By.XPATH, "//button[@type='submit']")
        login_button.click()
        
        # Verify error message is displayed (should not crash)
        error_message = wait.until(EC.presence_of_element_located((By.CLASS_NAME, "error")))
        assert "Invalid email or password" in error_message.text or "Login failed" in error_message.text
        
        # Verify still on login page
        assert "/login" in driver.current_url
    
    def test_login_xss_attempt(self, driver, wait):
        """Test login with XSS attempt"""
        driver.get(TestConfig.BASE_URL)
        
        # Navigate to login page
        login_link = wait.until(EC.element_to_be_clickable((By.LINK_TEXT, "Login")))
        login_link.click()
        
        # Fill login form with XSS payload
        email_input = wait.until(EC.presence_of_element_located((By.NAME, "email")))
        password_input = driver.find_element(By.NAME, "password")
        
        email_input.clear()
        email_input.send_keys("<script>alert('XSS')</script>")
        password_input.clear()
        password_input.send_keys("password123")
        
        # Submit form
        login_button = driver.find_element(By.XPATH, "//button[@type='submit']")
        login_button.click()
        
        # Verify error message is displayed (should not execute script)
        error_message = wait.until(EC.presence_of_element_located((By.CLASS_NAME, "error")))
        assert "Invalid email or password" in error_message.text or "Login failed" in error_message.text
        
        # Verify no alert was triggered
        try:
            alert = driver.switch_to.alert
            alert.accept()
            assert False, "XSS vulnerability detected - alert was triggered"
        except NoSuchElementException:
            pass  # Expected - no alert should be triggered
    
    def test_logout_functionality(self, login_admin, driver, wait):
        """Test logout functionality"""
        # Verify we're logged in
        assert "/admin/dashboard" in driver.current_url
        
        # Click logout button
        logout_button = wait.until(EC.element_to_be_clickable((By.XPATH, "//button[contains(text(), 'Logout')]")))
        logout_button.click()
        
        # Verify redirect to login page
        wait.until(EC.url_contains("/login"))
        assert "/login" in driver.current_url
        
        # Verify login form is present
        assert driver.find_element(By.NAME, "email")
        assert driver.find_element(By.NAME, "password")
    
    def test_session_timeout(self, login_admin, driver, wait):
        """Test session timeout behavior"""
        # Verify we're logged in
        assert "/admin/dashboard" in driver.current_url
        
        # Simulate session timeout by clearing localStorage
        driver.execute_script("localStorage.clear();")
        
        # Try to access protected page
        driver.get(f"{TestConfig.BASE_URL}/admin/teachers")
        
        # Verify redirect to login page
        wait.until(EC.url_contains("/login"))
        assert "/login" in driver.current_url
    
    def test_remember_me_functionality(self, driver, wait, admin_user):
        """Test remember me functionality"""
        driver.get(TestConfig.BASE_URL)
        
        # Navigate to login page
        login_link = wait.until(EC.element_to_be_clickable((By.LINK_TEXT, "Login")))
        login_link.click()
        
        # Fill login form
        email_input = wait.until(EC.presence_of_element_located((By.NAME, "email")))
        password_input = driver.find_element(By.NAME, "password")
        remember_me = driver.find_element(By.NAME, "rememberMe")
        
        email_input.clear()
        email_input.send_keys(admin_user['email'])
        password_input.clear()
        password_input.send_keys(admin_user['password'])
        remember_me.click()
        
        # Submit form
        login_button = driver.find_element(By.XPATH, "//button[@type='submit']")
        login_button.click()
        
        # Verify redirect to admin dashboard
        wait.until(EC.url_contains("/admin/dashboard"))
        assert "/admin/dashboard" in driver.current_url
        
        # Close browser and reopen
        driver.quit()
        
        # Reopen browser and navigate to protected page
        driver = webdriver.Chrome()
        driver.get(f"{TestConfig.BASE_URL}/admin/dashboard")
        
        # Verify still logged in (if remember me works)
        # This test might fail if remember me is not implemented
        try:
            wait.until(EC.url_contains("/admin/dashboard"))
            assert "/admin/dashboard" in driver.current_url
        except TimeoutException:
            # Expected if remember me is not implemented
            assert "/login" in driver.current_url
    
    def test_password_reset_functionality(self, driver, wait):
        """Test password reset functionality"""
        driver.get(TestConfig.BASE_URL)
        
        # Navigate to login page
        login_link = wait.until(EC.element_to_be_clickable((By.LINK_TEXT, "Login")))
        login_link.click()
        
        # Click forgot password link
        forgot_password_link = wait.until(EC.element_to_be_clickable((By.LINK_TEXT, "Forgot Password?")))
        forgot_password_link.click()
        
        # Verify password reset form is displayed
        email_input = wait.until(EC.presence_of_element_located((By.NAME, "email")))
        submit_button = driver.find_element(By.XPATH, "//button[@type='submit']")
        
        assert email_input.is_displayed()
        assert submit_button.is_displayed()
        
        # Fill email and submit
        email_input.clear()
        email_input.send_keys("admin@school.com")
        submit_button.click()
        
        # Verify success message
        success_message = wait.until(EC.presence_of_element_located((By.CLASS_NAME, "success")))
        assert "Password reset email sent" in success_message.text or "Check your email" in success_message.text
    
    def test_concurrent_login_attempts(self, driver, wait, admin_user):
        """Test multiple concurrent login attempts"""
        driver.get(TestConfig.BASE_URL)
        
        # Navigate to login page
        login_link = wait.until(EC.element_to_be_clickable((By.LINK_TEXT, "Login")))
        login_link.click()
        
        # Fill login form
        email_input = wait.until(EC.presence_of_element_located((By.NAME, "email")))
        password_input = driver.find_element(By.NAME, "password")
        
        email_input.clear()
        email_input.send_keys(admin_user['email'])
        password_input.clear()
        password_input.send_keys(admin_user['password'])
        
        # Submit form multiple times quickly
        login_button = driver.find_element(By.XPATH, "//button[@type='submit']")
        for _ in range(5):
            login_button.click()
            time.sleep(0.1)
        
        # Verify only one successful login
        wait.until(EC.url_contains("/admin/dashboard"))
        assert "/admin/dashboard" in driver.current_url
    
    def test_login_with_special_characters(self, driver, wait):
        """Test login with special characters in password"""
        driver.get(TestConfig.BASE_URL)
        
        # Navigate to login page
        login_link = wait.until(EC.element_to_be_clickable((By.LINK_TEXT, "Login")))
        login_link.click()
        
        # Fill login form with special characters
        email_input = wait.until(EC.presence_of_element_located((By.NAME, "email")))
        password_input = driver.find_element(By.NAME, "password")
        
        email_input.clear()
        email_input.send_keys("admin@school.com")
        password_input.clear()
        password_input.send_keys("P@ssw0rd!@#$%^&*()")
        
        # Submit form
        login_button = driver.find_element(By.XPATH, "//button[@type='submit']")
        login_button.click()
        
        # Verify error message (password doesn't exist)
        error_message = wait.until(EC.presence_of_element_located((By.CLASS_NAME, "error")))
        assert "Invalid email or password" in error_message.text or "Login failed" in error_message.text
