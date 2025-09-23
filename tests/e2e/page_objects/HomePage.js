const { By } = require('selenium-webdriver');
const BasePage = require('./BasePage');

class HomePage extends BasePage {
  constructor(driver) {
    super(driver);
    
    // Locators
    this.locators = {
      // Navigation
      navigationBar: By.css('nav'),
      logo: By.css('[data-testid="logo"]'),
      homeLink: By.css('a[href="/"]'),
      loginLink: By.css('a[href="/login"]'),
      registerLink: By.css('a[href="/register"]'),
      
      // Hero Section
      heroSection: By.css('[data-testid="hero-section"]'),
      heroTitle: By.css('[data-testid="hero-title"]'),
      heroSubtitle: By.css('[data-testid="hero-subtitle"]'),
      getStartedButton: By.css('[data-testid="get-started-button"]'),
      
      // Features Section
      featuresSection: By.css('[data-testid="features-section"]'),
      featureCards: By.css('[data-testid="feature-card"]'),
      
      // Trust Indicators
      trustSection: By.css('[data-testid="trust-section"]'),
      statsCards: By.css('[data-testid="stat-card"]'),
      
      // Footer
      footer: By.css('footer'),
      footerLinks: By.css('footer a'),
      
      // CTA Buttons
      primaryCTA: By.css('[data-testid="primary-cta"]'),
      secondaryCTA: By.css('[data-testid="secondary-cta"]')
    };
  }

  // Navigation methods
  async clickLoginLink() {
    await this.clickElement(this.locators.loginLink);
  }

  async clickRegisterLink() {
    await this.clickElement(this.locators.registerLink);
  }

  async clickGetStartedButton() {
    await this.clickElement(this.locators.getStartedButton);
  }

  async clickPrimaryCTA() {
    await this.clickElement(this.locators.primaryCTA);
  }

  async clickSecondaryCTA() {
    await this.clickElement(this.locators.secondaryCTA);
  }

  // Content verification methods
  async getHeroTitle() {
    return await this.getElementText(this.locators.heroTitle);
  }

  async getHeroSubtitle() {
    return await this.getElementText(this.locators.heroSubtitle);
  }

  async getFeatureCardsCount() {
    const elements = await this.driver.findElements(this.locators.featureCards);
    return elements.length;
  }

  async getStatsCardsCount() {
    const elements = await this.driver.findElements(this.locators.statsCards);
    return elements.length;
  }

  async getFooterLinksCount() {
    const elements = await this.driver.findElements(this.locators.footerLinks);
    return elements.length;
  }

  // Visibility checks
  async isNavigationBarVisible() {
    return await this.isElementDisplayed(this.locators.navigationBar);
  }

  async isHeroSectionVisible() {
    return await this.isElementDisplayed(this.locators.heroSection);
  }

  async isFeaturesSectionVisible() {
    return await this.isElementDisplayed(this.locators.featuresSection);
  }

  async isTrustSectionVisible() {
    return await this.isElementDisplayed(this.locators.trustSection);
  }

  async isFooterVisible() {
    return await this.isElementDisplayed(this.locators.footer);
  }

  // Interaction methods
  async scrollToFeatures() {
    await this.scrollToElement(this.locators.featuresSection);
  }

  async scrollToTrustSection() {
    await this.scrollToElement(this.locators.trustSection);
  }

  async scrollToFooter() {
    await this.scrollToElement(this.locators.footer);
  }

  // Feature card interactions
  async getFeatureCardTitle(index) {
    const featureCards = await this.driver.findElements(this.locators.featureCards);
    if (featureCards[index]) {
      const titleElement = await featureCards[index].findElement(By.css('[data-testid="feature-title"]'));
      return await titleElement.getText();
    }
    throw new Error(`Feature card at index ${index} not found`);
  }

  async getFeatureCardDescription(index) {
    const featureCards = await this.driver.findElements(this.locators.featureCards);
    if (featureCards[index]) {
      const descElement = await featureCards[index].findElement(By.css('[data-testid="feature-description"]'));
      return await descElement.getText();
    }
    throw new Error(`Feature card at index ${index} not found`);
  }

  // Stats card interactions
  async getStatCardValue(index) {
    const statsCards = await this.driver.findElements(this.locators.statsCards);
    if (statsCards[index]) {
      const valueElement = await statsCards[index].findElement(By.css('[data-testid="stat-value"]'));
      return await valueElement.getText();
    }
    throw new Error(`Stat card at index ${index} not found`);
  }

  async getStatCardLabel(index) {
    const statsCards = await this.driver.findElements(this.locators.statsCards);
    if (statsCards[index]) {
      const labelElement = await statsCards[index].findElement(By.css('[data-testid="stat-label"]'));
      return await labelElement.getText();
    }
    throw new Error(`Stat card at index ${index} not found`);
  }
}

module.exports = HomePage;
