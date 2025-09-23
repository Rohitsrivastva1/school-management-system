const { Given, When, Then } = require('@cucumber/cucumber');
const { expect } = require('chai');
const WebDriverManager = require('../config/webdriver.config');
const HomePage = require('../page_objects/HomePage');
const LoginPage = require('../page_objects/LoginPage');
const RegisterPage = require('../page_objects/RegisterPage');

let webDriverManager;
let driver;
let homePage;
let loginPage;
let registerPage;

// Background steps
Given('the school management system is running', async function () {
  webDriverManager = new WebDriverManager();
  driver = await webDriverManager.createDriver('chrome');
  homePage = new HomePage(driver);
  loginPage = new LoginPage(driver);
  registerPage = new RegisterPage(driver);
});

Given('I am on the homepage', async function () {
  await webDriverManager.navigateTo('/');
  await driver.wait(async () => {
    const title = await driver.getTitle();
    return title.includes('School Management');
  }, 10000);
});

Given('I am on the login page', async function () {
  await webDriverManager.navigateTo('/login');
  await driver.wait(async () => {
    const title = await driver.getTitle();
    return title.includes('Login');
  }, 10000);
});

Given('I am on the registration page', async function () {
  await webDriverManager.navigateTo('/register');
  await driver.wait(async () => {
    const title = await driver.getTitle();
    return title.includes('Register');
  }, 10000);
});

Given('I am on the homepage on a mobile device', async function () {
  webDriverManager = new WebDriverManager();
  driver = await webDriverManager.createDriver('chrome');
  await driver.manage().window().setRect({ width: 375, height: 667 }); // iPhone dimensions
  homePage = new HomePage(driver);
  loginPage = new LoginPage(driver);
  registerPage = new RegisterPage(driver);
  await webDriverManager.navigateTo('/');
});

// Navigation steps
When('I click on the login link', async function () {
  await homePage.clickLoginLink();
});

When('I click on the register link', async function () {
  await homePage.clickRegisterLink();
});

When('I click on the primary CTA button', async function () {
  await homePage.clickPrimaryCTA();
});

When('I click on the secondary CTA button', async function () {
  await homePage.clickSecondaryCTA();
});

When('I click on the back to home link', async function () {
  await loginPage.clickBackToHomeLink();
});

When('I click on the forgot password link', async function () {
  await loginPage.clickForgotPasswordLink();
});

// Page verification steps
Then('I should be on the login page', async function () {
  const currentUrl = await driver.getCurrentUrl();
  expect(currentUrl).to.include('/login');
});

Then('I should be on the registration page', async function () {
  const currentUrl = await driver.getCurrentUrl();
  expect(currentUrl).to.include('/register');
});

Then('I should be back on the homepage', async function () {
  const currentUrl = await driver.getCurrentUrl();
  expect(currentUrl).to.include('/') && !currentUrl.includes('/login') && !currentUrl.includes('/register');
});

Then('I should be redirected to the login page', async function () {
  await driver.wait(async () => {
    const currentUrl = await driver.getCurrentUrl();
    return currentUrl.includes('/login');
  }, 10000);
});

Then('I should be redirected to the registration page', async function () {
  await driver.wait(async () => {
    const currentUrl = await driver.getCurrentUrl();
    return currentUrl.includes('/register');
  }, 10000);
});

Then('I should be redirected to the dashboard', async function () {
  await driver.wait(async () => {
    const currentUrl = await driver.getCurrentUrl();
    return currentUrl.includes('/dashboard') || currentUrl.includes('/admin');
  }, 10000);
});

Then('I should be redirected to the forgot password page', async function () {
  await driver.wait(async () => {
    const currentUrl = await driver.getCurrentUrl();
    return currentUrl.includes('/forgot-password');
  }, 10000);
});

// Page title verification
Then('the page title should contain {string}', async function (expectedTitle) {
  const actualTitle = await driver.getTitle();
  expect(actualTitle).to.include(expectedTitle);
});

// Cleanup
After(async function () {
  if (driver) {
    await webDriverManager.quit();
  }
});
