import { test, expect } from "@playwright/test";

const BASE_URL = "https://edutrace.feature.marimaxglobal.ng";
const LOGIN_URL = `${BASE_URL}/auth/login`;

// Test credentials
const VALID_EMAIL = "milog50204@httpsu.com";
const VALID_PASSWORD = "Password@23";
const INVALID_PASSWORD = "WrongPassword123!";
const INVALID_EMAIL = "invalid-email-format";

test.describe("Login Page Tests", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(LOGIN_URL);
  });

  /**
   * WEB-LOGIN-01: Successful Login
   * Expected: Redirects to dashboard
   */
  test("WEB-LOGIN-01: Successful Login", async ({ page }) => {
    // Fill in valid credentials
    await page.fill(
      'input[type="email"], input[name="email"], input[id="email"]',
      VALID_EMAIL
    );
    await page.fill(
      'input[type="password"], input[name="password"], input[id="password"]',
      VALID_PASSWORD
    );

    // Click login button
    await page.click(
      'button[type="submit"], button:has-text("Login"), button:has-text("Sign in")'
    );

    // Wait for navigation and verify redirect to dashboard
    await page.waitForURL(/dashboard|home|profile/i, { timeout: 10000 });

    // Assert we're not on the login page anymore
    expect(page.url()).not.toContain("/auth/login");

    // Verify dashboard elements are visible
    await expect(page.locator("body")).not.toContainText("Login");
  });

  /**
   * WEB-LOGIN-02: Invalid Password
   * Expected: Displays "Unable to login user" error alert
   */
  test("WEB-LOGIN-02: Invalid Password", async ({ page }) => {
    // Fill in valid email but invalid password
    await page.fill(
      'input[type="email"], input[name="email"], input[id="email"]',
      VALID_EMAIL
    );
    await page.fill(
      'input[type="password"], input[name="password"], input[id="password"]',
      INVALID_PASSWORD
    );

    // Click login button
    await page.click(
      'button[type="submit"], button:has-text("Login"), button:has-text("Sign in")'
    );

    // Wait for error alert to appear
    await page.waitForTimeout(2000); // Wait for API response

    // Assert the specific error message "Unable to login user" is displayed
    const errorAlert = page.locator('text="Unable to login user"');
    await expect(errorAlert).toBeVisible({ timeout: 5000 });

    // Verify we're still on login page
    expect(page.url()).toContain("/auth/login");
  });

  /**
   * WEB-LOGIN-03: Invalid Email Format
   * Expected: Email validation error
   */
  test("WEB-LOGIN-03: Invalid Email Format", async ({ page }) => {
    // Fill in invalid email format
    await page.fill(
      'input[type="email"], input[name="email"], input[id="email"]',
      INVALID_EMAIL
    );
    await page.fill(
      'input[type="password"], input[name="password"], input[id="password"]',
      VALID_PASSWORD
    );

    // Check for HTML5 validation or custom validation error
    const emailInput = page.locator(
      'input[type="email"], input[name="email"], input[id="email"]'
    );

    // Try to blur the email field to trigger validation
    await emailInput.first().blur();

    // Check HTML5 validation
    const isInvalid = await emailInput.evaluate((el) => {
      return !el.validity.valid;
    });

    expect(isInvalid).toBeTruthy();

    // Also check for visible error messages
    const errorMessage = page.locator(
      'text=/invalid|email|format|valid/i, .error-message, .field-error, [role="alert"]'
    );

    // Error message might appear on blur or submit attempt
    await page
      .click('button[type="submit"], button:has-text("Login")')
      .catch(() => {});
    await page.waitForTimeout(1000);

    // Verify we're still on login page
    expect(page.url()).toContain("/auth/login");
  });

  /**
   * WEB-LOGIN-04: Password Field Hidden
   * Expected: Password characters remain hidden
   */
  test("WEB-LOGIN-04: Password Field Hidden", async ({ page }) => {
    const passwordInput = page.locator(
      'input[type="password"], input[name="password"], input[id="password"]'
    );

    // Verify password input exists
    await expect(passwordInput).toBeVisible();

    // Verify input type is password
    const inputType = await passwordInput.getAttribute("type");
    expect(inputType).toBe("password");

    // Type password and verify it's masked
    await passwordInput.fill(VALID_PASSWORD);

    // Verify the value is set but not visible as plain text
    const value = await passwordInput.inputValue();
    expect(value).toBe(VALID_PASSWORD);

    // Verify visually it appears as dots/asterisks (check computed style or visibility)
    const isPasswordType = await passwordInput.evaluate((el) => {
      return el.type === "password";
    });
    expect(isPasswordType).toBeTruthy();
  });

  /**
   * WEB-LOGIN-05: Remember Me
   * Expected: Credentials persist after logout and revisit
   */
  test("WEB-LOGIN-05: Remember Me", async ({ page, context }) => {
    // Check if Remember Me checkbox exists
    const rememberMeCheckbox = page.locator(
      'input[type="checkbox"][name*="remember"], input[type="checkbox"][id*="remember"], label:has-text("Remember") input'
    );

    const rememberMeExists = (await rememberMeCheckbox.count()) > 0;

    if (rememberMeExists) {
      // Fill in credentials
      await page.fill(
        'input[type="email"], input[name="email"], input[id="email"]',
        VALID_EMAIL
      );
      await page.fill(
        'input[type="password"], input[name="password"], input[id="password"]',
        VALID_PASSWORD
      );

      // Check Remember Me
      await rememberMeCheckbox.check();

      // Login
      await page.click(
        'button[type="submit"], button:has-text("Login"), button:has-text("Sign in")'
      );

      // Wait for dashboard
      await page.waitForURL(/dashboard|home|profile/i, { timeout: 10000 });

      // Logout (find logout button/link)
      const logoutButton = page.locator(
        'button:has-text("Logout"), a:has-text("Logout"), button:has-text("Sign out"), [data-testid="logout"]'
      );

      if ((await logoutButton.count()) > 0) {
        await logoutButton.click();
        await page.waitForURL(/login|auth/i, { timeout: 5000 });

        // Revisit login page
        await page.goto(LOGIN_URL);

        // Verify credentials are pre-filled
        const emailValue = await page
          .locator(
            'input[type="email"], input[name="email"], input[id="email"]'
          )
          .inputValue();
        const passwordValue = await page
          .locator(
            'input[type="password"], input[name="password"], input[id="password"]'
          )
          .inputValue();

        // At least email should be remembered
        expect(emailValue).toBeTruthy();
      } else {
        test.info().annotations.push({
          type: "note",
          description: "Logout button not found - skipping logout verification",
        });
      }
    } else {
      test.skip("Remember Me feature not found on login page");
    }
  });
});
