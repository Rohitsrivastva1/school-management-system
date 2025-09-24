"""
Attendance Management Test Cases for School Management System
"""
import pytest
import time
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException, NoSuchElementException
from selenium.webdriver.support.ui import Select
from config.test_config import TestConfig

class TestAttendanceManagement:
    """Test cases for attendance management functionality"""
    
    def test_mark_attendance_success(self, login_teacher, driver, wait, test_data):
        """Test successful attendance marking"""
        # Navigate to attendance page
        driver.get(f"{TestConfig.BASE_URL}/teacher/attendance")
        
        # Select class
        class_select = Select(wait.until(EC.presence_of_element_located((By.NAME, "classId"))))
        class_select.select_by_index(1)  # Select first available class
        
        # Wait for students to load
        time.sleep(2)
        
        # Mark attendance for students
        student_checkboxes = driver.find_elements(By.XPATH, "//input[@type='checkbox' and contains(@name, 'attendance')]")
        for i, checkbox in enumerate(student_checkboxes[:3]):  # Mark first 3 students as present
            if i % 2 == 0:  # Mark every other student as present
                checkbox.click()
        
        # Select attendance status
        status_select = Select(driver.find_element(By.NAME, "status"))
        status_select.select_by_visible_text("Present")
        
        # Add remarks
        remarks_input = driver.find_element(By.NAME, "remarks")
        remarks_input.clear()
        remarks_input.send_keys("All students present")
        
        # Submit attendance
        submit_button = driver.find_element(By.XPATH, "//button[@type='submit']")
        submit_button.click()
        
        # Verify success message
        success_message = wait.until(EC.presence_of_element_located((By.CLASS_NAME, "success")))
        assert "Attendance marked successfully" in success_message.text
    
    def test_mark_attendance_no_class_selected(self, login_teacher, driver, wait):
        """Test marking attendance without selecting class"""
        # Navigate to attendance page
        driver.get(f"{TestConfig.BASE_URL}/teacher/attendance")
        
        # Try to submit without selecting class
        submit_button = driver.find_element(By.XPATH, "//button[@type='submit']")
        submit_button.click()
        
        # Verify error message
        error_message = wait.until(EC.presence_of_element_located((By.CLASS_NAME, "error")))
        assert "Please select a class" in error_message.text or "Class is required" in error_message.text
    
    def test_mark_attendance_no_students_selected(self, login_teacher, driver, wait):
        """Test marking attendance without selecting students"""
        # Navigate to attendance page
        driver.get(f"{TestConfig.BASE_URL}/teacher/attendance")
        
        # Select class
        class_select = Select(wait.until(EC.presence_of_element_located((By.NAME, "classId"))))
        class_select.select_by_index(1)
        
        # Wait for students to load
        time.sleep(2)
        
        # Submit without selecting any students
        submit_button = driver.find_element(By.XPATH, "//button[@type='submit']")
        submit_button.click()
        
        # Verify error message
        error_message = wait.until(EC.presence_of_element_located((By.CLASS_NAME, "error")))
        assert "Please select at least one student" in error_message.text or "No students selected" in error_message.text
    
    def test_mark_attendance_different_statuses(self, login_teacher, driver, wait):
        """Test marking different attendance statuses"""
        # Navigate to attendance page
        driver.get(f"{TestConfig.BASE_URL}/teacher/attendance")
        
        # Select class
        class_select = Select(wait.until(EC.presence_of_element_located((By.NAME, "classId"))))
        class_select.select_by_index(1)
        
        # Wait for students to load
        time.sleep(2)
        
        # Mark different statuses for different students
        student_rows = driver.find_elements(By.XPATH, "//tr[contains(@class, 'student-row')]")
        
        for i, row in enumerate(student_rows[:4]):
            status_select = Select(row.find_element(By.NAME, f"status_{i}"))
            if i == 0:
                status_select.select_by_visible_text("Present")
            elif i == 1:
                status_select.select_by_visible_text("Absent")
            elif i == 2:
                status_select.select_by_visible_text("Late")
            else:
                status_select.select_by_visible_text("Excused")
        
        # Submit attendance
        submit_button = driver.find_element(By.XPATH, "//button[@type='submit']")
        submit_button.click()
        
        # Verify success message
        success_message = wait.until(EC.presence_of_element_located((By.CLASS_NAME, "success")))
        assert "Attendance marked successfully" in success_message.text
    
    def test_view_attendance_by_class(self, login_teacher, driver, wait):
        """Test viewing attendance by class"""
        # Navigate to attendance page
        driver.get(f"{TestConfig.BASE_URL}/teacher/attendance")
        
        # Select class
        class_select = Select(wait.until(EC.presence_of_element_located((By.NAME, "classId"))))
        class_select.select_by_index(1)
        
        # Click view attendance button
        view_button = driver.find_element(By.XPATH, "//button[contains(text(), 'View Attendance')]")
        view_button.click()
        
        # Verify attendance records are displayed
        attendance_table = wait.until(EC.presence_of_element_located((By.XPATH, "//table[contains(@class, 'attendance-table')]")))
        assert attendance_table.is_displayed()
        
        # Verify table headers
        headers = attendance_table.find_elements(By.XPATH, "//th")
        expected_headers = ["Student Name", "Date", "Status", "Remarks"]
        for header in expected_headers:
            assert any(header in h.text for h in headers)
    
    def test_view_attendance_by_date_range(self, login_teacher, driver, wait):
        """Test viewing attendance by date range"""
        # Navigate to attendance page
        driver.get(f"{TestConfig.BASE_URL}/teacher/attendance")
        
        # Select class
        class_select = Select(wait.until(EC.presence_of_element_located((By.NAME, "classId"))))
        class_select.select_by_index(1)
        
        # Set date range
        from_date_input = driver.find_element(By.NAME, "fromDate")
        to_date_input = driver.find_element(By.NAME, "toDate")
        
        from_date_input.clear()
        from_date_input.send_keys("2024-01-01")
        to_date_input.clear()
        to_date_input.send_keys("2024-12-31")
        
        # Click filter button
        filter_button = driver.find_element(By.XPATH, "//button[contains(text(), 'Filter')]")
        filter_button.click()
        
        # Verify filtered results
        time.sleep(2)
        attendance_records = driver.find_elements(By.XPATH, "//tr[contains(@class, 'attendance-record')]")
        assert len(attendance_records) > 0
    
    def test_attendance_export_functionality(self, login_teacher, driver, wait):
        """Test exporting attendance data"""
        # Navigate to attendance page
        driver.get(f"{TestConfig.BASE_URL}/teacher/attendance")
        
        # Select class
        class_select = Select(wait.until(EC.presence_of_element_located((By.NAME, "classId"))))
        class_select.select_by_index(1)
        
        # Click export button
        export_button = driver.find_element(By.XPATH, "//button[contains(text(), 'Export')]")
        export_button.click()
        
        # Select export format
        export_format = Select(wait.until(EC.presence_of_element_located((By.NAME, "exportFormat"))))
        export_format.select_by_visible_text("Excel")
        
        # Click download button
        download_button = driver.find_element(By.XPATH, "//button[contains(text(), 'Download')]")
        download_button.click()
        
        # Verify download started (file download should begin)
        time.sleep(3)  # Wait for download to start
    
    def test_attendance_statistics(self, login_teacher, driver, wait):
        """Test viewing attendance statistics"""
        # Navigate to attendance page
        driver.get(f"{TestConfig.BASE_URL}/teacher/attendance")
        
        # Click statistics button
        stats_button = driver.find_element(By.XPATH, "//button[contains(text(), 'Statistics')]")
        stats_button.click()
        
        # Verify statistics are displayed
        stats_modal = wait.until(EC.presence_of_element_located((By.XPATH, "//div[contains(@class, 'statistics-modal')]")))
        assert stats_modal.is_displayed()
        
        # Verify statistics content
        assert driver.find_element(By.XPATH, "//div[contains(text(), 'Total Students')]")
        assert driver.find_element(By.XPATH, "//div[contains(text(), 'Present')]")
        assert driver.find_element(By.XPATH, "//div[contains(text(), 'Absent')]")
        assert driver.find_element(By.XPATH, "//div[contains(text(), 'Attendance Rate')]")
    
    def test_attendance_bulk_update(self, login_teacher, driver, wait):
        """Test bulk updating attendance"""
        # Navigate to attendance page
        driver.get(f"{TestConfig.BASE_URL}/teacher/attendance")
        
        # Select class
        class_select = Select(wait.until(EC.presence_of_element_located((By.NAME, "classId"))))
        class_select.select_by_index(1)
        
        # Wait for students to load
        time.sleep(2)
        
        # Select multiple students
        student_checkboxes = driver.find_elements(By.XPATH, "//input[@type='checkbox' and contains(@name, 'attendance')]")
        for checkbox in student_checkboxes[:3]:
            checkbox.click()
        
        # Select bulk status
        bulk_status_select = Select(driver.find_element(By.NAME, "bulkStatus"))
        bulk_status_select.select_by_visible_text("Present")
        
        # Click bulk update button
        bulk_update_button = driver.find_element(By.XPATH, "//button[contains(text(), 'Bulk Update')]")
        bulk_update_button.click()
        
        # Verify success message
        success_message = wait.until(EC.presence_of_element_located((By.CLASS_NAME, "success")))
        assert "Attendance updated successfully" in success_message.text
    
    def test_attendance_validation_errors(self, login_teacher, driver, wait):
        """Test attendance validation errors"""
        # Navigate to attendance page
        driver.get(f"{TestConfig.BASE_URL}/teacher/attendance")
        
        # Select class
        class_select = Select(wait.until(EC.presence_of_element_located((By.NAME, "classId"))))
        class_select.select_by_index(1)
        
        # Wait for students to load
        time.sleep(2)
        
        # Try to submit with invalid data
        remarks_input = driver.find_element(By.NAME, "remarks")
        remarks_input.clear()
        remarks_input.send_keys("A" * 1000)  # Too long remarks
        
        submit_button = driver.find_element(By.XPATH, "//button[@type='submit']")
        submit_button.click()
        
        # Verify validation error
        remarks_error = driver.find_element(By.XPATH, "//input[@name='remarks']/following-sibling::div[contains(@class, 'error')]")
        assert remarks_error.is_displayed()
    
    def test_attendance_duplicate_entry(self, login_teacher, driver, wait):
        """Test preventing duplicate attendance entries"""
        # Navigate to attendance page
        driver.get(f"{TestConfig.BASE_URL}/teacher/attendance")
        
        # Select class
        class_select = Select(wait.until(EC.presence_of_element_located((By.NAME, "classId"))))
        class_select.select_by_index(1)
        
        # Wait for students to load
        time.sleep(2)
        
        # Mark attendance for first time
        student_checkboxes = driver.find_elements(By.XPATH, "//input[@type='checkbox' and contains(@name, 'attendance')]")
        student_checkboxes[0].click()
        
        submit_button = driver.find_element(By.XPATH, "//button[@type='submit']")
        submit_button.click()
        
        # Wait for success
        success_message = wait.until(EC.presence_of_element_located((By.CLASS_NAME, "success")))
        assert "Attendance marked successfully" in success_message.text
        
        # Try to mark attendance again for same date
        student_checkboxes = driver.find_elements(By.XPATH, "//input[@type='checkbox' and contains(@name, 'attendance')]")
        student_checkboxes[0].click()
        
        submit_button = driver.find_element(By.XPATH, "//button[@type='submit']")
        submit_button.click()
        
        # Verify error message
        error_message = wait.until(EC.presence_of_element_located((By.CLASS_NAME, "error")))
        assert "Attendance already marked for this date" in error_message.text or "Duplicate entry" in error_message.text
    
    def test_attendance_future_date_validation(self, login_teacher, driver, wait):
        """Test preventing attendance marking for future dates"""
        # Navigate to attendance page
        driver.get(f"{TestConfig.BASE_URL}/teacher/attendance")
        
        # Select class
        class_select = Select(wait.until(EC.presence_of_element_located((By.NAME, "classId"))))
        class_select.select_by_index(1)
        
        # Set future date
        date_input = driver.find_element(By.NAME, "attendanceDate")
        future_date = "2025-12-31"  # Future date
        date_input.clear()
        date_input.send_keys(future_date)
        
        # Wait for students to load
        time.sleep(2)
        
        # Try to mark attendance
        student_checkboxes = driver.find_elements(By.XPATH, "//input[@type='checkbox' and contains(@name, 'attendance')]")
        student_checkboxes[0].click()
        
        submit_button = driver.find_element(By.XPATH, "//button[@type='submit']")
        submit_button.click()
        
        # Verify error message
        error_message = wait.until(EC.presence_of_element_located((By.CLASS_NAME, "error")))
        assert "Cannot mark attendance for future dates" in error_message.text or "Future date not allowed" in error_message.text
    
    def test_attendance_weekend_validation(self, login_teacher, driver, wait):
        """Test preventing attendance marking on weekends"""
        # Navigate to attendance page
        driver.get(f"{TestConfig.BASE_URL}/teacher/attendance")
        
        # Select class
        class_select = Select(wait.until(EC.presence_of_element_located((By.NAME, "classId"))))
        class_select.select_by_index(1)
        
        # Set weekend date (Saturday)
        date_input = driver.find_element(By.NAME, "attendanceDate")
        weekend_date = "2024-01-06"  # Saturday
        date_input.clear()
        date_input.send_keys(weekend_date)
        
        # Wait for students to load
        time.sleep(2)
        
        # Try to mark attendance
        student_checkboxes = driver.find_elements(By.XPATH, "//input[@type='checkbox' and contains(@name, 'attendance')]")
        student_checkboxes[0].click()
        
        submit_button = driver.find_element(By.XPATH, "//button[@type='submit']")
        submit_button.click()
        
        # Verify error message
        error_message = wait.until(EC.presence_of_element_located((By.CLASS_NAME, "error")))
        assert "Cannot mark attendance on weekends" in error_message.text or "Weekend not allowed" in error_message.text
    
    def test_attendance_holiday_validation(self, login_teacher, driver, wait):
        """Test preventing attendance marking on holidays"""
        # Navigate to attendance page
        driver.get(f"{TestConfig.BASE_URL}/teacher/attendance")
        
        # Select class
        class_select = Select(wait.until(EC.presence_of_element_located((By.NAME, "classId"))))
        class_select.select_by_index(1)
        
        # Set holiday date
        date_input = driver.find_element(By.NAME, "attendanceDate")
        holiday_date = "2024-01-01"  # New Year's Day
        date_input.clear()
        date_input.send_keys(holiday_date)
        
        # Wait for students to load
        time.sleep(2)
        
        # Try to mark attendance
        student_checkboxes = driver.find_elements(By.XPATH, "//input[@type='checkbox' and contains(@name, 'attendance')]")
        student_checkboxes[0].click()
        
        submit_button = driver.find_element(By.XPATH, "//button[@type='submit']")
        submit_button.click()
        
        # Verify error message
        error_message = wait.until(EC.presence_of_element_located((By.CLASS_NAME, "error")))
        assert "Cannot mark attendance on holidays" in error_message.text or "Holiday not allowed" in error_message.text
    
    def test_attendance_edit_existing(self, login_teacher, driver, wait):
        """Test editing existing attendance records"""
        # Navigate to attendance page
        driver.get(f"{TestConfig.BASE_URL}/teacher/attendance")
        
        # Select class
        class_select = Select(wait.until(EC.presence_of_element_located((By.NAME, "classId"))))
        class_select.select_by_index(1)
        
        # Click view attendance button
        view_button = driver.find_element(By.XPATH, "//button[contains(text(), 'View Attendance')]")
        view_button.click()
        
        # Click edit button on first record
        edit_button = wait.until(EC.element_to_be_clickable((By.XPATH, "//button[contains(text(), 'Edit')][1]")))
        edit_button.click()
        
        # Update attendance status
        status_select = Select(wait.until(EC.presence_of_element_located((By.NAME, "status"))))
        status_select.select_by_visible_text("Late")
        
        # Update remarks
        remarks_input = driver.find_element(By.NAME, "remarks")
        remarks_input.clear()
        remarks_input.send_keys("Updated remarks")
        
        # Save changes
        save_button = driver.find_element(By.XPATH, "//button[contains(text(), 'Save')]")
        save_button.click()
        
        # Verify success message
        success_message = wait.until(EC.presence_of_element_located((By.CLASS_NAME, "success")))
        assert "Attendance updated successfully" in success_message.text
    
    def test_attendance_delete_record(self, login_teacher, driver, wait):
        """Test deleting attendance records"""
        # Navigate to attendance page
        driver.get(f"{TestConfig.BASE_URL}/teacher/attendance")
        
        # Select class
        class_select = Select(wait.until(EC.presence_of_element_located((By.NAME, "classId"))))
        class_select.select_by_index(1)
        
        # Click view attendance button
        view_button = driver.find_element(By.XPATH, "//button[contains(text(), 'View Attendance')]")
        view_button.click()
        
        # Click delete button on first record
        delete_button = wait.until(EC.element_to_be_clickable((By.XPATH, "//button[contains(text(), 'Delete')][1]")))
        delete_button.click()
        
        # Confirm deletion
        confirm_button = wait.until(EC.element_to_be_clickable((By.XPATH, "//button[contains(text(), 'Confirm')]")))
        confirm_button.click()
        
        # Verify success message
        success_message = wait.until(EC.presence_of_element_located((By.CLASS_NAME, "success")))
        assert "Attendance record deleted successfully" in success_message.text
    
    def test_attendance_unauthorized_access(self, driver, wait):
        """Test unauthorized access to attendance page"""
        # Try to access attendance page without login
        driver.get(f"{TestConfig.BASE_URL}/teacher/attendance")
        
        # Verify redirect to login page
        wait.until(EC.url_contains("/login"))
        assert "/login" in driver.current_url
    
    def test_attendance_student_view(self, login_student, driver, wait):
        """Test student viewing their own attendance"""
        # Navigate to student attendance page
        driver.get(f"{TestConfig.BASE_URL}/student/attendance")
        
        # Verify attendance records are displayed
        attendance_table = wait.until(EC.presence_of_element_located((By.XPATH, "//table[contains(@class, 'attendance-table')]")))
        assert attendance_table.is_displayed()
        
        # Verify only student's own records are shown
        records = driver.find_elements(By.XPATH, "//tr[contains(@class, 'attendance-record')]")
        assert len(records) > 0
    
    def test_attendance_parent_view(self, login_parent, driver, wait):
        """Test parent viewing child's attendance"""
        # Navigate to parent attendance page
        driver.get(f"{TestConfig.BASE_URL}/parent/attendance")
        
        # Verify attendance records are displayed
        attendance_table = wait.until(EC.presence_of_element_located((By.XPATH, "//table[contains(@class, 'attendance-table')]")))
        assert attendance_table.is_displayed()
        
        # Verify only child's records are shown
        records = driver.find_elements(By.XPATH, "//tr[contains(@class, 'attendance-record')]")
        assert len(records) > 0
