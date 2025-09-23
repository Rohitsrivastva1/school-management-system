#!/usr/bin/env node

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

class TestRunner {
  constructor() {
    this.projectRoot = path.join(__dirname, '../..');
    this.testConfig = require('./config/test.config');
    this.reporter = require('./config/reporting.config');
  }

  async runTests(options = {}) {
    const {
      tags = '',
      browser = 'chrome',
      headless = true,
      parallel = 1,
      timeout = 30000
    } = options;

    console.log('🚀 Starting E2E Test Suite...');
    console.log(`📊 Configuration:`);
    console.log(`   Browser: ${browser}`);
    console.log(`   Headless: ${headless}`);
    console.log(`   Parallel: ${parallel}`);
    console.log(`   Timeout: ${timeout}ms`);
    console.log(`   Tags: ${tags || 'All tests'}`);
    console.log('');

    try {
      // Set environment variables
      process.env.BROWSER = browser;
      process.env.HEADLESS = headless.toString();
      process.env.PARALLEL = parallel.toString();
      process.env.TIMEOUT = timeout.toString();

      // Build cucumber command
      const cucumberCommand = this.buildCucumberCommand(tags);
      
      console.log(`🔧 Running command: ${cucumberCommand}`);
      console.log('');

      // Execute tests
      const startTime = Date.now();
      const result = execSync(cucumberCommand, { 
        cwd: this.projectRoot,
        stdio: 'inherit',
        encoding: 'utf8'
      });
      
      const duration = Date.now() - startTime;
      console.log(`\n✅ Tests completed in ${duration}ms`);

      return { success: true, duration };

    } catch (error) {
      console.error('\n❌ Test execution failed:', error.message);
      return { success: false, error: error.message };
    }
  }

  buildCucumberCommand(tags) {
    const configPath = path.join(__dirname, 'config/cucumber.config.js');
    let command = `npx cucumber-js --config ${configPath}`;

    if (tags) {
      command += ` --tags "${tags}"`;
    }

    return command;
  }

  async runSmokeTests() {
    console.log('🔥 Running Smoke Tests...');
    return await this.runTests({ 
      tags: '@smoke',
      headless: false,
      timeout: 15000
    });
  }

  async runRegressionTests() {
    console.log('🔄 Running Regression Tests...');
    return await this.runTests({ 
      tags: '@regression',
      headless: true,
      timeout: 30000
    });
  }

  async runHomepageTests() {
    console.log('🏠 Running Homepage Tests...');
    return await this.runTests({ 
      tags: '@homepage',
      headless: false
    });
  }

  async runLoginTests() {
    console.log('🔐 Running Login Tests...');
    return await this.runTests({ 
      tags: '@login',
      headless: false
    });
  }

  async runRegistrationTests() {
    console.log('📝 Running Registration Tests...');
    return await this.runTests({ 
      tags: '@registration',
      headless: false
    });
  }

  async runUserJourneyTests() {
    console.log('👤 Running User Journey Tests...');
    return await this.runTests({ 
      tags: '@user-journey',
      headless: false,
      timeout: 60000
    });
  }

  async runAccessibilityTests() {
    console.log('♿ Running Accessibility Tests...');
    return await this.runTests({ 
      tags: '@accessibility',
      headless: false
    });
  }

  async runPerformanceTests() {
    console.log('⚡ Running Performance Tests...');
    return await this.runTests({ 
      tags: '@performance',
      headless: true,
      timeout: 45000
    });
  }

  async runSecurityTests() {
    console.log('🔒 Running Security Tests...');
    return await this.runTests({ 
      tags: '@security',
      headless: true
    });
  }

  async runMobileTests() {
    console.log('📱 Running Mobile Tests...');
    return await this.runTests({ 
      tags: '@mobile',
      headless: false,
      browser: 'chrome'
    });
  }

  async runAllTests() {
    console.log('🎯 Running All Tests...');
    return await this.runTests({ 
      headless: true,
      timeout: 60000
    });
  }

  generateReport() {
    console.log('📊 Generating Test Report...');
    
    const reportsDir = path.join(__dirname, 'reports');
    if (!fs.existsSync(reportsDir)) {
      console.log('No test reports found. Run tests first.');
      return;
    }

    const reportFiles = fs.readdirSync(reportsDir)
      .filter(file => file.endsWith('.json'))
      .map(file => path.join(reportsDir, file));

    if (reportFiles.length === 0) {
      console.log('No JSON report files found.');
      return;
    }

    // Generate HTML report
    const htmlReport = this.reporter.generateHTMLReport([]);
    console.log(`📄 HTML Report generated: ${htmlReport}`);

    // Generate JUnit report
    const junitReport = this.reporter.generateJUnitReport([]);
    console.log(`📋 JUnit Report generated: ${junitReport}`);
  }

  showHelp() {
    console.log(`
🎯 School Management System - E2E Test Runner

Usage: node run-tests.js [command] [options]

Commands:
  smoke              Run smoke tests only
  regression         Run regression tests
  homepage           Run homepage tests
  login              Run login tests
  registration       Run registration tests
  user-journey       Run user journey tests
  accessibility      Run accessibility tests
  performance        Run performance tests
  security           Run security tests
  mobile             Run mobile tests
  all                Run all tests
  report             Generate test reports
  help               Show this help message

Options:
  --tags <tags>      Run tests with specific tags
  --browser <browser> Browser to use (chrome, firefox)
  --headless         Run in headless mode
  --parallel <num>   Number of parallel executions
  --timeout <ms>     Test timeout in milliseconds

Examples:
  node run-tests.js smoke
  node run-tests.js login --headless
  node run-tests.js all --browser firefox
  node run-tests.js --tags "@smoke and @homepage"
  node run-tests.js report
`);
  }
}

// CLI Interface
async function main() {
  const args = process.argv.slice(2);
  const runner = new TestRunner();

  if (args.length === 0 || args.includes('help')) {
    runner.showHelp();
    return;
  }

  const command = args[0];
  const options = {};

  // Parse options
  for (let i = 1; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--tags' && args[i + 1]) {
      options.tags = args[++i];
    } else if (arg === '--browser' && args[i + 1]) {
      options.browser = args[++i];
    } else if (arg === '--headless') {
      options.headless = true;
    } else if (arg === '--parallel' && args[i + 1]) {
      options.parallel = parseInt(args[++i]);
    } else if (arg === '--timeout' && args[i + 1]) {
      options.timeout = parseInt(args[++i]);
    }
  }

  try {
    switch (command) {
      case 'smoke':
        await runner.runSmokeTests();
        break;
      case 'regression':
        await runner.runRegressionTests();
        break;
      case 'homepage':
        await runner.runHomepageTests();
        break;
      case 'login':
        await runner.runLoginTests();
        break;
      case 'registration':
        await runner.runRegistrationTests();
        break;
      case 'user-journey':
        await runner.runUserJourneyTests();
        break;
      case 'accessibility':
        await runner.runAccessibilityTests();
        break;
      case 'performance':
        await runner.runPerformanceTests();
        break;
      case 'security':
        await runner.runSecurityTests();
        break;
      case 'mobile':
        await runner.runMobileTests();
        break;
      case 'all':
        await runner.runAllTests();
        break;
      case 'report':
        runner.generateReport();
        break;
      default:
        await runner.runTests(options);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = TestRunner;
