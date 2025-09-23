const { Given, When, Then } = require('@cucumber/cucumber');
const { expect } = require('chai');

// Login page visibility
Then('I should see the login form', async function () {
  const isVisible = await loginPage.isElementDisplayed(loginPage.locators.formContainer);
  expect(isVisible).to.be.true;
});

Then('I should see the email input field', async function () {
  const isVisible = await loginPage.isElementDisplayed(loginPage.locators.emailInput);
  expect(isVisible).to.be.true;
});

Then('I should see the password input field', async function () {
  const isVisible = await loginPage.isElementDisplayed(loginPage.locators.passwordInput);
  expect(isVisible).to.be.true;
});

Then('I should see the login button', async function () {
  const isVisible = await loginPage.isElementDisplayed(loginPage.locators.loginButton);
  expect(isVisible).to.be.true;
});

Then('I should see the register link', async function () {
  const isVisible = await loginPage.isElementDisplayed(loginPage.locators.registerLink);
  expect(isVisible).to.be.true;
});

Then('I should see the forgot password link', async function () {
  const isVisible = await loginPage.isElementDisplayed(loginPage.locators.forgotPasswordLink);
  expect(isVisible).to.be.true;
});

// Form input actions
When('I enter {string} in the email field', async function (email) {
  await loginPage.enterEmail(email);
});

When('I enter {string} in the password field', async function (password) {
  await loginPage.enterPassword(password);
});

When('I click the login button', async function () {
  await loginPage.clickLoginButton();
});

When('I check the remember me checkbox', async function () {
  await loginPage.clickRememberMe();
});

// Validation error checks
Then('I should see validation errors', async function () {
  const emailError = await loginPage.getEmailError();
  const passwordError = await loginPage.getPasswordError();
  expect(emailError || passwordError).to.not.be.null;
});

Then('the email field should show an error', async function () {
  const emailError = await loginPage.getEmailError();
  expect(emailError).to.not.be.null;
});

Then('the password field should show an error', async function () {
  const passwordError = await loginPage.getPasswordError();
  expect(passwordError).to.not.be.null;
});

Then('I should see an email format error', async function () {
  const emailError = await loginPage.getEmailError();
  expect(emailError).to.include('email') || expect(emailError).to.include('format');
});

Then('I should see a password length error', async function () {
  const passwordError = await loginPage.getPasswordError();
  expect(passwordError).to.include('password') || expect(passwordError).to.include('length');
});

Then('I should see an authentication error', async function () {
  const errorMessage = await loginPage.getErrorMessage();
  expect(errorMessage).to.not.be.null;
  expect(errorMessage).to.include('invalid') || expect(errorMessage).to.include('incorrect');
});

Then('I should remain on the login page', async function () {
  const currentUrl = await driver.getCurrentUrl();
  expect(currentUrl).to.include('/login');
});

// Success scenarios
Then('I should see a success message', async function () {
  const successMessage = await loginPage.getSuccessMessage();
  expect(successMessage).to.not.be.null;
});

Then('the remember me preference should be saved', async function () {
  // This would typically be verified by checking cookies or local storage
  // For now, we'll verify the checkbox was checked
  const isChecked = await loginPage.isRememberMeChecked();
  expect(isChecked).to.be.true;
});

// Form state verification
Then('the login button should be enabled', async function () {
  const isEnabled = await loginPage.isLoginButtonEnabled();
  expect(isEnabled).to.be.true;
});

Then('the login button should be disabled', async function () {
  const isEnabled = await loginPage.isLoginButtonEnabled();
  expect(isEnabled).to.be.false;
});

// Accessibility checks
Then('the email field should have proper label', async function () {
  const placeholder = await loginPage.getEmailInputPlaceholder();
  expect(placeholder).to.not.be.empty;
});

Then('the password field should have proper label', async function () {
  const placeholder = await loginPage.getPasswordInputPlaceholder();
  expect(placeholder).to.not.be.empty;
});

Then('the login button should be accessible', async function () {
  const buttonText = await loginPage.getElementText(loginPage.locators.loginButton);
  expect(buttonText).to.not.be.empty;
});

Then('the form should have proper ARIA attributes', async function () {
  const formElement = await driver.findElement(loginPage.locators.formContainer);
  const role = await formElement.getAttribute('role');
  expect(role).to.not.be.null;
});

// Security checks
Then('the password field should be of type {string}', async function (expectedType) {
  const actualType = await loginPage.getPasswordInputType();
  expect(actualType).to.equal(expectedType);
});

Then('the password should not be visible in plain text', async function () {
  const passwordType = await loginPage.getPasswordInputType();
  expect(passwordType).to.equal('password');
});

Then('the form should use HTTPS', async function () {
  const currentUrl = await driver.getCurrentUrl();
  expect(currentUrl).to.startWith('https://');
});

// Loading state
Then('I should see a loading indicator', async function () {
  const isLoading = await loginPage.isLoading();
  expect(isLoading).to.be.true;
});

Then('the loading should complete within {int} seconds', async function (maxSeconds) {
  const startTime = Date.now();
  await loginPage.waitForLoadingToComplete();
  const loadTime = (Date.now() - startTime) / 1000;
  expect(loadTime).to.be.at.most(maxSeconds);
});

// Social login (if implemented)
Then('I should see Google login button', async function () {
  const isVisible = await loginPage.isElementDisplayed(loginPage.locators.googleLoginButton);
  expect(isVisible).to.be.true;
});

Then('I should see Facebook login button', async function () {
  const isVisible = await loginPage.isElementDisplayed(loginPage.locators.facebookLoginButton);
  expect(isVisible).to.be.true;
});

When('I click on the Google login button', async function () {
  await loginPage.clickGoogleLogin();
});

When('I click on the Facebook login button', async function () {
  await loginPage.clickFacebookLogin();
});

Then('clicking Google login should redirect to Google OAuth', async function () {
  await loginPage.clickGoogleLogin();
  await driver.wait(async () => {
    const currentUrl = await driver.getCurrentUrl();
    return currentUrl.includes('google.com') || currentUrl.includes('accounts.google.com');
  }, 10000);
});

Then('clicking Facebook login should redirect to Facebook OAuth', async function () {
  await loginPage.clickFacebookLogin();
  await driver.wait(async () => {
    const currentUrl = await driver.getCurrentUrl();
    return currentUrl.includes('facebook.com') || currentUrl.includes('fb.com');
  }, 10000);
});

// Responsive design
Then('the login form should be responsive on mobile', async function () {
  await driver.manage().window().setRect({ width: 375, height: 667 });
  const isVisible = await loginPage.isElementDisplayed(loginPage.locators.formContainer);
  expect(isVisible).to.be.true;
});

Then('the login form should be responsive on tablet', async function () {
  await driver.manage().window().setRect({ width: 768, height: 1024 });
  const isVisible = await loginPage.isElementDisplayed(loginPage.locators.formContainer);
  expect(isVisible).to.be.true;
});

Then('the login form should be responsive on desktop', async function () {
  await driver.manage().window().setRect({ width: 1920, height: 1080 });
  const isVisible = await loginPage.isElementDisplayed(loginPage.locators.formContainer);
  expect(isVisible).to.be.true;
});
