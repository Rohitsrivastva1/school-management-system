const fs = require('fs');
const path = require('path');

class TestReporter {
  constructor() {
    this.reportsDir = path.join(__dirname, '../reports');
    this.screenshotsDir = path.join(this.reportsDir, 'screenshots');
    this.ensureDirectories();
  }

  ensureDirectories() {
    if (!fs.existsSync(this.reportsDir)) {
      fs.mkdirSync(this.reportsDir, { recursive: true });
    }
    if (!fs.existsSync(this.screenshotsDir)) {
      fs.mkdirSync(this.screenshotsDir, { recursive: true });
    }
  }

  generateTestReport(testResults) {
    const report = {
      timestamp: new Date().toISOString(),
      summary: this.generateSummary(testResults),
      details: testResults,
      environment: this.getEnvironmentInfo(),
      recommendations: this.generateRecommendations(testResults)
    };

    const reportPath = path.join(this.reportsDir, `test-report-${Date.now()}.json`);
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    return reportPath;
  }

  generateSummary(testResults) {
    const total = testResults.length;
    const passed = testResults.filter(result => result.status === 'PASSED').length;
    const failed = testResults.filter(result => result.status === 'FAILED').length;
    const skipped = testResults.filter(result => result.status === 'SKIPPED').length;

    return {
      total,
      passed,
      failed,
      skipped,
      passRate: total > 0 ? ((passed / total) * 100).toFixed(2) : 0,
      duration: testResults.reduce((sum, result) => sum + result.duration, 0)
    };
  }

  getEnvironmentInfo() {
    return {
      nodeVersion: process.version,
      platform: process.platform,
      arch: process.arch,
      timestamp: new Date().toISOString(),
      userAgent: 'Selenium WebDriver'
    };
  }

  generateRecommendations(testResults) {
    const recommendations = [];
    const failedTests = testResults.filter(result => result.status === 'FAILED');

    if (failedTests.length > 0) {
      recommendations.push('Review failed test cases and fix underlying issues');
      
      const commonFailures = this.analyzeCommonFailures(failedTests);
      if (commonFailures.length > 0) {
        recommendations.push(`Common failure patterns: ${commonFailures.join(', ')}`);
      }
    }

    const slowTests = testResults.filter(result => result.duration > 10000);
    if (slowTests.length > 0) {
      recommendations.push('Optimize slow-running tests for better performance');
    }

    return recommendations;
  }

  analyzeCommonFailures(failedTests) {
    const failurePatterns = {};
    
    failedTests.forEach(test => {
      const error = test.error || 'Unknown error';
      const pattern = this.categorizeError(error);
      failurePatterns[pattern] = (failurePatterns[pattern] || 0) + 1;
    });

    return Object.entries(failurePatterns)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([pattern]) => pattern);
  }

  categorizeError(error) {
    const errorStr = error.toString().toLowerCase();
    
    if (errorStr.includes('timeout')) return 'Timeout Issues';
    if (errorStr.includes('element not found')) return 'Element Not Found';
    if (errorStr.includes('not clickable')) return 'Element Not Clickable';
    if (errorStr.includes('network')) return 'Network Issues';
    if (errorStr.includes('javascript')) return 'JavaScript Errors';
    
    return 'Other Issues';
  }

  generateHTMLReport(testResults) {
    const summary = this.generateSummary(testResults);
    const html = `
<!DOCTYPE html>
<html>
<head>
    <title>Test Report - School Management System</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { background-color: #f0f0f0; padding: 20px; border-radius: 5px; }
        .summary { display: flex; gap: 20px; margin: 20px 0; }
        .metric { background-color: #e8f4fd; padding: 15px; border-radius: 5px; text-align: center; }
        .metric.passed { background-color: #d4edda; }
        .metric.failed { background-color: #f8d7da; }
        .metric.skipped { background-color: #fff3cd; }
        .test-result { margin: 10px 0; padding: 10px; border-radius: 5px; }
        .test-result.passed { background-color: #d4edda; }
        .test-result.failed { background-color: #f8d7da; }
        .test-result.skipped { background-color: #fff3cd; }
        .error { color: #721c24; font-family: monospace; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Test Report - School Management System</h1>
        <p>Generated on: ${new Date().toLocaleString()}</p>
    </div>
    
    <div class="summary">
        <div class="metric">
            <h3>Total Tests</h3>
            <h2>${summary.total}</h2>
        </div>
        <div class="metric passed">
            <h3>Passed</h3>
            <h2>${summary.passed}</h2>
        </div>
        <div class="metric failed">
            <h3>Failed</h3>
            <h2>${summary.failed}</h2>
        </div>
        <div class="metric skipped">
            <h3>Skipped</h3>
            <h2>${summary.skipped}</h2>
        </div>
    </div>
    
    <h2>Test Results</h2>
    ${testResults.map(result => `
        <div class="test-result ${result.status.toLowerCase()}">
            <h4>${result.name}</h4>
            <p>Status: ${result.status} | Duration: ${result.duration}ms</p>
            ${result.error ? `<div class="error">Error: ${result.error}</div>` : ''}
        </div>
    `).join('')}
</body>
</html>`;

    const htmlPath = path.join(this.reportsDir, `test-report-${Date.now()}.html`);
    fs.writeFileSync(htmlPath, html);
    
    return htmlPath;
  }

  generateJUnitReport(testResults) {
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<testsuite name="School Management System E2E Tests" tests="${testResults.length}" failures="${testResults.filter(r => r.status === 'FAILED').length}" skipped="${testResults.filter(r => r.status === 'SKIPPED').length}" time="${testResults.reduce((sum, r) => sum + r.duration, 0) / 1000}">
${testResults.map(result => `
  <testcase name="${result.name}" time="${result.duration / 1000}">
    ${result.status === 'FAILED' ? `<failure message="${result.error}">${result.error}</failure>` : ''}
    ${result.status === 'SKIPPED' ? '<skipped/>' : ''}
  </testcase>`).join('')}
</testsuite>`;

    const xmlPath = path.join(this.reportsDir, `junit-report-${Date.now()}.xml`);
    fs.writeFileSync(xmlPath, xml);
    
    return xmlPath;
  }
}

module.exports = TestReporter;
