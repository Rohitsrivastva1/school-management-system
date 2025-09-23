Feature: Homepage Functionality
  As a visitor to the school management system
  I want to explore the homepage
  So that I can understand the system's features and decide to register

  Background:
    Given the school management system is running
    And I am on the homepage

  @smoke @homepage
  Scenario: Verify homepage loads successfully
    Then I should see the navigation bar
    And I should see the hero section
    And I should see the features section
    And I should see the trust indicators section
    And I should see the footer

  @homepage @navigation
  Scenario: Navigate to login page from homepage
    When I click on the login link
    Then I should be redirected to the login page
    And the page title should contain "Login"

  @homepage @navigation
  Scenario: Navigate to registration page from homepage
    When I click on the register link
    Then I should be redirected to the registration page
    And the page title should contain "Register"

  @homepage @cta
  Scenario: Click primary call-to-action button
    When I click on the primary CTA button
    Then I should be redirected to the registration page

  @homepage @cta
  Scenario: Click secondary call-to-action button
    When I click on the secondary CTA button
    Then I should be redirected to the login page

  @homepage @content
  Scenario: Verify hero section content
    Then the hero title should be visible
    And the hero subtitle should be visible
    And the hero title should contain "School Management"
    And the hero subtitle should contain "comprehensive"

  @homepage @features
  Scenario: Verify features section
    Then I should see at least 3 feature cards
    And each feature card should have a title
    And each feature card should have a description

  @homepage @trust
  Scenario: Verify trust indicators
    Then I should see at least 2 statistics cards
    And each statistics card should have a value
    And each statistics card should have a label

  @homepage @responsive
  Scenario: Verify responsive design elements
    Then the navigation should be responsive
    And the hero section should be responsive
    And the features section should be responsive

  @homepage @accessibility
  Scenario: Verify accessibility features
    Then all images should have alt text
    And all links should have descriptive text
    And the page should have proper heading structure

  @homepage @performance
  Scenario: Verify page performance
    Then the page should load within 3 seconds
    And all images should be optimized
    And the page should have minimal layout shift
