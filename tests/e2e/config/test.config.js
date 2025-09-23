module.exports = {
  // Test environment configuration
  testEnvironment: {
    baseUrl: process.env.BASE_URL || 'http://localhost:3000',
    timeout: 30000,
    retries: 2,
    parallel: 1,
    headless: process.env.HEADLESS === 'true' || false,
    browser: process.env.BROWSER || 'chrome',
    viewport: {
      width: process.env.VIEWPORT_WIDTH || 1920,
      height: process.env.VIEWPORT_HEIGHT || 1080
    }
  },

  // Test data configuration
  testData: {
    validSchool: {
      name: 'Automated Test School',
      email: `test-${Date.now()}@school.com`,
      password: 'TestPass123!',
      confirmPassword: 'TestPass123!',
      address: '123 Test Street',
      city: 'Test City',
      state: 'Test State',
      pincode: '12345',
      phone: '+1-555-123-4567',
      website: 'https://testschool.com'
    },
    
    validAdmin: {
      email: 'admin@school.com',
      password: 'AdminPass123!'
    },
    
    invalidCredentials: {
      email: 'invalid@school.com',
      password: 'WrongPass123!'
    }
  },

  // Screenshot configuration
  screenshots: {
    enabled: true,
    path: 'tests/e2e/reports/screenshots',
    onFailure: true,
    onSuccess: false
  },

  // Reporting configuration
  reporting: {
    cucumber: {
      json: 'tests/e2e/reports/cucumber-report.json',
      html: 'tests/e2e/reports/cucumber-report.html',
      junit: 'tests/e2e/reports/cucumber-report.xml'
    },
    
    allure: {
      enabled: false,
      path: 'tests/e2e/reports/allure-results'
    }
  },

  // Browser configuration
  browsers: {
    chrome: {
      options: [
        '--headless',
        '--no-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--window-size=1920,1080',
        '--disable-extensions',
        '--disable-plugins',
        '--disable-images',
        '--disable-javascript'
      ]
    },
    
    firefox: {
      options: [
        '--headless',
        '--width=1920',
        '--height=1080'
      ]
    }
  },

  // Test tags configuration
  tags: {
    smoke: '@smoke',
    regression: '@regression',
    homepage: '@homepage',
    login: '@login',
    registration: '@registration',
    userJourney: '@user-journey',
    mobile: '@mobile',
    accessibility: '@accessibility',
    performance: '@performance',
    security: '@security'
  },

  // Environment-specific configurations
  environments: {
    development: {
      baseUrl: 'http://localhost:3000',
      headless: false,
      timeout: 10000
    },
    
    staging: {
      baseUrl: 'https://staging.schoolmanagement.com',
      headless: true,
      timeout: 30000
    },
    
    production: {
      baseUrl: 'https://schoolmanagement.com',
      headless: true,
      timeout: 30000
    }
  }
};
