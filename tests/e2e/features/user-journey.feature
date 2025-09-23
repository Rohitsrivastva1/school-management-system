Feature: Complete User Journey
  As a new school administrator
  I want to complete the full registration and login process
  So that I can start using the school management system

  Background:
    Given the school management system is running

  @smoke @user-journey
  Scenario: Complete school registration and login journey
    Given I am on the homepage
    When I click on the register link
    Then I should be on the registration page
    When I register a new school with the following details:
      | Field           | Value                    |
      | School Name     | Journey Test School       |
      | Admin Email     | journey@school.com        |
      | Password        | JourneyPass123!          |
      | Confirm Password| JourneyPass123!          |
      | Address         | 456 Journey Street       |
      | City            | Journey City             |
      | State           | Journey State            |
      | Pincode         | 54321                    |
      | Phone           | +1-555-987-6543         |
      | Website         | https://journeyschool.com|
    And I accept the terms and conditions
    And I subscribe to the newsletter
    And I click the register button
    Then I should see a registration success message
    And I should be redirected to the login page
    When I enter "journey@school.com" in the email field
    And I enter "JourneyPass123!" in the password field
    And I click the login button
    Then I should be redirected to the dashboard
    And I should see a welcome message

  @user-journey @exploration
  Scenario: Explore homepage before registration
    Given I am on the homepage
    When I scroll through the homepage
    Then I should see all the key sections
    And I should understand the system features
    When I click on the primary CTA button
    Then I should be redirected to the registration page

  @user-journey @error-recovery
  Scenario: Handle registration errors and retry
    Given I am on the registration page
    When I attempt to register with invalid data
    Then I should see appropriate error messages
    When I correct the invalid data
    And I click the register button again
    Then I should see a registration success message

  @user-journey @navigation-flow
  Scenario: Navigate between pages seamlessly
    Given I am on the homepage
    When I click on the login link
    Then I should be on the login page
    When I click on the register link
    Then I should be on the registration page
    When I click on the back to home link
    Then I should be back on the homepage

  @user-journey @form-persistence
  Scenario: Verify form data persistence during navigation
    Given I am on the registration page
    When I fill in the school information
    And I navigate to the login page
    And I navigate back to the registration page
    Then the school information should be cleared
    And I should start with a fresh form

  @user-journey @mobile-journey
  Scenario: Complete journey on mobile device
    Given I am on the homepage on a mobile device
    When I click on the register link
    Then I should be on the registration page
    And the form should be mobile-friendly
    When I complete the registration process
    Then I should be able to login successfully
    And I should be redirected to the dashboard

  @user-journey @accessibility-journey
  Scenario: Complete journey using keyboard navigation
    Given I am on the homepage
    When I navigate using only the keyboard
    Then I should be able to access all interactive elements
    When I complete the registration using keyboard
    Then I should be able to login using keyboard
    And the entire journey should be accessible

  @user-journey @performance-journey
  Scenario: Verify performance throughout the journey
    Given I am on the homepage
    When I navigate through the registration process
    Then each page should load within acceptable time limits
    When I complete the registration
    Then the success page should load quickly
    When I login
    Then the dashboard should load efficiently

  @user-journey @security-journey
  Scenario: Verify security throughout the journey
    Given I am on the homepage
    When I navigate to the registration page
    Then the connection should be secure (HTTPS)
    When I submit sensitive information
    Then the data should be transmitted securely
    When I login
    Then the session should be secure
