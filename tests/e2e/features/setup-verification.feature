Feature: Setup Verification
  As a developer
  I want to verify that the E2E testing framework is properly configured
  So that I can run automated tests successfully

  @smoke @setup
  Scenario: Verify testing framework setup
    Given the school management system is running
    When I navigate to the homepage
    Then I should see the navigation bar
    And I should see the hero section
    And the page title should contain "School Management"

  @setup @basic
  Scenario: Verify basic page navigation
    Given I am on the homepage
    When I click on the login link
    Then I should be redirected to the login page
    When I click on the register link
    Then I should be redirected to the registration page
    When I click on the back to home link
    Then I should be back on the homepage
