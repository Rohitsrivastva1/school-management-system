const { Given, When, Then } = require('@cucumber/cucumber');
const { expect } = require('chai');

// Registration page visibility
Then('I should see the school registration form', async function () {
  const isVisible = await registerPage.isElementDisplayed(registerPage.locators.formContainer);
  expect(isVisible).to.be.true;
});

Then('I should see the school name input field', async function () {
  const isVisible = await registerPage.isElementDisplayed(registerPage.locators.schoolNameInput);
  expect(isVisible).to.be.true;
});

Then('I should see the admin email input field', async function () {
  const isVisible = await registerPage.isElementDisplayed(registerPage.locators.adminEmailInput);
  expect(isVisible).to.be.true;
});

Then('I should see the password input field', async function () {
  const isVisible = await registerPage.isElementDisplayed(registerPage.locators.passwordInput);
  expect(isVisible).to.be.true;
});

Then('I should see the confirm password input field', async function () {
  const isVisible = await registerPage.isElementDisplayed(registerPage.locators.confirmPasswordInput);
  expect(isVisible).to.be.true;
});

Then('I should see the register button', async function () {
  const isVisible = await registerPage.isElementDisplayed(registerPage.locators.registerButton);
  expect(isVisible).to.be.true;
});

Then('I should see the login link', async function () {
  const isVisible = await registerPage.isElementDisplayed(registerPage.locators.loginLink);
  expect(isVisible).to.be.true;
});

// Form input actions
When('I enter {string} in the school name field', async function (name) {
  await registerPage.enterSchoolName(name);
});

When('I enter {string} in the email field', async function (email) {
  await registerPage.enterAdminEmail(email);
});

When('I enter {string} in the password field', async function (password) {
  await registerPage.enterPassword(password);
});

When('I enter {string} in the confirm password field', async function (password) {
  await registerPage.enterConfirmPassword(password);
});

When('I enter {string} in the address field', async function (address) {
  await registerPage.enterAddress(address);
});

When('I enter {string} in the city field', async function (city) {
  await registerPage.enterCity(city);
});

When('I enter {string} in the state field', async function (state) {
  await registerPage.enterState(state);
});

When('I enter {string} in the pincode field', async function (pincode) {
  await registerPage.enterPincode(pincode);
});

When('I enter {string} in the phone field', async function (phone) {
  await registerPage.enterPhone(phone);
});

When('I enter {string} in the website field', async function (website) {
  await registerPage.enterWebsite(website);
});

When('I click the register button', async function () {
  await registerPage.clickRegisterButton();
});

When('I check the terms and conditions checkbox', async function () {
  await registerPage.clickTermsCheckbox();
});

When('I check the newsletter subscription checkbox', async function () {
  await registerPage.clickNewsletterCheckbox();
});

// Validation error checks
Then('I should see validation errors', async function () {
  const schoolNameError = await registerPage.getSchoolNameError();
  const emailError = await registerPage.getEmailError();
  const passwordError = await registerPage.getPasswordError();
  const confirmPasswordError = await registerPage.getConfirmPasswordError();
  
  expect(schoolNameError || emailError || passwordError || confirmPasswordError).to.not.be.null;
});

Then('the school name field should show an error', async function () {
  const error = await registerPage.getSchoolNameError();
  expect(error).to.not.be.null;
});

Then('the email field should show an error', async function () {
  const error = await registerPage.getEmailError();
  expect(error).to.not.be.null;
});

Then('the password field should show an error', async function () {
  const error = await registerPage.getPasswordError();
  expect(error).to.not.be.null;
});

Then('the confirm password field should show an error', async function () {
  const error = await registerPage.getConfirmPasswordError();
  expect(error).to.not.be.null;
});

Then('I should see an email format error', async function () {
  const error = await registerPage.getEmailError();
  expect(error).to.include('email') || expect(error).to.include('format');
});

Then('I should see a password strength error', async function () {
  const error = await registerPage.getPasswordError();
  expect(error).to.include('password') || expect(error).to.include('strength');
});

Then('I should see a password mismatch error', async function () {
  const error = await registerPage.getConfirmPasswordError();
  expect(error).to.include('password') || expect(error).to.include('match');
});

Then('I should see an email already exists error', async function () {
  const error = await registerPage.getErrorMessage();
  expect(error).to.include('email') || expect(error).to.include('exists');
});

Then('I should see a registration success message', async function () {
  const successMessage = await registerPage.getSuccessMessage();
  expect(successMessage).to.not.be.null;
  expect(successMessage).to.include('success') || expect(successMessage).to.include('registered');
});

// Password strength indicator
Then('the password strength indicator should show {string}', async function (expectedStrength) {
  const strengthText = await registerPage.getPasswordStrengthText();
  expect(strengthText).to.include(expectedStrength);
});

// Form sections
Then('I should see the school information section', async function () {
  const isVisible = await registerPage.isElementDisplayed(registerPage.locators.schoolInfoSection);
  expect(isVisible).to.be.true;
});

Then('I should see the contact information section', async function () {
  const isVisible = await registerPage.isElementDisplayed(registerPage.locators.contactInfoSection);
  expect(isVisible).to.be.true;
});

Then('the school information section should be required', async function () {
  const schoolNameRequired = await registerPage.getElementAttribute(registerPage.locators.schoolNameInput, 'required');
  const emailRequired = await registerPage.getElementAttribute(registerPage.locators.adminEmailInput, 'required');
  const passwordRequired = await registerPage.getElementAttribute(registerPage.locators.passwordInput, 'required');
  
  expect(schoolNameRequired).to.equal('true');
  expect(emailRequired).to.equal('true');
  expect(passwordRequired).to.equal('true');
});

Then('the contact information section should be optional', async function () {
  const addressRequired = await registerPage.getElementAttribute(registerPage.locators.addressInput, 'required');
  const cityRequired = await registerPage.getElementAttribute(registerPage.locators.cityInput, 'required');
  
  expect(addressRequired).to.not.equal('true');
  expect(cityRequired).to.not.equal('true');
});

// Accessibility checks
Then('all required fields should have proper labels', async function () {
  const requiredFields = [
    registerPage.locators.schoolNameInput,
    registerPage.locators.adminEmailInput,
    registerPage.locators.passwordInput,
    registerPage.locators.confirmPasswordInput
  ];
  
  for (const field of requiredFields) {
    const placeholder = await registerPage.getElementAttribute(field, 'placeholder');
    expect(placeholder).to.not.be.empty;
  }
});

Then('all fields should have proper ARIA attributes', async function () {
  const fields = [
    registerPage.locators.schoolNameInput,
    registerPage.locators.adminEmailInput,
    registerPage.locators.passwordInput
  ];
  
  for (const field of fields) {
    const ariaLabel = await registerPage.getElementAttribute(field, 'aria-label');
    expect(ariaLabel).to.not.be.null;
  }
});

Then('the form should have proper heading structure', async function () {
  const h1Elements = await driver.findElements({ tagName: 'h1' });
  const h2Elements = await driver.findElements({ tagName: 'h2' });
  
  expect(h1Elements.length).to.be.at.least(1);
  expect(h2Elements.length).to.be.at.least(1);
});

Then('the terms checkbox should be accessible', async function () {
  const isVisible = await registerPage.isElementDisplayed(registerPage.locators.termsCheckbox);
  expect(isVisible).to.be.true;
});

// Security checks
Then('the password field should be of type {string}', async function (expectedType) {
  const actualType = await registerPage.getElementAttribute(registerPage.locators.passwordInput, 'type');
  expect(actualType).to.equal(expectedType);
});

Then('the confirm password field should be of type {string}', async function (expectedType) {
  const actualType = await registerPage.getElementAttribute(registerPage.locators.confirmPasswordInput, 'type');
  expect(actualType).to.equal(expectedType);
});

Then('passwords should not be visible in plain text', async function () {
  const passwordType = await registerPage.getElementAttribute(registerPage.locators.passwordInput, 'type');
  const confirmPasswordType = await registerPage.getElementAttribute(registerPage.locators.confirmPasswordInput, 'type');
  
  expect(passwordType).to.equal('password');
  expect(confirmPasswordType).to.equal('password');
});

Then('the form should use HTTPS', async function () {
  const currentUrl = await driver.getCurrentUrl();
  expect(currentUrl).to.startWith('https://');
});

// Loading state
Then('I should see a loading indicator', async function () {
  const isLoading = await registerPage.isLoading();
  expect(isLoading).to.be.true;
});

Then('the loading should complete within {int} seconds', async function (maxSeconds) {
  const startTime = Date.now();
  await registerPage.waitForLoadingToComplete();
  const loadTime = (Date.now() - startTime) / 1000;
  expect(loadTime).to.be.at.most(maxSeconds);
});

// Responsive design
Then('the registration form should be responsive on mobile', async function () {
  await driver.manage().window().setRect({ width: 375, height: 667 });
  const isVisible = await registerPage.isElementDisplayed(registerPage.locators.formContainer);
  expect(isVisible).to.be.true;
});

Then('the registration form should be responsive on tablet', async function () {
  await driver.manage().window().setRect({ width: 768, height: 1024 });
  const isVisible = await registerPage.isElementDisplayed(registerPage.locators.formContainer);
  expect(isVisible).to.be.true;
});

Then('the registration form should be responsive on desktop', async function () {
  await driver.manage().window().setRect({ width: 1920, height: 1080 });
  const isVisible = await registerPage.isElementDisplayed(registerPage.locators.formContainer);
  expect(isVisible).to.be.true;
});

// Field validation
Then('I should see a school name length error', async function () {
  const error = await registerPage.getSchoolNameError();
  expect(error).to.include('name') || expect(error).to.include('length');
});

Then('I should see a pincode format error', async function () {
  const error = await registerPage.getElementText(registerPage.locators.pincodeError);
  expect(error).to.include('pincode') || expect(error).to.include('format');
});

Then('I should see a phone format error', async function () {
  const error = await registerPage.getElementText(registerPage.locators.phoneError);
  expect(error).to.include('phone') || expect(error).to.include('format');
});

Then('I should see a website format error', async function () {
  const error = await registerPage.getElementText(registerPage.locators.websiteError);
  expect(error).to.include('website') || expect(error).to.include('format');
});

// Data table for registration
When('I register a new school with the following details:', async function (dataTable) {
  const data = dataTable.hashes()[0];
  
  await registerPage.enterSchoolName(data['School Name']);
  await registerPage.enterAdminEmail(data['Admin Email']);
  await registerPage.enterPassword(data['Password']);
  await registerPage.enterConfirmPassword(data['Confirm Password']);
  
  if (data['Address']) await registerPage.enterAddress(data['Address']);
  if (data['City']) await registerPage.enterCity(data['City']);
  if (data['State']) await registerPage.enterState(data['State']);
  if (data['Pincode']) await registerPage.enterPincode(data['Pincode']);
  if (data['Phone']) await registerPage.enterPhone(data['Phone']);
  if (data['Website']) await registerPage.enterWebsite(data['Website']);
});

When('I accept the terms and conditions', async function () {
  await registerPage.clickTermsCheckbox();
});

When('I subscribe to the newsletter', async function () {
  await registerPage.clickNewsletterCheckbox();
});
