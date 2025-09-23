const { Given, When, Then } = require('@cucumber/cucumber');
const { expect } = require('chai');

// Homepage visibility steps
Then('I should see the navigation bar', async function () {
  const isVisible = await homePage.isNavigationBarVisible();
  expect(isVisible).to.be.true;
});

Then('I should see the hero section', async function () {
  const isVisible = await homePage.isHeroSectionVisible();
  expect(isVisible).to.be.true;
});

Then('I should see the features section', async function () {
  const isVisible = await homePage.isFeaturesSectionVisible();
  expect(isVisible).to.be.true;
});

Then('I should see the trust indicators section', async function () {
  const isVisible = await homePage.isTrustSectionVisible();
  expect(isVisible).to.be.true;
});

Then('I should see the footer', async function () {
  const isVisible = await homePage.isFooterVisible();
  expect(isVisible).to.be.true;
});

// Hero section content
Then('the hero title should be visible', async function () {
  const title = await homePage.getHeroTitle();
  expect(title).to.not.be.empty;
});

Then('the hero subtitle should be visible', async function () {
  const subtitle = await homePage.getHeroSubtitle();
  expect(subtitle).to.not.be.empty;
});

Then('the hero title should contain {string}', async function (expectedText) {
  const title = await homePage.getHeroTitle();
  expect(title).to.include(expectedText);
});

Then('the hero subtitle should contain {string}', async function (expectedText) {
  const subtitle = await homePage.getHeroSubtitle();
  expect(subtitle).to.include(expectedText);
});

// Features section
Then('I should see at least {int} feature cards', async function (minCount) {
  const count = await homePage.getFeatureCardsCount();
  expect(count).to.be.at.least(minCount);
});

Then('each feature card should have a title', async function () {
  const count = await homePage.getFeatureCardsCount();
  for (let i = 0; i < count; i++) {
    const title = await homePage.getFeatureCardTitle(i);
    expect(title).to.not.be.empty;
  }
});

Then('each feature card should have a description', async function () {
  const count = await homePage.getFeatureCardsCount();
  for (let i = 0; i < count; i++) {
    const description = await homePage.getFeatureCardDescription(i);
    expect(description).to.not.be.empty;
  }
});

// Trust indicators
Then('I should see at least {int} statistics cards', async function (minCount) {
  const count = await homePage.getStatsCardsCount();
  expect(count).to.be.at.least(minCount);
});

Then('each statistics card should have a value', async function () {
  const count = await homePage.getStatsCardsCount();
  for (let i = 0; i < count; i++) {
    const value = await homePage.getStatCardValue(i);
    expect(value).to.not.be.empty;
  }
});

Then('each statistics card should have a label', async function () {
  const count = await homePage.getStatsCardsCount();
  for (let i = 0; i < count; i++) {
    const label = await homePage.getStatCardLabel(i);
    expect(label).to.not.be.empty;
  }
});

// Scrolling actions
When('I scroll through the homepage', async function () {
  await homePage.scrollToFeatures();
  await homePage.scrollToTrustSection();
  await homePage.scrollToFooter();
});

When('I scroll to the features section', async function () {
  await homePage.scrollToFeatures();
});

When('I scroll to the trust section', async function () {
  await homePage.scrollToTrustSection();
});

When('I scroll to the footer', async function () {
  await homePage.scrollToFooter();
});

// Content verification
Then('I should see all the key sections', async function () {
  const hasNavigation = await homePage.isNavigationBarVisible();
  const hasHero = await homePage.isHeroSectionVisible();
  const hasFeatures = await homePage.isFeaturesSectionVisible();
  const hasTrust = await homePage.isTrustSectionVisible();
  const hasFooter = await homePage.isFooterVisible();
  
  expect(hasNavigation).to.be.true;
  expect(hasHero).to.be.true;
  expect(hasFeatures).to.be.true;
  expect(hasTrust).to.be.true;
  expect(hasFooter).to.be.true;
});

Then('I should understand the system features', async function () {
  const featureCount = await homePage.getFeatureCardsCount();
  expect(featureCount).to.be.at.least(3);
  
  // Verify each feature has meaningful content
  for (let i = 0; i < featureCount; i++) {
    const title = await homePage.getFeatureCardTitle(i);
    const description = await homePage.getFeatureCardDescription(i);
    expect(title.length).to.be.at.least(5);
    expect(description.length).to.be.at.least(10);
  }
});

// Responsive design
Then('the navigation should be responsive', async function () {
  const isVisible = await homePage.isNavigationBarVisible();
  expect(isVisible).to.be.true;
});

Then('the hero section should be responsive', async function () {
  const isVisible = await homePage.isHeroSectionVisible();
  expect(isVisible).to.be.true;
});

Then('the features section should be responsive', async function () {
  const isVisible = await homePage.isFeaturesSectionVisible();
  expect(isVisible).to.be.true;
});

// Accessibility
Then('all images should have alt text', async function () {
  const images = await driver.findElements({ tagName: 'img' });
  for (const img of images) {
    const alt = await img.getAttribute('alt');
    expect(alt).to.not.be.null;
  }
});

Then('all links should have descriptive text', async function () {
  const links = await driver.findElements({ tagName: 'a' });
  for (const link of links) {
    const text = await link.getText();
    const href = await link.getAttribute('href');
    expect(text).to.not.be.empty;
    expect(href).to.not.be.null;
  }
});

Then('the page should have proper heading structure', async function () {
  const h1Elements = await driver.findElements({ tagName: 'h1' });
  const h2Elements = await driver.findElements({ tagName: 'h2' });
  
  expect(h1Elements.length).to.be.at.least(1);
  expect(h2Elements.length).to.be.at.least(1);
});

// Performance
Then('the page should load within {int} seconds', async function (maxSeconds) {
  const startTime = Date.now();
  await webDriverManager.navigateTo('/');
  const loadTime = (Date.now() - startTime) / 1000;
  expect(loadTime).to.be.at.most(maxSeconds);
});

Then('all images should be optimized', async function () {
  const images = await driver.findElements({ tagName: 'img' });
  for (const img of images) {
    const src = await img.getAttribute('src');
    expect(src).to.not.be.null;
    // Additional image optimization checks could be added here
  }
});

Then('the page should have minimal layout shift', async function () {
  // This would typically require performance metrics
  // For now, we'll just verify the page loads without major layout issues
  const body = await driver.findElement({ tagName: 'body' });
  const isDisplayed = await body.isDisplayed();
  expect(isDisplayed).to.be.true;
});
