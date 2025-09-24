"""
Test Configuration for School Management System
"""
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class TestConfig:
    """Test configuration settings"""
    
    # Application URLs
    BASE_URL = os.getenv('BASE_URL', 'http://localhost:3000')
    API_BASE_URL = os.getenv('API_BASE_URL', 'http://localhost:3001/api/v1')
    
    # Browser Configuration
    BROWSER = os.getenv('BROWSER', 'chrome')  # chrome, firefox, edge
    HEADLESS = os.getenv('HEADLESS', 'false').lower() == 'true'
    WINDOW_SIZE = (1920, 1080)
    
    # Test Data
    TEST_DATA_DIR = os.path.join(os.path.dirname(__file__), '..', 'data')
    REPORTS_DIR = os.path.join(os.path.dirname(__file__), '..', 'reports')
    
    # Timeouts (in seconds)
    IMPLICIT_WAIT = 10
    EXPLICIT_WAIT = 20
    PAGE_LOAD_TIMEOUT = 30
    
    # Test Users
    ADMIN_EMAIL = os.getenv('ADMIN_EMAIL', 'admin@school.com')
    ADMIN_PASSWORD = os.getenv('ADMIN_PASSWORD', 'admin123')
    
    TEACHER_EMAIL = os.getenv('TEACHER_EMAIL', 'teacher@school.com')
    TEACHER_PASSWORD = os.getenv('TEACHER_PASSWORD', 'teacher123')
    
    STUDENT_EMAIL = os.getenv('STUDENT_EMAIL', 'student@school.com')
    STUDENT_PASSWORD = os.getenv('STUDENT_PASSWORD', 'student123')
    
    PARENT_EMAIL = os.getenv('PARENT_EMAIL', 'parent@school.com')
    PARENT_PASSWORD = os.getenv('PARENT_PASSWORD', 'parent123')
    
    # Database Configuration
    DB_HOST = os.getenv('DB_HOST', 'localhost')
    DB_PORT = os.getenv('DB_PORT', '5432')
    DB_NAME = os.getenv('DB_NAME', 'school_management')
    DB_USER = os.getenv('DB_USER', 'postgres')
    DB_PASSWORD = os.getenv('DB_PASSWORD', 'password')
    
    # Test Execution
    PARALLEL_WORKERS = int(os.getenv('PARALLEL_WORKERS', '2'))
    RETRY_COUNT = int(os.getenv('RETRY_COUNT', '2'))
    SCREENSHOT_ON_FAILURE = os.getenv('SCREENSHOT_ON_FAILURE', 'true').lower() == 'true'
    
    # API Testing
    API_TIMEOUT = 30
    API_RETRY_COUNT = 3
    
    # Performance Testing
    LOAD_TEST_USERS = int(os.getenv('LOAD_TEST_USERS', '10'))
    LOAD_TEST_DURATION = int(os.getenv('LOAD_TEST_DURATION', '60'))  # seconds
    
    # Test Categories
    SMOKE_TESTS = ['auth', 'dashboard', 'navigation']
    REGRESSION_TESTS = ['all']
    PERFORMANCE_TESTS = ['load', 'stress', 'volume']
    
    @classmethod
    def get_browser_options(cls):
        """Get browser-specific options"""
        if cls.BROWSER.lower() == 'chrome':
            from selenium.webdriver.chrome.options import Options
            options = Options()
            if cls.HEADLESS:
                options.add_argument('--headless')
            options.add_argument('--no-sandbox')
            options.add_argument('--disable-dev-shm-usage')
            options.add_argument('--disable-gpu')
            options.add_argument('--window-size=1920,1080')
            options.add_argument('--disable-extensions')
            options.add_argument('--disable-plugins')
            options.add_argument('--disable-images')
            return options
        elif cls.BROWSER.lower() == 'firefox':
            from selenium.webdriver.firefox.options import Options
            options = Options()
            if cls.HEADLESS:
                options.add_argument('--headless')
            options.add_argument('--width=1920')
            options.add_argument('--height=1080')
            return options
        else:
            raise ValueError(f"Unsupported browser: {cls.BROWSER}")
