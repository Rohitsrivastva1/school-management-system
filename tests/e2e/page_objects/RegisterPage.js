const { By } = require('selenium-webdriver');
const BasePage = require('./BasePage');

class RegisterPage extends BasePage {
  constructor(driver) {
    super(driver);
    
    // Locators
    this.locators = {
      // School Information
      schoolNameInput: By.css('input[name="name"]'),
      adminEmailInput: By.css('input[name="email"]'),
      passwordInput: By.css('input[name="password"]'),
      confirmPasswordInput: By.css('input[name="confirmPassword"]'),
      
      // Contact Information
      addressInput: By.css('input[name="address"]'),
      cityInput: By.css('input[name="city"]'),
      stateInput: By.css('input[name="state"]'),
      pincodeInput: By.css('input[name="pincode"]'),
      phoneInput: By.css('input[name="phone"]'),
      websiteInput: By.css('input[name="website"]'),
      
      // Form controls
      registerButton: By.css('button[type="submit"]'),
      termsCheckbox: By.css('input[name="terms"]'),
      newsletterCheckbox: By.css('input[name="newsletter"]'),
      
      // Links
      loginLink: By.css('a[href="/login"]'),
      backToHomeLink: By.css('a[href="/"]'),
      
      // Error messages
      errorMessage: By.css('[data-testid="error-message"]'),
      schoolNameError: By.css('[data-testid="name-error"]'),
      emailError: By.css('[data-testid="email-error"]'),
      passwordError: By.css('[data-testid="password-error"]'),
      confirmPasswordError: By.css('[data-testid="confirmPassword-error"]'),
      addressError: By.css('[data-testid="address-error"]'),
      cityError: By.css('[data-testid="city-error"]'),
      stateError: By.css('[data-testid="state-error"]'),
      pincodeError: By.css('[data-testid="pincode-error"]'),
      phoneError: By.css('[data-testid="phone-error"]'),
      websiteError: By.css('[data-testid="website-error"]'),
      
      // Success messages
      successMessage: By.css('[data-testid="success-message"]'),
      
      // Loading states
      loadingSpinner: By.css('[data-testid="loading-spinner"]'),
      
      // Page elements
      pageTitle: By.css('h1'),
      pageSubtitle: By.css('p'),
      formContainer: By.css('[data-testid="register-form"]'),
      
      // Form sections
      schoolInfoSection: By.css('[data-testid="school-info-section"]'),
      contactInfoSection: By.css('[data-testid="contact-info-section"]'),
      
      // Password strength indicator
      passwordStrengthIndicator: By.css('[data-testid="password-strength"]'),
      passwordStrengthText: By.css('[data-testid="password-strength-text"]')
    };
  }

  // School Information methods
  async enterSchoolName(name) {
    await this.sendKeysToElement(this.locators.schoolNameInput, name);
  }

  async enterAdminEmail(email) {
    await this.sendKeysToElement(this.locators.adminEmailInput, email);
  }

  async enterPassword(password) {
    await this.sendKeysToElement(this.locators.passwordInput, password);
  }

  async enterConfirmPassword(password) {
    await this.sendKeysToElement(this.locators.confirmPasswordInput, password);
  }

  // Contact Information methods
  async enterAddress(address) {
    await this.sendKeysToElement(this.locators.addressInput, address);
  }

  async enterCity(city) {
    await this.sendKeysToElement(this.locators.cityInput, city);
  }

  async enterState(state) {
    await this.sendKeysToElement(this.locators.stateInput, state);
  }

  async enterPincode(pincode) {
    await this.sendKeysToElement(this.locators.pincodeInput, pincode);
  }

  async enterPhone(phone) {
    await this.sendKeysToElement(this.locators.phoneInput, phone);
  }

  async enterWebsite(website) {
    await this.sendKeysToElement(this.locators.websiteInput, website);
  }

  // Form controls
  async clickRegisterButton() {
    await this.clickElement(this.locators.registerButton);
  }

  async clickTermsCheckbox() {
    await this.clickElement(this.locators.termsCheckbox);
  }

  async clickNewsletterCheckbox() {
    await this.clickElement(this.locators.newsletterCheckbox);
  }

  async clickLoginLink() {
    await this.clickElement(this.locators.loginLink);
  }

  async clickBackToHomeLink() {
    await this.clickElement(this.locators.backToHomeLink);
  }

  // Complete form submission
  async registerSchool(schoolData) {
    const {
      name,
      email,
      password,
      confirmPassword,
      address,
      city,
      state,
      pincode,
      phone,
      website,
      acceptTerms = true,
      subscribeNewsletter = false
    } = schoolData;

    // School Information
    await this.enterSchoolName(name);
    await this.enterAdminEmail(email);
    await this.enterPassword(password);
    await this.enterConfirmPassword(confirmPassword);

    // Contact Information
    if (address) await this.enterAddress(address);
    if (city) await this.enterCity(city);
    if (state) await this.enterState(state);
    if (pincode) await this.enterPincode(pincode);
    if (phone) await this.enterPhone(phone);
    if (website) await this.enterWebsite(website);

    // Terms and newsletter
    if (acceptTerms) await this.clickTermsCheckbox();
    if (subscribeNewsletter) await this.clickNewsletterCheckbox();

    // Submit form
    await this.clickRegisterButton();
  }

  // Form validation methods
  async getSchoolNameValue() {
    return await this.getElementAttribute(this.locators.schoolNameInput, 'value');
  }

  async getAdminEmailValue() {
    return await this.getElementAttribute(this.locators.adminEmailInput, 'value');
  }

  async getPasswordValue() {
    return await this.getElementAttribute(this.locators.passwordInput, 'value');
  }

  async getConfirmPasswordValue() {
    return await this.getElementAttribute(this.locators.confirmPasswordInput, 'value');
  }

  async getAddressValue() {
    return await this.getElementAttribute(this.locators.addressInput, 'value');
  }

  async getCityValue() {
    return await this.getElementAttribute(this.locators.cityInput, 'value');
  }

  async getStateValue() {
    return await this.getElementAttribute(this.locators.stateInput, 'value');
  }

  async getPincodeValue() {
    return await this.getElementAttribute(this.locators.pincodeInput, 'value');
  }

  async getPhoneValue() {
    return await this.getElementAttribute(this.locators.phoneInput, 'value');
  }

  async getWebsiteValue() {
    return await this.getElementAttribute(this.locators.websiteInput, 'value');
  }

  async isTermsChecked() {
    return await this.getElementAttribute(this.locators.termsCheckbox, 'checked') === 'true';
  }

  async isNewsletterChecked() {
    return await this.getElementAttribute(this.locators.newsletterCheckbox, 'checked') === 'true';
  }

  async isRegisterButtonEnabled() {
    return await this.isElementEnabled(this.locators.registerButton);
  }

  // Error handling
  async getErrorMessage() {
    try {
      return await this.getElementText(this.locators.errorMessage);
    } catch (error) {
      return null;
    }
  }

  async getSchoolNameError() {
    try {
      return await this.getElementText(this.locators.schoolNameError);
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

  async getConfirmPasswordError() {
    try {
      return await this.getElementText(this.locators.confirmPasswordError);
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

  // Password strength
  async getPasswordStrengthText() {
    try {
      return await this.getElementText(this.locators.passwordStrengthText);
    } catch (error) {
      return null;
    }
  }

  async isPasswordStrengthVisible() {
    return await this.isElementDisplayed(this.locators.passwordStrengthIndicator);
  }

  // Loading state
  async isLoading() {
    return await this.isElementDisplayed(this.locators.loadingSpinner);
  }

  async waitForLoadingToComplete() {
    try {
      await this.driver.wait(async () => {
        return !(await this.isLoading());
      }, 15000);
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

  // Form clearing
  async clearForm() {
    await this.sendKeysToElement(this.locators.schoolNameInput, '');
    await this.sendKeysToElement(this.locators.adminEmailInput, '');
    await this.sendKeysToElement(this.locators.passwordInput, '');
    await this.sendKeysToElement(this.locators.confirmPasswordInput, '');
    await this.sendKeysToElement(this.locators.addressInput, '');
    await this.sendKeysToElement(this.locators.cityInput, '');
    await this.sendKeysToElement(this.locators.stateInput, '');
    await this.sendKeysToElement(this.locators.pincodeInput, '');
    await this.sendKeysToElement(this.locators.phoneInput, '');
    await this.sendKeysToElement(this.locators.websiteInput, '');
  }

  // Form validation
  async isFormValid() {
    const schoolName = await this.getSchoolNameValue();
    const email = await this.getAdminEmailValue();
    const password = await this.getPasswordValue();
    const confirmPassword = await this.getConfirmPasswordValue();
    const termsAccepted = await this.isTermsChecked();
    const buttonEnabled = await this.isRegisterButtonEnabled();
    
    return schoolName.length > 0 && 
           email.length > 0 && 
           password.length > 0 && 
           confirmPassword.length > 0 && 
           termsAccepted && 
           buttonEnabled;
  }

  // Accessibility checks
  async getRequiredFieldIndicators() {
    const requiredFields = [
      this.locators.schoolNameInput,
      this.locators.adminEmailInput,
      this.locators.passwordInput,
      this.locators.confirmPasswordInput
    ];
    
    const requiredCount = 0;
    for (const field of requiredFields) {
      const isRequired = await this.getElementAttribute(field, 'required');
      if (isRequired === 'true') requiredCount++;
    }
    
    return requiredCount;
  }
}

module.exports = RegisterPage;
