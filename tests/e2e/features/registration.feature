Feature: School Registration Functionality
  As a school administrator
  I want to register my school in the system
  So that I can start managing my school operations

  Background:
    Given the school management system is running
    And I am on the registration page

  @smoke @registration
  Scenario: Verify registration page loads successfully
    Then I should see the school registration form
    And I should see the school name input field
    And I should see the admin email input field
    And I should see the password input field
    And I should see the confirm password input field
    And I should see the register button
    And I should see the login link

  @registration @validation
  Scenario: Attempt registration with empty required fields
    When I click the register button
    Then I should see validation errors
    And the school name field should show an error
    And the email field should show an error
    And the password field should show an error
    And the confirm password field should show an error

  @registration @validation
  Scenario: Attempt registration with invalid email format
    When I enter "Test School" in the school name field
    And I enter "invalid-email" in the email field
    And I enter "ValidPassword123!" in the password field
    And I enter "ValidPassword123!" in the confirm password field
    And I click the register button
    Then I should see an email format error

  @registration @validation
  Scenario: Attempt registration with weak password
    When I enter "Test School" in the school name field
    And I enter "admin@school.com" in the email field
    And I enter "123" in the password field
    And I enter "123" in the confirm password field
    And I click the register button
    Then I should see a password strength error
    And the password strength indicator should show "Weak"

  @registration @validation
  Scenario: Attempt registration with mismatched passwords
    When I enter "Test School" in the school name field
    And I enter "admin@school.com" in the email field
    And I enter "ValidPassword123!" in the password field
    And I enter "DifferentPassword123!" in the confirm password field
    And I click the register button
    Then I should see a password mismatch error

  @registration @validation
  Scenario: Attempt registration with existing email
    When I enter "Test School" in the school name field
    And I enter "admin@school.com" in the email field
    And I enter "ValidPassword123!" in the password field
    And I enter "ValidPassword123!" in the confirm password field
    And I click the register button
    Then I should see an email already exists error

  @registration @success
  Scenario: Successful school registration with minimal data
    When I enter "New Test School" in the school name field
    And I enter "newadmin@school.com" in the email field
    And I enter "ValidPassword123!" in the password field
    And I enter "ValidPassword123!" in the confirm password field
    And I check the terms and conditions checkbox
    And I click the register button
    Then I should see a registration success message
    And I should be redirected to the login page

  @registration @success
  Scenario: Successful school registration with complete data
    When I enter "Complete Test School" in the school name field
    And I enter "complete@school.com" in the email field
    And I enter "ValidPassword123!" in the password field
    And I enter "ValidPassword123!" in the confirm password field
    And I enter "123 Main Street" in the address field
    And I enter "Test City" in the city field
    And I enter "Test State" in the state field
    And I enter "12345" in the pincode field
    And I enter "+1-555-123-4567" in the phone field
    And I enter "https://completeschool.com" in the website field
    And I check the terms and conditions checkbox
    And I check the newsletter subscription checkbox
    And I click the register button
    Then I should see a registration success message
    And I should be redirected to the login page

  @registration @password-strength
  Scenario: Verify password strength indicator
    When I enter "WeakPass" in the password field
    Then the password strength indicator should show "Weak"
    When I enter "MediumPass123" in the password field
    Then the password strength indicator should show "Medium"
    When I enter "StrongPass123!" in the password field
    Then the password strength indicator should show "Strong"

  @registration @navigation
  Scenario: Navigate to login page from registration
    When I click on the login link
    Then I should be redirected to the login page

  @registration @navigation
  Scenario: Navigate back to homepage
    When I click on the back to home link
    Then I should be redirected to the homepage

  @registration @form-sections
  Scenario: Verify form sections are properly organized
    Then I should see the school information section
    And I should see the contact information section
    And the school information section should be required
    And the contact information section should be optional

  @registration @accessibility
  Scenario: Verify registration form accessibility
    Then all required fields should have proper labels
    And all fields should have proper ARIA attributes
    And the form should have proper heading structure
    And the terms checkbox should be accessible

  @registration @security
  Scenario: Verify password field security
    Then the password field should be of type "password"
    And the confirm password field should be of type "password"
    And passwords should not be visible in plain text
    And the form should use HTTPS

  @registration @loading
  Scenario: Verify loading state during registration
    When I enter "Loading Test School" in the school name field
    And I enter "loading@school.com" in the email field
    And I enter "ValidPassword123!" in the password field
    And I enter "ValidPassword123!" in the confirm password field
    And I check the terms and conditions checkbox
    And I click the register button
    Then I should see a loading indicator
    And the loading should complete within 10 seconds

  @registration @responsive
  Scenario: Verify registration form responsiveness
    Then the registration form should be responsive on mobile
    And the registration form should be responsive on tablet
    And the registration form should be responsive on desktop

  @registration @field-validation
  Scenario: Verify individual field validation
    When I enter "A" in the school name field
    And I click the register button
    Then I should see a school name length error
    When I enter "invalid-pincode" in the pincode field
    And I click the register button
    Then I should see a pincode format error
    When I enter "invalid-phone" in the phone field
    And I click the register button
    Then I should see a phone format error
    When I enter "invalid-website" in the website field
    And I click the register button
    Then I should see a website format error
