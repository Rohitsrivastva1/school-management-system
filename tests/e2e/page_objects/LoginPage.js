const { By } = require('selenium-webdriver');
const BasePage = require('./BasePage');

class LoginPage extends BasePage {
  constructor(driver) {
    super(driver);
    
    // Locators
    this.locators = {
      // Form elements
      emailInput: By.css('input[name="email"]'),
      passwordInput: By.css('input[name="password"]'),
      loginButton: By.css('button[type="submit"]'),
      rememberMeCheckbox: By.css('input[name="rememberMe"]'),
      
      // Links
      forgotPasswordLink: By.css('a[href="/forgot-password"]'),
      registerLink: By.css('a[href="/register"]'),
      backToHomeLink: By.css('a[href="/"]'),
      
      // Error messages
      errorMessage: By.css('[data-testid="error-message"]'),
      emailError: By.css('[data-testid="email-error"]'),
      passwordError: By.css('[data-testid="password-error"]'),
      
      // Success messages
      successMessage: By.css('[data-testid="success-message"]'),
      
      // Loading states
      loadingSpinner: By.css('[data-testid="loading-spinner"]'),
      
      // Page elements
      pageTitle: By.css('h1'),
      pageSubtitle: By.css('p'),
      formContainer: By.css('[data-testid="login-form"]'),
      
      // Social login (if implemented)
      googleLoginButton: By.css('[data-testid="google-login"]'),
      facebookLoginButton: By.css('[data-testid="facebook-login"]')
    };
  }

  // Form interaction methods
  async enterEmail(email) {
    await this.sendKeysToElement(this.locators.emailInput, email);
  }

  async enterPassword(password) {
    await this.sendKeysToElement(this.locators.passwordInput, password);
  }

  async clickLoginButton() {
    await this.clickElement(this.locators.loginButton);
  }

  async clickRememberMe() {
    await this.clickElement(this.locators.rememberMeCheckbox);
  }

  async clickForgotPasswordLink() {
    await this.clickElement(this.locators.forgotPasswordLink);
  }

  async clickRegisterLink() {
    await this.clickElement(this.locators.registerLink);
  }

  async clickBackToHomeLink() {
    await this.clickElement(this.locators.backToHomeLink);
  }

  // Social login methods
  async clickGoogleLogin() {
    await this.clickElement(this.locators.googleLoginButton);
  }

  async clickFacebookLogin() {
    await this.clickElement(this.locators.facebookLoginButton);
  }

  // Form submission
  async login(email, password, rememberMe = false) {
    await this.enterEmail(email);
    await this.enterPassword(password);
    
    if (rememberMe) {
      await this.clickRememberMe();
    }
    
    await this.clickLoginButton();
  }

  // Validation methods
  async getEmailValue() {
    return await this.getElementAttribute(this.locators.emailInput, 'value');
  }

  async getPasswordValue() {
    return await this.getElementAttribute(this.locators.passwordInput, 'value');
  }

  async isRememberMeChecked() {
    return await this.getElementAttribute(this.locators.rememberMeCheckbox, 'checked') === 'true';
  }

  async isLoginButtonEnabled() {
    return await this.isElementEnabled(this.locators.loginButton);
  }

  // Error handling
  async getErrorMessage() {
    try {
      return await this.getElementText(this.locators.errorMessage);
    } catch (error) {
      return null;
    }
  }

  async getEmailError() {
    try {
      return await this.getElementText(this.locators.emailError);
    } catch (error) {
      return null;
    }
  }

  async getPasswordError() {
    try {
      return await this.getElementText(this.locators.passwordError);
    } catch (error) {
      return null;
    }
  }

  async getSuccessMessage() {
    try {
      return await this.getElementText(this.locators.successMessage);
    } catch (error) {
      return null;
    }
  }

  // Loading state
  async isLoading() {
    return await this.isElementDisplayed(this.locators.loadingSpinner);
  }

  async waitForLoadingToComplete() {
    try {
      await this.driver.wait(async () => {
        return !(await this.isLoading());
      }, 10000);
    } catch (error) {
      // Loading might not be present, which is fine
    }
  }

  // Page content
  async getPageTitle() {
    return await this.getElementText(this.locators.pageTitle);
  }

  async getPageSubtitle() {
    return await this.getElementText(this.locators.pageSubtitle);
  }

  // Form validation
  async clearForm() {
    await this.sendKeysToElement(this.locators.emailInput, '');
    await this.sendKeysToElement(this.locators.passwordInput, '');
  }

  async isFormValid() {
    const emailValue = await this.getEmailValue();
    const passwordValue = await this.getPasswordValue();
    const buttonEnabled = await this.isLoginButtonEnabled();
    
    return emailValue.length > 0 && passwordValue.length > 0 && buttonEnabled;
  }

  // Accessibility checks
  async getEmailInputPlaceholder() {
    return await this.getElementAttribute(this.locators.emailInput, 'placeholder');
  }

  async getPasswordInputPlaceholder() {
    return await this.getElementAttribute(this.locators.passwordInput, 'placeholder');
  }

  async getEmailInputType() {
    return await this.getElementAttribute(this.locators.emailInput, 'type');
  }

  async getPasswordInputType() {
    return await this.getElementAttribute(this.locators.passwordInput, 'type');
  }
}

module.exports = LoginPage;
