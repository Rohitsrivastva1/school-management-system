Feature: User Login Functionality
  As a school administrator, teacher, parent, or student
  I want to log into the system
  So that I can access my account and manage school operations

  Background:
    Given the school management system is running
    And I am on the login page

  @smoke @login
  Scenario: Verify login page loads successfully
    Then I should see the login form
    And I should see the email input field
    And I should see the password input field
    And I should see the login button
    And I should see the register link
    And I should see the forgot password link

  @login @validation
  Scenario: Attempt login with empty credentials
    When I click the login button
    Then I should see validation errors
    And the email field should show an error
    And the password field should show an error

  @login @validation
  Scenario: Attempt login with invalid email format
    When I enter "invalid-email" in the email field
    And I enter "password123" in the password field
    And I click the login button
    Then I should see an email format error

  @login @validation
  Scenario: Attempt login with short password
    When I enter "admin@school.com" in the email field
    And I enter "123" in the password field
    And I click the login button
    Then I should see a password length error

  @login @authentication
  Scenario: Attempt login with non-existent user
    When I enter "nonexistent@school.com" in the email field
    And I enter "ValidPassword123!" in the password field
    And I click the login button
    Then I should see an authentication error
    And I should remain on the login page

  @login @authentication
  Scenario: Attempt login with wrong password
    When I enter "admin@school.com" in the email field
    And I enter "WrongPassword123!" in the password field
    And I click the login button
    Then I should see an authentication error
    And I should remain on the login page

  @login @success
  Scenario: Successful login with valid credentials
    When I enter "admin@school.com" in the email field
    And I enter "AdminPass123!" in the password field
    And I click the login button
    Then I should be redirected to the dashboard
    And I should see a success message

  @login @remember-me
  Scenario: Login with remember me option
    When I enter "admin@school.com" in the email field
    And I enter "AdminPass123!" in the password field
    And I check the remember me checkbox
    And I click the login button
    Then I should be redirected to the dashboard
    And the remember me preference should be saved

  @login @navigation
  Scenario: Navigate to registration page from login
    When I click on the register link
    Then I should be redirected to the registration page

  @login @navigation
  Scenario: Navigate to forgot password page
    When I click on the forgot password link
    Then I should be redirected to the forgot password page

  @login @navigation
  Scenario: Navigate back to homepage
    When I click on the back to home link
    Then I should be redirected to the homepage

  @login @accessibility
  Scenario: Verify login form accessibility
    Then the email field should have proper label
    And the password field should have proper label
    And the login button should be accessible
    And the form should have proper ARIA attributes

  @login @security
  Scenario: Verify password field security
    Then the password field should be of type "password"
    And the password should not be visible in plain text
    And the form should use HTTPS

  @login @loading
  Scenario: Verify loading state during login
    When I enter "admin@school.com" in the email field
    And I enter "AdminPass123!" in the password field
    And I click the login button
    Then I should see a loading indicator
    And the loading should complete within 5 seconds

  @login @social
  Scenario: Verify social login options (if available)
    Then I should see Google login button
    And I should see Facebook login button
    And clicking Google login should redirect to Google OAuth
    And clicking Facebook login should redirect to Facebook OAuth

  @login @responsive
  Scenario: Verify login form responsiveness
    Then the login form should be responsive on mobile
    And the login form should be responsive on tablet
    And the login form should be responsive on desktop
