# School Management System - Test Suite

This directory contains comprehensive test cases for the School Management System, including unit tests, integration tests, end-to-end tests, and performance tests.

## Test Structure

```
testing/
├── config/                 # Test configuration files
│   ├── test_config.py     # Main test configuration
│   └── conftest.py        # Pytest configuration and fixtures
├── utils/                 # Test utilities and helpers
│   ├── test_data_generator.py  # Test data generation
│   ├── api_helper.py      # API testing utilities
│   └── database_helper.py # Database testing utilities
├── tests/                 # Test cases
│   ├── e2e/              # End-to-end tests
│   │   ├── test_authentication.py
│   │   ├── test_class_management.py
│   │   ├── test_attendance_management.py
│   │   └── test_homework_management.py
│   ├── integration/      # Integration tests
│   │   └── test_api_integration.py
│   └── performance/      # Performance tests
│       └── test_performance.py
├── data/                 # Test data files
├── reports/              # Test reports
├── requirements.txt      # Python dependencies
├── pytest.ini          # Pytest configuration
├── run_tests.py         # Test runner script
└── README.md           # This file
```

## Test Categories

### 1. End-to-End Tests (E2E)
- **Authentication Tests**: Login, logout, password reset, session management
- **Class Management Tests**: Create, read, update, delete classes
- **Attendance Management Tests**: Mark attendance, view records, export data
- **Homework Management Tests**: Create homework, submit assignments, grade work
- **User Interface Tests**: Form validation, navigation, responsive design

### 2. Integration Tests
- **API Integration Tests**: All REST API endpoints
- **Database Integration Tests**: Data persistence and retrieval
- **External Service Tests**: Email, file upload, notifications

### 3. Performance Tests
- **Load Tests**: Concurrent user operations
- **Stress Tests**: System behavior under extreme load
- **Volume Tests**: Large data set handling
- **Memory Tests**: Memory leak detection
- **Response Time Tests**: API and UI response times

### 4. Security Tests
- **Authentication Security**: Password policies, session management
- **Authorization Tests**: Role-based access control
- **Input Validation**: SQL injection, XSS prevention
- **Data Protection**: Sensitive data handling

### 5. Negative Test Cases
- **Invalid Input Tests**: Malformed data, boundary conditions
- **Error Handling Tests**: System error responses
- **Edge Case Tests**: Unusual scenarios and boundary conditions

## Test Data

The test suite includes comprehensive test data generation for:
- User accounts (admin, teacher, student, parent)
- Class information
- Subject data
- Homework assignments
- Attendance records
- Notifications
- Q&A messages
- Complaints
- File uploads

## Setup Instructions

### 1. Install Dependencies
```bash
cd testing
pip install -r requirements.txt
```

### 2. Configure Environment
```bash
cp env.example .env
# Edit .env with your configuration
```

### 3. Set Up Test Database
```bash
# Ensure PostgreSQL is running
# Create test database
createdb school_management_test
```

### 4. Start Application
```bash
# Start backend
cd ../backend
npm run dev

# Start frontend (in another terminal)
cd ../frontend
npm run dev
```

## Running Tests

### Quick Start
```bash
# Run all tests
python run_tests.py

# Run specific test types
python run_tests.py --test-type smoke
python run_tests.py --test-type regression
python run_tests.py --test-type performance
```

### Detailed Commands

#### Smoke Tests
```bash
python run_tests.py --test-type smoke
```

#### Regression Tests
```bash
python run_tests.py --test-type regression
```

#### Integration Tests
```bash
python run_tests.py --test-type integration
```

#### Performance Tests
```bash
python run_tests.py --test-type performance
```

#### API Tests
```bash
python run_tests.py --test-type api
```

#### UI Tests
```bash
python run_tests.py --test-type ui
```

#### Security Tests
```bash
python run_tests.py --test-type security
```

#### Negative Test Cases
```bash
python run_tests.py --test-type negative
```

#### Edge Case Tests
```bash
python run_tests.py --test-type edge_case
```

### Parallel Execution
```bash
python run_tests.py --parallel
```

### Generate Reports
```bash
python run_tests.py --generate-report
```

## Test Configuration

### Browser Configuration
- **Chrome**: Default browser for UI tests
- **Firefox**: Alternative browser support
- **Headless Mode**: For CI/CD environments
- **Window Size**: Configurable viewport size

### Test Data Configuration
- **User Credentials**: Predefined test users
- **Database Settings**: Test database connection
- **API Endpoints**: Backend API configuration
- **Timeouts**: Request and page load timeouts

### Performance Configuration
- **Load Test Users**: Number of concurrent users
- **Test Duration**: Performance test duration
- **Response Time Limits**: Acceptable response times
- **Memory Limits**: Memory usage thresholds

## Test Reports

The test suite generates multiple types of reports:

### 1. HTML Report
- **Location**: `reports/report.html`
- **Content**: Test results, screenshots, error details
- **Format**: Self-contained HTML file

### 2. Coverage Report
- **Location**: `reports/coverage/index.html`
- **Content**: Code coverage analysis
- **Metrics**: Line coverage, branch coverage, function coverage

### 3. Allure Report
- **Location**: `reports/allure-report/index.html`
- **Content**: Detailed test execution report
- **Features**: Test trends, flaky tests, test categories

### 4. JUnit XML
- **Location**: `reports/junit.xml`
- **Content**: Machine-readable test results
- **Usage**: CI/CD integration

## Test Cases Overview

### Authentication Tests (25+ test cases)
- ✅ Successful login for all user roles
- ✅ Invalid credentials handling
- ✅ Empty field validation
- ✅ Malformed email validation
- ✅ SQL injection prevention
- ✅ XSS attack prevention
- ✅ Session timeout handling
- ✅ Remember me functionality
- ✅ Password reset flow
- ✅ Concurrent login attempts
- ✅ Special character handling

### Class Management Tests (20+ test cases)
- ✅ Create class with valid data
- ✅ Create class with duplicate name/section
- ✅ Create class with empty fields
- ✅ Create class with invalid data
- ✅ View class details
- ✅ Edit class information
- ✅ Delete class successfully
- ✅ Delete class with students
- ✅ Class search functionality
- ✅ Filter by academic year
- ✅ Pagination controls
- ✅ Teacher assignment
- ✅ Capacity validation
- ✅ Room number validation
- ✅ Academic year format validation
- ✅ Bulk operations

### Attendance Management Tests (25+ test cases)
- ✅ Mark attendance successfully
- ✅ No class selected validation
- ✅ No students selected validation
- ✅ Different attendance statuses
- ✅ View attendance by class
- ✅ View attendance by date range
- ✅ Export attendance data
- ✅ Attendance statistics
- ✅ Bulk update attendance
- ✅ Validation errors
- ✅ Duplicate entry prevention
- ✅ Future date validation
- ✅ Weekend validation
- ✅ Holiday validation
- ✅ Edit existing attendance
- ✅ Delete attendance records
- ✅ Unauthorized access prevention
- ✅ Student view attendance
- ✅ Parent view attendance

### Homework Management Tests (20+ test cases)
- ✅ Create homework successfully
- ✅ Empty fields validation
- ✅ Invalid data validation
- ✅ Past due date validation
- ✅ View homework list
- ✅ View homework details
- ✅ Edit homework successfully
- ✅ Delete homework successfully
- ✅ Publish homework
- ✅ Unpublish homework
- ✅ Search functionality
- ✅ Filter by class
- ✅ Filter by status
- ✅ Due date reminders
- ✅ Submission tracking
- ✅ Homework grading
- ✅ Attachment upload
- ✅ Unauthorized access prevention
- ✅ Student view homework
- ✅ Student submit homework
- ✅ Parent view homework

### API Integration Tests (30+ test cases)
- ✅ Authentication APIs
- ✅ User management APIs
- ✅ Class management APIs
- ✅ Attendance APIs
- ✅ Homework APIs
- ✅ Notification APIs
- ✅ Q&A APIs
- ✅ Complaint APIs
- ✅ Dashboard APIs
- ✅ Analytics APIs
- ✅ File upload APIs
- ✅ Rate limiting
- ✅ Error handling
- ✅ Response time validation
- ✅ Data consistency
- ✅ Pagination
- ✅ Filtering
- ✅ Sorting

### Performance Tests (15+ test cases)
- ✅ Concurrent user login
- ✅ Concurrent class creation
- ✅ Concurrent attendance marking
- ✅ Database query performance
- ✅ API response time under load
- ✅ Memory usage under load
- ✅ Concurrent file uploads
- ✅ Database connection pool performance
- ✅ API throughput testing
- ✅ Stress test authentication
- ✅ Memory leak detection

## Best Practices

### 1. Test Data Management
- Use data generators for consistent test data
- Clean up test data after each test
- Use unique identifiers to avoid conflicts

### 2. Error Handling
- Test both positive and negative scenarios
- Verify error messages are user-friendly
- Test edge cases and boundary conditions

### 3. Performance Testing
- Monitor response times and memory usage
- Test under realistic load conditions
- Identify performance bottlenecks

### 4. Security Testing
- Test for common vulnerabilities
- Verify input validation
- Test authorization and access control

### 5. Maintenance
- Keep tests up to date with application changes
- Regular review of test coverage
- Continuous improvement of test quality

## Troubleshooting

### Common Issues

#### 1. Browser Driver Issues
```bash
# Update browser drivers
pip install --upgrade webdriver-manager
```

#### 2. Database Connection Issues
```bash
# Check database status
sudo systemctl status postgresql
# Check connection
psql -h localhost -U postgres -d school_management
```

#### 3. API Connection Issues
```bash
# Check backend status
curl http://localhost:3001/api/v1/health
# Check frontend status
curl http://localhost:3000
```

#### 4. Test Data Issues
```bash
# Reset test database
dropdb school_management_test
createdb school_management_test
```

### Debug Mode
```bash
# Run tests with debug output
pytest tests/ -v -s --tb=long
```

### Screenshot on Failure
```bash
# Enable screenshots on test failure
pytest tests/ --screenshot-on-failure
```

## Contributing

### Adding New Tests
1. Create test file in appropriate directory
2. Follow naming convention: `test_*.py`
3. Use descriptive test names
4. Add appropriate markers
5. Update documentation

### Test Data
1. Use test data generators
2. Ensure data uniqueness
3. Clean up after tests
4. Document test data requirements

### Performance Tests
1. Set realistic load parameters
2. Monitor system resources
3. Document performance expectations
4. Update thresholds as needed

## Support

For issues or questions regarding the test suite:
1. Check the troubleshooting section
2. Review test logs and reports
3. Verify system requirements
4. Contact the development team
