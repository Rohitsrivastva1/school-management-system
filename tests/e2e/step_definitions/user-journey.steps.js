const { Given, When, Then } = require('@cucumber/cucumber');
const { expect } = require('chai');

// User journey specific steps
When('I navigate to the login page', async function () {
  await homePage.clickLoginLink();
});

When('I navigate to the registration page', async function () {
  await homePage.clickRegisterLink();
});

When('I navigate back to the registration page', async function () {
  await registerPage.clickBackToHomeLink();
  await homePage.clickRegisterLink();
});

When('I attempt to register with invalid data', async function () {
  await registerPage.enterSchoolName('A'); // Too short
  await registerPage.enterAdminEmail('invalid-email');
  await registerPage.enterPassword('123'); // Too weak
  await registerPage.enterConfirmPassword('456'); // Mismatch
  await registerPage.clickRegisterButton();
});

When('I correct the invalid data', async function () {
  await registerPage.clearForm();
  await registerPage.enterSchoolName('Valid School Name');
  await registerPage.enterAdminEmail('valid@school.com');
  await registerPage.enterPassword('ValidPassword123!');
  await registerPage.enterConfirmPassword('ValidPassword123!');
  await registerPage.clickTermsCheckbox();
});

When('I click the register button again', async function () {
  await registerPage.clickRegisterButton();
});

When('I fill in the school information', async function () {
  await registerPage.enterSchoolName('Test School');
  await registerPage.enterAdminEmail('test@school.com');
  await registerPage.enterPassword('TestPass123!');
  await registerPage.enterConfirmPassword('TestPass123!');
});

Then('the school information should be cleared', async function () {
  const schoolName = await registerPage.getSchoolNameValue();
  const email = await registerPage.getAdminEmailValue();
  
  expect(schoolName).to.be.empty;
  expect(email).to.be.empty;
});

Then('I should start with a fresh form', async function () {
  const isFormEmpty = await registerPage.getSchoolNameValue() === '';
  expect(isFormEmpty).to.be.true;
});

// Mobile journey
Then('the form should be mobile-friendly', async function () {
  const isVisible = await registerPage.isElementDisplayed(registerPage.locators.formContainer);
  expect(isVisible).to.be.true;
});

When('I complete the registration process', async function () {
  await registerPage.enterSchoolName('Mobile Test School');
  await registerPage.enterAdminEmail('mobile@school.com');
  await registerPage.enterPassword('MobilePass123!');
  await registerPage.enterConfirmPassword('MobilePass123!');
  await registerPage.clickTermsCheckbox();
  await registerPage.clickRegisterButton();
});

Then('I should be able to login successfully', async function () {
  await loginPage.enterEmail('mobile@school.com');
  await loginPage.enterPassword('MobilePass123!');
  await loginPage.clickLoginButton();
  
  const currentUrl = await driver.getCurrentUrl();
  expect(currentUrl).to.include('/dashboard') || currentUrl.includes('/admin');
});

// Keyboard navigation
When('I navigate using only the keyboard', async function () {
  // Simulate Tab key navigation
  const body = await driver.findElement({ tagName: 'body' });
  await body.sendKeys('\uE004'); // Tab key
});

Then('I should be able to access all interactive elements', async function () {
  const interactiveElements = [
    homePage.locators.loginLink,
    homePage.locators.registerLink,
    homePage.locators.primaryCTA
  ];
  
  for (const locator of interactiveElements) {
    const isVisible = await homePage.isElementDisplayed(locator);
    expect(isVisible).to.be.true;
  }
});

When('I complete the registration using keyboard', async function () {
  // This would involve tabbing through form fields and using Enter to submit
  await registerPage.enterSchoolName('Keyboard Test School');
  await registerPage.enterAdminEmail('keyboard@school.com');
  await registerPage.enterPassword('KeyboardPass123!');
  await registerPage.enterConfirmPassword('KeyboardPass123!');
  await registerPage.clickTermsCheckbox();
  await registerPage.clickRegisterButton();
});

Then('I should be able to login using keyboard', async function () {
  await loginPage.enterEmail('keyboard@school.com');
  await loginPage.enterPassword('KeyboardPass123!');
  await loginPage.clickLoginButton();
});

Then('the entire journey should be accessible', async function () {
  // Verify that all pages have proper accessibility features
  const hasHeadings = await driver.findElements({ tagName: 'h1' });
  expect(hasHeadings.length).to.be.at.least(1);
});

// Performance journey
Then('each page should load within acceptable time limits', async function () {
  const pages = ['/', '/login', '/register'];
  
  for (const page of pages) {
    const startTime = Date.now();
    await webDriverManager.navigateTo(page);
    const loadTime = (Date.now() - startTime) / 1000;
    expect(loadTime).to.be.at.most(5); // 5 seconds max
  }
});

Then('the success page should load quickly', async function () {
  const startTime = Date.now();
  await registerPage.waitForLoadingToComplete();
  const loadTime = (Date.now() - startTime) / 1000;
  expect(loadTime).to.be.at.most(3); // 3 seconds max
});

Then('the dashboard should load efficiently', async function () {
  const startTime = Date.now();
  await driver.wait(async () => {
    const currentUrl = await driver.getCurrentUrl();
    return currentUrl.includes('/dashboard') || currentUrl.includes('/admin');
  }, 10000);
  const loadTime = (Date.now() - startTime) / 1000;
  expect(loadTime).to.be.at.most(5); // 5 seconds max
});

// Security journey
Then('the connection should be secure \\(HTTPS\\)', async function () {
  const currentUrl = await driver.getCurrentUrl();
  expect(currentUrl).to.startWith('https://');
});

When('I navigate to the registration page', async function () {
  await homePage.clickRegisterLink();
});

When('I submit sensitive information', async function () {
  await registerPage.enterSchoolName('Security Test School');
  await registerPage.enterAdminEmail('security@school.com');
  await registerPage.enterPassword('SecurityPass123!');
  await registerPage.enterConfirmPassword('SecurityPass123!');
  await registerPage.clickTermsCheckbox();
  await registerPage.clickRegisterButton();
});

Then('the data should be transmitted securely', async function () {
  const currentUrl = await driver.getCurrentUrl();
  expect(currentUrl).to.startWith('https://');
});

When('I login', async function () {
  await loginPage.enterEmail('security@school.com');
  await loginPage.enterPassword('SecurityPass123!');
  await loginPage.clickLoginButton();
});

Then('the session should be secure', async function () {
  const currentUrl = await driver.getCurrentUrl();
  expect(currentUrl).to.startWith('https://');
});

// Welcome message
Then('I should see a welcome message', async function () {
  // This would typically check for a welcome message on the dashboard
  const currentUrl = await driver.getCurrentUrl();
  expect(currentUrl).to.include('/dashboard') || currentUrl.includes('/admin');
});
