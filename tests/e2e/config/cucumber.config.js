module.exports = {
  default: {
    require: [
      'tests/e2e/step_definitions/**/*.js',
      'tests/e2e/page_objects/**/*.js'
    ],
    format: [
      'progress-bar',
      'json:tests/e2e/reports/cucumber-report.json',
      'html:tests/e2e/reports/cucumber-report.html'
    ],
    formatOptions: {
      snippetInterface: 'async-await'
    },
    paths: ['tests/e2e/features/**/*.feature'],
    publishQuiet: true,
    dryRun: false,
    failFast: false,
    parallel: 1,
    retry: 1,
    timeout: 30000
  }
};
