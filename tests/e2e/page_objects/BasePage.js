const { By, until } = require('selenium-webdriver');

class BasePage {
  constructor(driver) {
    this.driver = driver;
  }

  async waitForElement(locator, timeout = 10000) {
    return await this.driver.wait(until.elementLocated(locator), timeout);
  }

  async waitForElementVisible(locator, timeout = 10000) {
    const element = await this.waitForElement(locator, timeout);
    return await this.driver.wait(until.elementIsVisible(element), timeout);
  }

  async waitForElementClickable(locator, timeout = 10000) {
    const element = await this.waitForElement(locator, timeout);
    return await this.driver.wait(until.elementIsEnabled(element), timeout);
  }

  async clickElement(locator) {
    const element = await this.waitForElementClickable(locator);
    await element.click();
  }

  async sendKeysToElement(locator, text) {
    const element = await this.waitForElementVisible(locator);
    await element.clear();
    await element.sendKeys(text);
  }

  async getElementText(locator) {
    const element = await this.waitForElementVisible(locator);
    return await element.getText();
  }

  async getElementAttribute(locator, attribute) {
    const element = await this.waitForElement(locator);
    return await element.getAttribute(attribute);
  }

  async isElementDisplayed(locator) {
    try {
      const element = await this.driver.findElement(locator);
      return await element.isDisplayed();
    } catch (error) {
      return false;
    }
  }

  async isElementEnabled(locator) {
    try {
      const element = await this.driver.findElement(locator);
      return await element.isEnabled();
    } catch (error) {
      return false;
    }
  }

  async waitForUrlToContain(text, timeout = 10000) {
    await this.driver.wait(until.urlContains(text), timeout);
  }

  async getCurrentUrl() {
    return await this.driver.getCurrentUrl();
  }

  async getPageTitle() {
    return await this.driver.getTitle();
  }

  async scrollToElement(locator) {
    const element = await this.waitForElement(locator);
    await this.driver.executeScript('arguments[0].scrollIntoView(true);', element);
  }

  async takeScreenshot(name) {
    const screenshot = await this.driver.takeScreenshot();
    const fs = require('fs');
    const path = require('path');
    const screenshotPath = path.join(__dirname, '../reports/screenshots', `${name}_${Date.now()}.png`);
    
    // Ensure directory exists
    const dir = path.dirname(screenshotPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    fs.writeFileSync(screenshotPath, screenshot, 'base64');
    return screenshotPath;
  }
}

module.exports = BasePage;
