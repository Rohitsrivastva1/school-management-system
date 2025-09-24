"""
Pytest configuration and fixtures
"""
import pytest
import os
import time
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from webdriver_manager.chrome import ChromeDriverManager
from webdriver_manager.firefox import GeckoDriverManager
from webdriver_manager.microsoft import EdgeChromiumDriverManager
from selenium.webdriver.chrome.service import Service as ChromeService
from selenium.webdriver.firefox.service import Service as FirefoxService
from selenium.webdriver.edge.service import Service as EdgeService

from config.test_config import TestConfig
from utils.test_data_generator import TestDataGenerator
from utils.api_helper import APIHelper
from utils.database_helper import DatabaseHelper


@pytest.fixture(scope="session")
def config():
    """Provide test configuration"""
    return TestConfig


@pytest.fixture(scope="function")
def driver(config):
    """Create and configure WebDriver"""
    driver = None
    
    try:
        if config.BROWSER.lower() == 'chrome':
            options = config.get_browser_options()
            service = ChromeService(ChromeDriverManager().install())
            driver = webdriver.Chrome(service=service, options=options)
        elif config.BROWSER.lower() == 'firefox':
            options = config.get_browser_options()
            service = FirefoxService(GeckoDriverManager().install())
            driver = webdriver.Firefox(service=service, options=options)
        elif config.BROWSER.lower() == 'edge':
            service = EdgeService(EdgeChromiumDriverManager().install())
            driver = webdriver.Edge(service=service)
        else:
            raise ValueError(f"Unsupported browser: {config.BROWSER}")
        
        # Configure driver
        driver.implicitly_wait(config.IMPLICIT_WAIT)
        driver.set_page_load_timeout(config.PAGE_LOAD_TIMEOUT)
        driver.maximize_window()
        
        yield driver
        
    except Exception as e:
        print(f"Error creating driver: {e}")
        raise
    finally:
        if driver:
            driver.quit()


@pytest.fixture(scope="function")
def wait(driver):
    """Create WebDriverWait instance"""
    return WebDriverWait(driver, TestConfig.EXPLICIT_WAIT)


@pytest.fixture(scope="function")
def test_data():
    """Provide test data generator"""
    return TestDataGenerator()


@pytest.fixture(scope="function")
def api_helper():
    """Provide API helper"""
    return APIHelper()


@pytest.fixture(scope="function")
def db_helper():
    """Provide database helper"""
    return DatabaseHelper()


@pytest.fixture(scope="function")
def admin_user(test_data):
    """Provide admin user data"""
    return {
        'email': TestConfig.ADMIN_EMAIL,
        'password': TestConfig.ADMIN_PASSWORD,
        'role': 'admin'
    }


@pytest.fixture(scope="function")
def teacher_user(test_data):
    """Provide teacher user data"""
    return {
        'email': TestConfig.TEACHER_EMAIL,
        'password': TestConfig.TEACHER_PASSWORD,
        'role': 'teacher'
    }


@pytest.fixture(scope="function")
def student_user(test_data):
    """Provide student user data"""
    return {
        'email': TestConfig.STUDENT_EMAIL,
        'password': TestConfig.STUDENT_PASSWORD,
        'role': 'student'
    }


@pytest.fixture(scope="function")
def parent_user(test_data):
    """Provide parent user data"""
    return {
        'email': TestConfig.PARENT_EMAIL,
        'password': TestConfig.PARENT_PASSWORD,
        'role': 'parent'
    }


@pytest.fixture(scope="function")
def login_admin(driver, wait, admin_user):
    """Login as admin and return driver"""
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
    
    # Wait for redirect to dashboard
    wait.until(EC.url_contains("/admin/dashboard"))
    
    return driver


@pytest.fixture(scope="function")
def login_teacher(driver, wait, teacher_user):
    """Login as teacher and return driver"""
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
    
    # Wait for redirect to dashboard
    wait.until(EC.url_contains("/teacher/dashboard"))
    
    return driver


@pytest.fixture(scope="function")
def login_student(driver, wait, student_user):
    """Login as student and return driver"""
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
    
    # Wait for redirect to dashboard
    wait.until(EC.url_contains("/student/dashboard"))
    
    return driver


@pytest.fixture(scope="function")
def login_parent(driver, wait, parent_user):
    """Login as parent and return driver"""
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
    
    # Wait for redirect to dashboard
    wait.until(EC.url_contains("/parent/dashboard"))
    
    return driver


@pytest.fixture(autouse=True)
def screenshot_on_failure(request, driver):
    """Take screenshot on test failure"""
    yield
    
    if request.node.rep_call.failed and TestConfig.SCREENSHOT_ON_FAILURE:
        timestamp = time.strftime("%Y%m%d_%H%M%S")
        screenshot_name = f"{request.node.name}_{timestamp}.png"
        screenshot_path = os.path.join(TestConfig.REPORTS_DIR, screenshot_name)
        
        try:
            driver.save_screenshot(screenshot_path)
            print(f"Screenshot saved: {screenshot_path}")
        except Exception as e:
            print(f"Failed to save screenshot: {e}")


@pytest.hookimpl(tryfirst=True, hookwrapper=True)
def pytest_runtest_makereport(item, call):
    """Hook to capture test results"""
    outcome = yield
    rep = outcome.get_result()
    setattr(item, "rep_" + rep.when, rep)
