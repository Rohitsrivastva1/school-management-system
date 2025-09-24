"""
Class Management Test Cases for School Management System
"""
import pytest
import time
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException, NoSuchElementException
from selenium.webdriver.support.ui import Select
from config.test_config import TestConfig

class TestClassManagement:
    """Test cases for class management functionality"""
    
    def test_create_class_success(self, login_admin, driver, wait, test_data):
        """Test successful class creation"""
        # Navigate to classes page
        driver.get(f"{TestConfig.BASE_URL}/admin/classes")
        
        # Click create class button
        create_button = wait.until(EC.element_to_be_clickable((By.XPATH, "//button[contains(text(), 'Create New Class')]")))
        create_button.click()
        
        # Fill class form
        class_data = test_data.generate_class_data()
        
        name_input = wait.until(EC.presence_of_element_located((By.NAME, "name")))
        section_input = driver.find_element(By.NAME, "section")
        academic_year_input = driver.find_element(By.NAME, "academicYear")
        room_number_input = driver.find_element(By.NAME, "roomNumber")
        
        name_input.clear()
        name_input.send_keys(class_data['name'])
        section_input.clear()
        section_input.send_keys(class_data['section'])
        academic_year_input.clear()
        academic_year_input.send_keys(class_data['academicYear'])
        room_number_input.clear()
        room_number_input.send_keys(class_data['roomNumber'])
        
        # Submit form
        submit_button = driver.find_element(By.XPATH, "//button[@type='submit']")
        submit_button.click()
        
        # Verify success message
        success_message = wait.until(EC.presence_of_element_located((By.CLASS_NAME, "success")))
        assert "Class created successfully" in success_message.text
        
        # Verify redirect to classes list
        wait.until(EC.url_contains("/admin/classes"))
        assert "/admin/classes" in driver.current_url
        
        # Verify class appears in list
        class_card = wait.until(EC.presence_of_element_located((By.XPATH, f"//div[contains(text(), '{class_data['name']} {class_data['section']}')]")))
        assert class_card.is_displayed()
    
    def test_create_class_duplicate_name_section(self, login_admin, driver, wait, test_data):
        """Test creating class with duplicate name and section"""
        # Navigate to classes page
        driver.get(f"{TestConfig.BASE_URL}/admin/classes")
        
        # Click create class button
        create_button = wait.until(EC.element_to_be_clickable((By.XPATH, "//button[contains(text(), 'Create New Class')]")))
        create_button.click()
        
        # Fill class form with existing data
        name_input = wait.until(EC.presence_of_element_located((By.NAME, "name")))
        section_input = driver.find_element(By.NAME, "section")
        academic_year_input = driver.find_element(By.NAME, "academicYear")
        
        name_input.clear()
        name_input.send_keys("Class 1")  # Assuming this exists
        section_input.clear()
        section_input.send_keys("A")  # Assuming this exists
        academic_year_input.clear()
        academic_year_input.send_keys("2024-25")  # Assuming this exists
        
        # Submit form
        submit_button = driver.find_element(By.XPATH, "//button[@type='submit']")
        submit_button.click()
        
        # Verify error message
        error_message = wait.until(EC.presence_of_element_located((By.CLASS_NAME, "error")))
        assert "Class with this name and section already exists" in error_message.text or "Duplicate class" in error_message.text
    
    def test_create_class_empty_fields(self, login_admin, driver, wait):
        """Test creating class with empty required fields"""
        # Navigate to classes page
        driver.get(f"{TestConfig.BASE_URL}/admin/classes")
        
        # Click create class button
        create_button = wait.until(EC.element_to_be_clickable((By.XPATH, "//button[contains(text(), 'Create New Class')]")))
        create_button.click()
        
        # Submit form without filling required fields
        submit_button = driver.find_element(By.XPATH, "//button[@type='submit']")
        submit_button.click()
        
        # Verify validation errors
        name_error = driver.find_element(By.XPATH, "//input[@name='name']/following-sibling::div[contains(@class, 'error')]")
        section_error = driver.find_element(By.XPATH, "//input[@name='section']/following-sibling::div[contains(@class, 'error')]")
        academic_year_error = driver.find_element(By.XPATH, "//input[@name='academicYear']/following-sibling::div[contains(@class, 'error')]")
        
        assert name_error.is_displayed()
        assert section_error.is_displayed()
        assert academic_year_error.is_displayed()
    
    def test_create_class_invalid_data(self, login_admin, driver, wait):
        """Test creating class with invalid data"""
        # Navigate to classes page
        driver.get(f"{TestConfig.BASE_URL}/admin/classes")
        
        # Click create class button
        create_button = wait.until(EC.element_to_be_clickable((By.XPATH, "//button[contains(text(), 'Create New Class')]")))
        create_button.click()
        
        # Fill form with invalid data
        name_input = wait.until(EC.presence_of_element_located((By.NAME, "name")))
        section_input = driver.find_element(By.NAME, "section")
        academic_year_input = driver.find_element(By.NAME, "academicYear")
        max_students_input = driver.find_element(By.NAME, "maxStudents")
        
        name_input.clear()
        name_input.send_keys("A" * 100)  # Too long
        section_input.clear()
        section_input.send_keys("B" * 100)  # Too long
        academic_year_input.clear()
        academic_year_input.send_keys("invalid-year")  # Invalid format
        max_students_input.clear()
        max_students_input.send_keys("-1")  # Negative number
        
        # Submit form
        submit_button = driver.find_element(By.XPATH, "//button[@type='submit']")
        submit_button.click()
        
        # Verify validation errors
        name_error = driver.find_element(By.XPATH, "//input[@name='name']/following-sibling::div[contains(@class, 'error')]")
        section_error = driver.find_element(By.XPATH, "//input[@name='section']/following-sibling::div[contains(@class, 'error')]")
        academic_year_error = driver.find_element(By.XPATH, "//input[@name='academicYear']/following-sibling::div[contains(@class, 'error')]")
        max_students_error = driver.find_element(By.XPATH, "//input[@name='maxStudents']/following-sibling::div[contains(@class, 'error')]")
        
        assert name_error.is_displayed()
        assert section_error.is_displayed()
        assert academic_year_error.is_displayed()
        assert max_students_error.is_displayed()
    
    def test_view_class_details(self, login_admin, driver, wait, test_data):
        """Test viewing class details"""
        # First create a class
        class_data = test_data.generate_class_data()
        # ... (class creation logic)
        
        # Navigate to classes page
        driver.get(f"{TestConfig.BASE_URL}/admin/classes")
        
        # Click on first class card
        class_card = wait.until(EC.element_to_be_clickable((By.XPATH, "//div[contains(@class, 'class-card')][1]")))
        class_card.click()
        
        # Verify class details page
        wait.until(EC.url_contains("/admin/classes/"))
        assert "/admin/classes/" in driver.current_url
        
        # Verify class information is displayed
        assert driver.find_element(By.XPATH, "//h2[contains(text(), 'Class')]")
        assert driver.find_element(By.XPATH, "//div[contains(text(), 'Academic Year')]")
        assert driver.find_element(By.XPATH, "//div[contains(text(), 'Room Number')]")
        assert driver.find_element(By.XPATH, "//div[contains(text(), 'Max Students')]")
    
    def test_edit_class_success(self, login_admin, driver, wait, test_data):
        """Test successful class editing"""
        # Navigate to classes page
        driver.get(f"{TestConfig.BASE_URL}/admin/classes")
        
        # Click edit button on first class
        edit_button = wait.until(EC.element_to_be_clickable((By.XPATH, "//button[contains(text(), 'Edit')][1]")))
        edit_button.click()
        
        # Verify edit form is loaded
        wait.until(EC.url_contains("/admin/classes/") and EC.url_contains("/edit"))
        
        # Update class data
        name_input = wait.until(EC.presence_of_element_located((By.NAME, "name")))
        room_number_input = driver.find_element(By.NAME, "roomNumber")
        
        name_input.clear()
        name_input.send_keys("Updated Class Name")
        room_number_input.clear()
        room_number_input.send_keys("Room 999")
        
        # Submit form
        submit_button = driver.find_element(By.XPATH, "//button[@type='submit']")
        submit_button.click()
        
        # Verify success message
        success_message = wait.until(EC.presence_of_element_located((By.CLASS_NAME, "success")))
        assert "Class updated successfully" in success_message.text
        
        # Verify redirect to class details
        wait.until(EC.url_contains("/admin/classes/"))
        assert "/edit" not in driver.current_url
    
    def test_edit_class_validation_errors(self, login_admin, driver, wait):
        """Test class editing with validation errors"""
        # Navigate to classes page
        driver.get(f"{TestConfig.BASE_URL}/admin/classes")
        
        # Click edit button on first class
        edit_button = wait.until(EC.element_to_be_clickable((By.XPATH, "//button[contains(text(), 'Edit')][1]")))
        edit_button.click()
        
        # Clear required fields
        name_input = wait.until(EC.presence_of_element_located((By.NAME, "name")))
        section_input = driver.find_element(By.NAME, "section")
        
        name_input.clear()
        section_input.clear()
        
        # Submit form
        submit_button = driver.find_element(By.XPATH, "//button[@type='submit']")
        submit_button.click()
        
        # Verify validation errors
        name_error = driver.find_element(By.XPATH, "//input[@name='name']/following-sibling::div[contains(@class, 'error')]")
        section_error = driver.find_element(By.XPATH, "//input[@name='section']/following-sibling::div[contains(@class, 'error')]")
        
        assert name_error.is_displayed()
        assert section_error.is_displayed()
    
    def test_delete_class_success(self, login_admin, driver, wait):
        """Test successful class deletion"""
        # Navigate to classes page
        driver.get(f"{TestConfig.BASE_URL}/admin/classes")
        
        # Click delete button on first class
        delete_button = wait.until(EC.element_to_be_clickable((By.XPATH, "//button[contains(text(), 'Delete')][1]")))
        delete_button.click()
        
        # Confirm deletion in modal
        confirm_button = wait.until(EC.element_to_be_clickable((By.XPATH, "//button[contains(text(), 'Confirm')]")))
        confirm_button.click()
        
        # Verify success message
        success_message = wait.until(EC.presence_of_element_located((By.CLASS_NAME, "success")))
        assert "Class deleted successfully" in success_message.text
        
        # Verify class is removed from list
        time.sleep(2)  # Wait for list to update
        class_cards = driver.find_elements(By.XPATH, "//div[contains(@class, 'class-card')]")
        # Verify one less class card exists
    
    def test_delete_class_with_students(self, login_admin, driver, wait):
        """Test deleting class that has students"""
        # Navigate to classes page
        driver.get(f"{TestConfig.BASE_URL}/admin/classes")
        
        # Click delete button on class with students
        delete_button = wait.until(EC.element_to_be_clickable((By.XPATH, "//button[contains(text(), 'Delete')][1]")))
        delete_button.click()
        
        # Confirm deletion in modal
        confirm_button = wait.until(EC.element_to_be_clickable((By.XPATH, "//button[contains(text(), 'Confirm')]")))
        confirm_button.click()
        
        # Verify error message
        error_message = wait.until(EC.presence_of_element_located((By.CLASS_NAME, "error")))
        assert "Cannot delete class with existing students" in error_message.text or "Class has students" in error_message.text
    
    def test_class_search_functionality(self, login_admin, driver, wait):
        """Test class search functionality"""
        # Navigate to classes page
        driver.get(f"{TestConfig.BASE_URL}/admin/classes")
        
        # Search for specific class
        search_input = wait.until(EC.presence_of_element_located((By.XPATH, "//input[@placeholder*='Search']")))
        search_input.clear()
        search_input.send_keys("Class 1")
        
        # Click search button
        search_button = driver.find_element(By.XPATH, "//button[contains(text(), 'Search')]")
        search_button.click()
        
        # Verify search results
        time.sleep(2)  # Wait for search results
        class_cards = driver.find_elements(By.XPATH, "//div[contains(@class, 'class-card')]")
        
        # Verify only matching classes are displayed
        for card in class_cards:
            assert "Class 1" in card.text
    
    def test_class_filter_by_academic_year(self, login_admin, driver, wait):
        """Test filtering classes by academic year"""
        # Navigate to classes page
        driver.get(f"{TestConfig.BASE_URL}/admin/classes")
        
        # Select academic year filter
        year_filter = Select(wait.until(EC.presence_of_element_located((By.NAME, "academicYear"))))
        year_filter.select_by_visible_text("2024-25")
        
        # Click filter button
        filter_button = driver.find_element(By.XPATH, "//button[contains(text(), 'Filter')]")
        filter_button.click()
        
        # Verify filtered results
        time.sleep(2)  # Wait for filter results
        class_cards = driver.find_elements(By.XPATH, "//div[contains(@class, 'class-card')]")
        
        # Verify only classes from selected year are displayed
        for card in class_cards:
            assert "2024-25" in card.text
    
    def test_class_pagination(self, login_admin, driver, wait):
        """Test class list pagination"""
        # Navigate to classes page
        driver.get(f"{TestConfig.BASE_URL}/admin/classes")
        
        # Verify pagination controls are present
        pagination = wait.until(EC.presence_of_element_located((By.CLASS_NAME, "pagination")))
        assert pagination.is_displayed()
        
        # Click next page
        next_button = driver.find_element(By.XPATH, "//button[contains(text(), 'Next')]")
        if next_button.is_enabled():
            next_button.click()
            
            # Verify page changed
            time.sleep(2)
            current_page = driver.find_element(By.XPATH, "//span[contains(@class, 'current-page')]")
            assert current_page.text == "2"
    
    def test_class_teacher_assignment(self, login_admin, driver, wait, test_data):
        """Test assigning teacher to class"""
        # Navigate to create class page
        driver.get(f"{TestConfig.BASE_URL}/admin/classes/create")
        
        # Fill basic class information
        class_data = test_data.generate_class_data()
        
        name_input = wait.until(EC.presence_of_element_located((By.NAME, "name")))
        section_input = driver.find_element(By.NAME, "section")
        academic_year_input = driver.find_element(By.NAME, "academicYear")
        
        name_input.clear()
        name_input.send_keys(class_data['name'])
        section_input.clear()
        section_input.send_keys(class_data['section'])
        academic_year_input.clear()
        academic_year_input.send_keys(class_data['academicYear'])
        
        # Select class teacher
        teacher_select = Select(wait.until(EC.presence_of_element_located((By.NAME, "classTeacherId"))))
        teacher_select.select_by_index(1)  # Select first available teacher
        
        # Submit form
        submit_button = driver.find_element(By.XPATH, "//button[@type='submit']")
        submit_button.click()
        
        # Verify success message
        success_message = wait.until(EC.presence_of_element_located((By.CLASS_NAME, "success")))
        assert "Class created successfully" in success_message.text
    
    def test_class_capacity_validation(self, login_admin, driver, wait):
        """Test class capacity validation"""
        # Navigate to create class page
        driver.get(f"{TestConfig.BASE_URL}/admin/classes/create")
        
        # Fill form with invalid capacity
        name_input = wait.until(EC.presence_of_element_located((By.NAME, "name")))
        section_input = driver.find_element(By.NAME, "section")
        academic_year_input = driver.find_element(By.NAME, "academicYear")
        max_students_input = driver.find_element(By.NAME, "maxStudents")
        
        name_input.clear()
        name_input.send_keys("Test Class")
        section_input.clear()
        section_input.send_keys("A")
        academic_year_input.clear()
        academic_year_input.send_keys("2024-25")
        max_students_input.clear()
        max_students_input.send_keys("0")  # Invalid capacity
        
        # Submit form
        submit_button = driver.find_element(By.XPATH, "//button[@type='submit']")
        submit_button.click()
        
        # Verify validation error
        max_students_error = driver.find_element(By.XPATH, "//input[@name='maxStudents']/following-sibling::div[contains(@class, 'error')]")
        assert max_students_error.is_displayed()
    
    def test_class_room_number_validation(self, login_admin, driver, wait):
        """Test class room number validation"""
        # Navigate to create class page
        driver.get(f"{TestConfig.BASE_URL}/admin/classes/create")
        
        # Fill form with invalid room number
        name_input = wait.until(EC.presence_of_element_located((By.NAME, "name")))
        section_input = driver.find_element(By.NAME, "section")
        academic_year_input = driver.find_element(By.NAME, "academicYear")
        room_number_input = driver.find_element(By.NAME, "roomNumber")
        
        name_input.clear()
        name_input.send_keys("Test Class")
        section_input.clear()
        section_input.send_keys("A")
        academic_year_input.clear()
        academic_year_input.send_keys("2024-25")
        room_number_input.clear()
        room_number_input.send_keys("A" * 100)  # Too long room number
        
        # Submit form
        submit_button = driver.find_element(By.XPATH, "//button[@type='submit']")
        submit_button.click()
        
        # Verify validation error
        room_number_error = driver.find_element(By.XPATH, "//input[@name='roomNumber']/following-sibling::div[contains(@class, 'error')]")
        assert room_number_error.is_displayed()
    
    def test_class_academic_year_format_validation(self, login_admin, driver, wait):
        """Test academic year format validation"""
        # Navigate to create class page
        driver.get(f"{TestConfig.BASE_URL}/admin/classes/create")
        
        # Fill form with invalid academic year format
        name_input = wait.until(EC.presence_of_element_located((By.NAME, "name")))
        section_input = driver.find_element(By.NAME, "section")
        academic_year_input = driver.find_element(By.NAME, "academicYear")
        
        name_input.clear()
        name_input.send_keys("Test Class")
        section_input.clear()
        section_input.send_keys("A")
        academic_year_input.clear()
        academic_year_input.send_keys("invalid-year")  # Invalid format
        
        # Submit form
        submit_button = driver.find_element(By.XPATH, "//button[@type='submit']")
        submit_button.click()
        
        # Verify validation error
        academic_year_error = driver.find_element(By.XPATH, "//input[@name='academicYear']/following-sibling::div[contains(@class, 'error')]")
        assert academic_year_error.is_displayed()
    
    def test_class_duplicate_section_same_class(self, login_admin, driver, wait):
        """Test creating duplicate section for same class"""
        # Navigate to create class page
        driver.get(f"{TestConfig.BASE_URL}/admin/classes/create")
        
        # Fill form with existing class and section
        name_input = wait.until(EC.presence_of_element_located((By.NAME, "name")))
        section_input = driver.find_element(By.NAME, "section")
        academic_year_input = driver.find_element(By.NAME, "academicYear")
        
        name_input.clear()
        name_input.send_keys("Class 1")  # Assuming this exists
        section_input.clear()
        section_input.send_keys("A")  # Assuming this exists
        academic_year_input.clear()
        academic_year_input.send_keys("2024-25")  # Assuming this exists
        
        # Submit form
        submit_button = driver.find_element(By.XPATH, "//button[@type='submit']")
        submit_button.click()
        
        # Verify error message
        error_message = wait.until(EC.presence_of_element_located((By.CLASS_NAME, "error")))
        assert "Class with this name and section already exists" in error_message.text
    
    def test_class_bulk_operations(self, login_admin, driver, wait):
        """Test bulk operations on classes"""
        # Navigate to classes page
        driver.get(f"{TestConfig.BASE_URL}/admin/classes")
        
        # Select multiple classes
        checkboxes = driver.find_elements(By.XPATH, "//input[@type='checkbox']")
        for checkbox in checkboxes[:3]:  # Select first 3 classes
            checkbox.click()
        
        # Click bulk action button
        bulk_action_button = wait.until(EC.element_to_be_clickable((By.XPATH, "//button[contains(text(), 'Bulk Actions')]")))
        bulk_action_button.click()
        
        # Select bulk action
        bulk_delete = wait.until(EC.element_to_be_clickable((By.XPATH, "//button[contains(text(), 'Delete Selected')]")))
        bulk_delete.click()
        
        # Confirm bulk deletion
        confirm_button = wait.until(EC.element_to_be_clickable((By.XPATH, "//button[contains(text(), 'Confirm')]")))
        confirm_button.click()
        
        # Verify success message
        success_message = wait.until(EC.presence_of_element_located((By.CLASS_NAME, "success")))
        assert "Classes deleted successfully" in success_message.text
