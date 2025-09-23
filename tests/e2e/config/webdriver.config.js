const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const firefox = require('selenium-webdriver/firefox');

class WebDriverManager {
  constructor() {
    this.driver = null;
    this.baseUrl = process.env.BASE_URL || 'http://localhost:3000';
  }

  async createDriver(browser = 'chrome') {
    let options;
    
    switch (browser.toLowerCase()) {
      case 'chrome':
        options = new chrome.Options();
        options.addArguments('--headless'); // Run in headless mode for CI/CD
        options.addArguments('--no-sandbox');
        options.addArguments('--disable-dev-shm-usage');
        options.addArguments('--disable-gpu');
        options.addArguments('--window-size=1920,1080');
        break;
      case 'firefox':
        options = new firefox.Options();
        options.addArguments('--headless');
        break;
      default:
        throw new Error(`Unsupported browser: ${browser}`);
    }

    this.driver = await new Builder()
      .forBrowser(browser)
      .setChromeOptions(options)
      .build();

    // Set implicit wait
    await this.driver.manage().setTimeouts({ implicit: 10000 });
    
    // Maximize window
    await this.driver.manage().window().maximize();
    
    return this.driver;
  }

  async navigateTo(path = '') {
    const url = `${this.baseUrl}${path}`;
    await this.driver.get(url);
    await this.driver.wait(until.titleContains('School Management'), 10000);
  }

  async quit() {
    if (this.driver) {
      await this.driver.quit();
      this.driver = null;
    }
  }

  getDriver() {
    return this.driver;
  }
}

module.exports = WebDriverManager;
