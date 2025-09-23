#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 Verifying E2E Testing Framework Setup...\n');

// Check if required directories exist
const requiredDirs = [
  'tests/e2e',
  'tests/e2e/config',
  'tests/e2e/features',
  'tests/e2e/step_definitions',
  'tests/e2e/page_objects',
  'tests/e2e/reports'
];

console.log('📁 Checking directory structure:');
requiredDirs.forEach(dir => {
  const exists = fs.existsSync(dir);
  console.log(`   ${exists ? '✅' : '❌'} ${dir}`);
});

// Check if required files exist
const requiredFiles = [
  'tests/e2e/config/cucumber.config.js',
  'tests/e2e/config/webdriver.config.js',
  'tests/e2e/config/test.config.js',
  'tests/e2e/config/reporting.config.js',
  'tests/e2e/run-tests.js',
  'tests/e2e/page_objects/BasePage.js',
  'tests/e2e/page_objects/HomePage.js',
  'tests/e2e/page_objects/LoginPage.js',
  'tests/e2e/page_objects/RegisterPage.js',
  'tests/e2e/step_definitions/common.steps.js',
  'tests/e2e/step_definitions/homepage.steps.js',
  'tests/e2e/step_definitions/login.steps.js',
  'tests/e2e/step_definitions/registration.steps.js',
  'tests/e2e/step_definitions/user-journey.steps.js',
  'tests/e2e/features/homepage.feature',
  'tests/e2e/features/login.feature',
  'tests/e2e/features/registration.feature',
  'tests/e2e/features/user-journey.feature',
  'tests/e2e/features/setup-verification.feature'
];

console.log('\n📄 Checking required files:');
requiredFiles.forEach(file => {
  const exists = fs.existsSync(file);
  console.log(`   ${exists ? '✅' : '❌'} ${file}`);
});

// Check package.json scripts
console.log('\n📦 Checking package.json scripts:');
try {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const scripts = packageJson.scripts;
  
  const requiredScripts = [
    'e2e',
    'e2e:smoke',
    'e2e:regression',
    'e2e:homepage',
    'e2e:login',
    'e2e:registration',
    'e2e:user-journey',
    'e2e:accessibility',
    'e2e:performance',
    'e2e:security',
    'e2e:mobile',
    'e2e:all',
    'e2e:report'
  ];
  
  requiredScripts.forEach(script => {
    const exists = scripts[script];
    console.log(`   ${exists ? '✅' : '❌'} npm run ${script}`);
  });
} catch (error) {
  console.log('   ❌ Error reading package.json');
}

// Check node_modules for required packages
console.log('\n📚 Checking required packages:');
try {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };
  
  const requiredPackages = [
    'selenium-webdriver',
    '@cucumber/cucumber',
    '@cucumber/pretty-formatter',
    'cucumber-html-reporter',
    'chai',
    'chai-as-promised',
    'chromedriver',
    'geckodriver'
  ];
  
  requiredPackages.forEach(pkg => {
    const exists = dependencies[pkg];
    console.log(`   ${exists ? '✅' : '❌'} ${pkg}${exists ? ` (${exists})` : ''}`);
  });
} catch (error) {
  console.log('   ❌ Error reading package.json');
}

// Check if run-tests.js is executable
console.log('\n🔧 Checking executable permissions:');
try {
  const stats = fs.statSync('tests/e2e/run-tests.js');
  const isExecutable = !!(stats.mode & parseInt('111', 8));
  console.log(`   ${isExecutable ? '✅' : '❌'} tests/e2e/run-tests.js is executable`);
} catch (error) {
  console.log('   ❌ Error checking executable permissions');
}

console.log('\n🎯 Setup Verification Complete!');
console.log('\n📖 Next Steps:');
console.log('   1. Start the School Management System:');
console.log('      - Backend: cd backend && npm run dev');
console.log('      - Frontend: cd frontend && npm run dev');
console.log('   2. Run a quick test:');
console.log('      npm run e2e:smoke');
console.log('   3. View test reports:');
console.log('      npm run e2e:report');
console.log('\n📚 For detailed information, see: E2E_TESTING_GUIDE.md');
