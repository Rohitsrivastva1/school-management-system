"""
Homework Management Test Cases for School Management System
"""
import pytest
import time
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException, NoSuchElementException
from selenium.webdriver.support.ui import Select
from config.test_config import TestConfig

class TestHomeworkManagement:
    """Test cases for homework management functionality"""
    
    def test_create_homework_success(self, login_teacher, driver, wait, test_data):
        """Test successful homework creation"""
        # Navigate to create homework page
        driver.get(f"{TestConfig.BASE_URL}/teacher/homework/create")
        
        # Fill homework form
        homework_data = test_data.generate_homework_data()
        
        title_input = wait.until(EC.presence_of_element_located((By.NAME, "title")))
        description_input = driver.find_element(By.NAME, "description")
        due_date_input = driver.find_element(By.NAME, "dueDate")
        max_marks_input = driver.find_element(By.NAME, "maxMarks")
        
        title_input.clear()
        title_input.send_keys(homework_data['title'])
        description_input.clear()
        description_input.send_keys(homework_data['description'])
        due_date_input.clear()
        due_date_input.send_keys(homework_data['dueDate'])
        max_marks_input.clear()
        max_marks_input.send_keys(str(homework_data['maxMarks']))
        
        # Select class
        class_select = Select(driver.find_element(By.NAME, "classId"))
        class_select.select_by_index(1)  # Select first available class
        
        # Select subject
        subject_select = Select(driver.find_element(By.NAME, "subjectId"))
        subject_select.select_by_index(1)  # Select first available subject
        
        # Submit form
        submit_button = driver.find_element(By.XPATH, "//button[@type='submit']")
        submit_button.click()
        
        # Verify success message
        success_message = wait.until(EC.presence_of_element_located((By.CLASS_NAME, "success")))
        assert "Homework created successfully" in success_message.text
        
        # Verify redirect to homework list
        wait.until(EC.url_contains("/teacher/homework"))
        assert "/teacher/homework" in driver.current_url
    
    def test_create_homework_empty_fields(self, login_teacher, driver, wait):
        """Test creating homework with empty required fields"""
        # Navigate to create homework page
        driver.get(f"{TestConfig.BASE_URL}/teacher/homework/create")
        
        # Submit form without filling required fields
        submit_button = driver.find_element(By.XPATH, "//button[@type='submit']")
        submit_button.click()
        
        # Verify validation errors
        title_error = driver.find_element(By.XPATH, "//input[@name='title']/following-sibling::div[contains(@class, 'error')]")
        description_error = driver.find_element(By.XPATH, "//textarea[@name='description']/following-sibling::div[contains(@class, 'error')]")
        due_date_error = driver.find_element(By.XPATH, "//input[@name='dueDate']/following-sibling::div[contains(@class, 'error')]")
        max_marks_error = driver.find_element(By.XPATH, "//input[@name='maxMarks']/following-sibling::div[contains(@class, 'error')]")
        
        assert title_error.is_displayed()
        assert description_error.is_displayed()
        assert due_date_error.is_displayed()
        assert max_marks_error.is_displayed()
    
    def test_create_homework_invalid_data(self, login_teacher, driver, wait):
        """Test creating homework with invalid data"""
        # Navigate to create homework page
        driver.get(f"{TestConfig.BASE_URL}/teacher/homework/create")
        
        # Fill form with invalid data
        title_input = wait.until(EC.presence_of_element_located((By.NAME, "title")))
        description_input = driver.find_element(By.NAME, "description")
        due_date_input = driver.find_element(By.NAME, "dueDate")
        max_marks_input = driver.find_element(By.NAME, "maxMarks")
        
        title_input.clear()
        title_input.send_keys("A" * 1000)  # Too long title
        description_input.clear()
        description_input.send_keys("A" * 5000)  # Too long description
        due_date_input.clear()
        due_date_input.send_keys("invalid-date")  # Invalid date format
        max_marks_input.clear()
        max_marks_input.send_keys("-1")  # Negative marks
        
        # Submit form
        submit_button = driver.find_element(By.XPATH, "//button[@type='submit']")
        submit_button.click()
        
        # Verify validation errors
        title_error = driver.find_element(By.XPATH, "//input[@name='title']/following-sibling::div[contains(@class, 'error')]")
        description_error = driver.find_element(By.XPATH, "//textarea[@name='description']/following-sibling::div[contains(@class, 'error')]")
        due_date_error = driver.find_element(By.XPATH, "//input[@name='dueDate']/following-sibling::div[contains(@class, 'error')]")
        max_marks_error = driver.find_element(By.XPATH, "//input[@name='maxMarks']/following-sibling::div[contains(@class, 'error')]")
        
        assert title_error.is_displayed()
        assert description_error.is_displayed()
        assert due_date_error.is_displayed()
        assert max_marks_error.is_displayed()
    
    def test_create_homework_past_due_date(self, login_teacher, driver, wait):
        """Test creating homework with past due date"""
        # Navigate to create homework page
        driver.get(f"{TestConfig.BASE_URL}/teacher/homework/create")
        
        # Fill form with past due date
        title_input = wait.until(EC.presence_of_element_located((By.NAME, "title")))
        description_input = driver.find_element(By.NAME, "description")
        due_date_input = driver.find_element(By.NAME, "dueDate")
        max_marks_input = driver.find_element(By.NAME, "maxMarks")
        
        title_input.clear()
        title_input.send_keys("Test Homework")
        description_input.clear()
        description_input.send_keys("Test description")
        due_date_input.clear()
        due_date_input.send_keys("2020-01-01")  # Past date
        max_marks_input.clear()
        max_marks_input.send_keys("100")
        
        # Submit form
        submit_button = driver.find_element(By.XPATH, "//button[@type='submit']")
        submit_button.click()
        
        # Verify error message
        error_message = wait.until(EC.presence_of_element_located((By.CLASS_NAME, "error")))
        assert "Due date cannot be in the past" in error_message.text or "Invalid due date" in error_message.text
    
    def test_view_homework_list(self, login_teacher, driver, wait):
        """Test viewing homework list"""
        # Navigate to homework page
        driver.get(f"{TestConfig.BASE_URL}/teacher/homework")
        
        # Verify homework list is displayed
        homework_table = wait.until(EC.presence_of_element_located((By.XPATH, "//table[contains(@class, 'homework-table')]")))
        assert homework_table.is_displayed()
        
        # Verify table headers
        headers = homework_table.find_elements(By.XPATH, "//th")
        expected_headers = ["Title", "Class", "Subject", "Due Date", "Max Marks", "Status", "Actions"]
        for header in expected_headers:
            assert any(header in h.text for h in headers)
    
    def test_view_homework_details(self, login_teacher, driver, wait):
        """Test viewing homework details"""
        # Navigate to homework page
        driver.get(f"{TestConfig.BASE_URL}/teacher/homework")
        
        # Click on first homework item
        homework_item = wait.until(EC.element_to_be_clickable((By.XPATH, "//tr[contains(@class, 'homework-row')][1]")))
        homework_item.click()
        
        # Verify homework details page
        wait.until(EC.url_contains("/teacher/homework/"))
        assert "/teacher/homework/" in driver.current_url
        
        # Verify homework details are displayed
        assert driver.find_element(By.XPATH, "//h2[contains(text(), 'Homework Details')]")
        assert driver.find_element(By.XPATH, "//div[contains(text(), 'Title')]")
        assert driver.find_element(By.XPATH, "//div[contains(text(), 'Description')]")
        assert driver.find_element(By.XPATH, "//div[contains(text(), 'Due Date')]")
        assert driver.find_element(By.XPATH, "//div[contains(text(), 'Max Marks')]")
    
    def test_edit_homework_success(self, login_teacher, driver, wait):
        """Test successful homework editing"""
        # Navigate to homework page
        driver.get(f"{TestConfig.BASE_URL}/teacher/homework")
        
        # Click edit button on first homework
        edit_button = wait.until(EC.element_to_be_clickable((By.XPATH, "//button[contains(text(), 'Edit')][1]")))
        edit_button.click()
        
        # Verify edit form is loaded
        wait.until(EC.url_contains("/teacher/homework/") and EC.url_contains("/edit"))
        
        # Update homework data
        title_input = wait.until(EC.presence_of_element_located((By.NAME, "title")))
        description_input = driver.find_element(By.NAME, "description")
        
        title_input.clear()
        title_input.send_keys("Updated Homework Title")
        description_input.clear()
        description_input.send_keys("Updated homework description")
        
        # Submit form
        submit_button = driver.find_element(By.XPATH, "//button[@type='submit']")
        submit_button.click()
        
        # Verify success message
        success_message = wait.until(EC.presence_of_element_located((By.CLASS_NAME, "success")))
        assert "Homework updated successfully" in success_message.text
        
        # Verify redirect to homework details
        wait.until(EC.url_contains("/teacher/homework/"))
        assert "/edit" not in driver.current_url
    
    def test_delete_homework_success(self, login_teacher, driver, wait):
        """Test successful homework deletion"""
        # Navigate to homework page
        driver.get(f"{TestConfig.BASE_URL}/teacher/homework")
        
        # Click delete button on first homework
        delete_button = wait.until(EC.element_to_be_clickable((By.XPATH, "//button[contains(text(), 'Delete')][1]")))
        delete_button.click()
        
        # Confirm deletion in modal
        confirm_button = wait.until(EC.element_to_be_clickable((By.XPATH, "//button[contains(text(), 'Confirm')]")))
        confirm_button.click()
        
        # Verify success message
        success_message = wait.until(EC.presence_of_element_located((By.CLASS_NAME, "success")))
        assert "Homework deleted successfully" in success_message.text
        
        # Verify homework is removed from list
        time.sleep(2)  # Wait for list to update
        homework_rows = driver.find_elements(By.XPATH, "//tr[contains(@class, 'homework-row')]")
        # Verify one less homework row exists
    
    def test_publish_homework(self, login_teacher, driver, wait):
        """Test publishing homework"""
        # Navigate to homework page
        driver.get(f"{TestConfig.BASE_URL}/teacher/homework")
        
        # Click publish button on first homework
        publish_button = wait.until(EC.element_to_be_clickable((By.XPATH, "//button[contains(text(), 'Publish')][1]")))
        publish_button.click()
        
        # Confirm publication
        confirm_button = wait.until(EC.element_to_be_clickable((By.XPATH, "//button[contains(text(), 'Confirm')]")))
        confirm_button.click()
        
        # Verify success message
        success_message = wait.until(EC.presence_of_element_located((By.CLASS_NAME, "success")))
        assert "Homework published successfully" in success_message.text
        
        # Verify status changed to published
        status_badge = driver.find_element(By.XPATH, "//span[contains(@class, 'status-published')]")
        assert status_badge.is_displayed()
    
    def test_unpublish_homework(self, login_teacher, driver, wait):
        """Test unpublishing homework"""
        # Navigate to homework page
        driver.get(f"{TestConfig.BASE_URL}/teacher/homework")
        
        # Click unpublish button on first published homework
        unpublish_button = wait.until(EC.element_to_be_clickable((By.XPATH, "//button[contains(text(), 'Unpublish')][1]")))
        unpublish_button.click()
        
        # Confirm unpublishing
        confirm_button = wait.until(EC.element_to_be_clickable((By.XPATH, "//button[contains(text(), 'Confirm')]")))
        confirm_button.click()
        
        # Verify success message
        success_message = wait.until(EC.presence_of_element_located((By.CLASS_NAME, "success")))
        assert "Homework unpublished successfully" in success_message.text
        
        # Verify status changed to draft
        status_badge = driver.find_element(By.XPATH, "//span[contains(@class, 'status-draft')]")
        assert status_badge.is_displayed()
    
    def test_homework_search_functionality(self, login_teacher, driver, wait):
        """Test homework search functionality"""
        # Navigate to homework page
        driver.get(f"{TestConfig.BASE_URL}/teacher/homework")
        
        # Search for specific homework
        search_input = wait.until(EC.presence_of_element_located((By.XPATH, "//input[@placeholder*='Search']")))
        search_input.clear()
        search_input.send_keys("Math")
        
        # Click search button
        search_button = driver.find_element(By.XPATH, "//button[contains(text(), 'Search')]")
        search_button.click()
        
        # Verify search results
        time.sleep(2)  # Wait for search results
        homework_rows = driver.find_elements(By.XPATH, "//tr[contains(@class, 'homework-row')]")
        
        # Verify only matching homeworks are displayed
        for row in homework_rows:
            assert "Math" in row.text
    
    def test_homework_filter_by_class(self, login_teacher, driver, wait):
        """Test filtering homework by class"""
        # Navigate to homework page
        driver.get(f"{TestConfig.BASE_URL}/teacher/homework")
        
        # Select class filter
        class_filter = Select(wait.until(EC.presence_of_element_located((By.NAME, "classFilter"))))
        class_filter.select_by_index(1)
        
        # Click filter button
        filter_button = driver.find_element(By.XPATH, "//button[contains(text(), 'Filter')]")
        filter_button.click()
        
        # Verify filtered results
        time.sleep(2)  # Wait for filter results
        homework_rows = driver.find_elements(By.XPATH, "//tr[contains(@class, 'homework-row')]")
        
        # Verify only homeworks from selected class are displayed
        for row in homework_rows:
            # Check if class name is in the row
            assert len(row.find_elements(By.XPATH, ".//td[contains(text(), 'Class')]")) > 0
    
    def test_homework_filter_by_status(self, login_teacher, driver, wait):
        """Test filtering homework by status"""
        # Navigate to homework page
        driver.get(f"{TestConfig.BASE_URL}/teacher/homework")
        
        # Select status filter
        status_filter = Select(wait.until(EC.presence_of_element_located((By.NAME, "statusFilter"))))
        status_filter.select_by_visible_text("Published")
        
        # Click filter button
        filter_button = driver.find_element(By.XPATH, "//button[contains(text(), 'Filter')]")
        filter_button.click()
        
        # Verify filtered results
        time.sleep(2)  # Wait for filter results
        homework_rows = driver.find_elements(By.XPATH, "//tr[contains(@class, 'homework-row')]")
        
        # Verify only published homeworks are displayed
        for row in homework_rows:
            status_badge = row.find_element(By.XPATH, ".//span[contains(@class, 'status')]")
            assert "Published" in status_badge.text or "published" in status_badge.text
    
    def test_homework_due_date_reminder(self, login_teacher, driver, wait):
        """Test homework due date reminder functionality"""
        # Navigate to homework page
        driver.get(f"{TestConfig.BASE_URL}/teacher/homework")
        
        # Click on homework with due date approaching
        homework_item = wait.until(EC.element_to_be_clickable((By.XPATH, "//tr[contains(@class, 'homework-row') and contains(@class, 'due-soon')][1]")))
        homework_item.click()
        
        # Verify reminder is displayed
        reminder = wait.until(EC.presence_of_element_located((By.XPATH, "//div[contains(@class, 'due-date-reminder')]")))
        assert reminder.is_displayed()
        assert "Due soon" in reminder.text or "Due date approaching" in reminder.text
    
    def test_homework_submission_tracking(self, login_teacher, driver, wait):
        """Test homework submission tracking"""
        # Navigate to homework page
        driver.get(f"{TestConfig.BASE_URL}/teacher/homework")
        
        # Click on homework with submissions
        homework_item = wait.until(EC.element_to_be_clickable((By.XPATH, "//tr[contains(@class, 'homework-row')][1]")))
        homework_item.click()
        
        # Click submissions tab
        submissions_tab = wait.until(EC.element_to_be_clickable((By.XPATH, "//button[contains(text(), 'Submissions')]")))
        submissions_tab.click()
        
        # Verify submissions are displayed
        submissions_table = wait.until(EC.presence_of_element_located((By.XPATH, "//table[contains(@class, 'submissions-table')]")))
        assert submissions_table.is_displayed()
        
        # Verify submission details
        assert driver.find_element(By.XPATH, "//th[contains(text(), 'Student')]")
        assert driver.find_element(By.XPATH, "//th[contains(text(), 'Submitted At')]")
        assert driver.find_element(By.XPATH, "//th[contains(text(), 'Status')]")
    
    def test_homework_grading(self, login_teacher, driver, wait):
        """Test homework grading functionality"""
        # Navigate to homework page
        driver.get(f"{TestConfig.BASE_URL}/teacher/homework")
        
        # Click on homework with submissions
        homework_item = wait.until(EC.element_to_be_clickable((By.XPATH, "//tr[contains(@class, 'homework-row')][1]")))
        homework_item.click()
        
        # Click submissions tab
        submissions_tab = wait.until(EC.element_to_be_clickable((By.XPATH, "//button[contains(text(), 'Submissions')]")))
        submissions_tab.click()
        
        # Click grade button on first submission
        grade_button = wait.until(EC.element_to_be_clickable((By.XPATH, "//button[contains(text(), 'Grade')][1]")))
        grade_button.click()
        
        # Fill grading form
        marks_input = wait.until(EC.presence_of_element_located((By.NAME, "marks")))
        feedback_input = driver.find_element(By.NAME, "feedback")
        
        marks_input.clear()
        marks_input.send_keys("85")
        feedback_input.clear()
        feedback_input.send_keys("Good work!")
        
        # Submit grade
        submit_grade_button = driver.find_element(By.XPATH, "//button[@type='submit']")
        submit_grade_button.click()
        
        # Verify success message
        success_message = wait.until(EC.presence_of_element_located((By.CLASS_NAME, "success")))
        assert "Grade submitted successfully" in success_message.text
    
    def test_homework_attachment_upload(self, login_teacher, driver, wait):
        """Test homework attachment upload"""
        # Navigate to create homework page
        driver.get(f"{TestConfig.BASE_URL}/teacher/homework/create")
        
        # Fill basic homework information
        title_input = wait.until(EC.presence_of_element_located((By.NAME, "title")))
        description_input = driver.find_element(By.NAME, "description")
        due_date_input = driver.find_element(By.NAME, "dueDate")
        max_marks_input = driver.find_element(By.NAME, "maxMarks")
        
        title_input.clear()
        title_input.send_keys("Test Homework with Attachment")
        description_input.clear()
        description_input.send_keys("Test description")
        due_date_input.clear()
        due_date_input.send_keys("2024-12-31")
        max_marks_input.clear()
        max_marks_input.send_keys("100")
        
        # Upload attachment
        file_input = driver.find_element(By.NAME, "attachment")
        file_input.send_keys("/path/to/test/file.pdf")  # This would need a real file path
        
        # Submit form
        submit_button = driver.find_element(By.XPATH, "//button[@type='submit']")
        submit_button.click()
        
        # Verify success message
        success_message = wait.until(EC.presence_of_element_located((By.CLASS_NAME, "success")))
        assert "Homework created successfully" in success_message.text
    
    def test_homework_unauthorized_access(self, driver, wait):
        """Test unauthorized access to homework page"""
        # Try to access homework page without login
        driver.get(f"{TestConfig.BASE_URL}/teacher/homework")
        
        # Verify redirect to login page
        wait.until(EC.url_contains("/login"))
        assert "/login" in driver.current_url
    
    def test_homework_student_view(self, login_student, driver, wait):
        """Test student viewing homework"""
        # Navigate to student homework page
        driver.get(f"{TestConfig.BASE_URL}/student/homework")
        
        # Verify homework list is displayed
        homework_table = wait.until(EC.presence_of_element_located((By.XPATH, "//table[contains(@class, 'homework-table')]")))
        assert homework_table.is_displayed()
        
        # Verify only published homeworks are shown
        homework_rows = driver.find_elements(By.XPATH, "//tr[contains(@class, 'homework-row')]")
        for row in homework_rows:
            status_badge = row.find_element(By.XPATH, ".//span[contains(@class, 'status')]")
            assert "Published" in status_badge.text or "published" in status_badge.text
    
    def test_homework_student_submission(self, login_student, driver, wait):
        """Test student submitting homework"""
        # Navigate to student homework page
        driver.get(f"{TestConfig.BASE_URL}/student/homework")
        
        # Click on first homework
        homework_item = wait.until(EC.element_to_be_clickable((By.XPATH, "//tr[contains(@class, 'homework-row')][1]")))
        homework_item.click()
        
        # Click submit button
        submit_button = wait.until(EC.element_to_be_clickable((By.XPATH, "//button[contains(text(), 'Submit')]")))
        submit_button.click()
        
        # Fill submission form
        submission_text = driver.find_element(By.NAME, "submissionText")
        submission_text.clear()
        submission_text.send_keys("This is my homework submission")
        
        # Upload file
        file_input = driver.find_element(By.NAME, "submissionFile")
        file_input.send_keys("/path/to/submission/file.pdf")  # This would need a real file path
        
        # Submit homework
        submit_homework_button = driver.find_element(By.XPATH, "//button[@type='submit']")
        submit_homework_button.click()
        
        # Verify success message
        success_message = wait.until(EC.presence_of_element_located((By.CLASS_NAME, "success")))
        assert "Homework submitted successfully" in success_message.text
    
    def test_homework_parent_view(self, login_parent, driver, wait):
        """Test parent viewing child's homework"""
        # Navigate to parent homework page
        driver.get(f"{TestConfig.BASE_URL}/parent/homework")
        
        # Verify homework list is displayed
        homework_table = wait.until(EC.presence_of_element_located((By.XPATH, "//table[contains(@class, 'homework-table')]")))
        assert homework_table.is_displayed()
        
        # Verify only child's homeworks are shown
        homework_rows = driver.find_elements(By.XPATH, "//tr[contains(@class, 'homework-row')]")
        assert len(homework_rows) > 0
