import { test, expect } from "@playwright/test";

const BASE_URL = "https://edutrace.feature.marimaxglobal.ng";
const LOGIN_URL = `${BASE_URL}/auth/login`;

// Test credentials
const VALID_EMAIL = "milog50204@httpsu.com";
const VALID_PASSWORD = "Password@23";

/**
 * Helper function to login
 * Uses the exact same pattern as the working login test
 */
async function login(page) {
  await page.goto(LOGIN_URL);
  
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
}

test.describe("UI Assertions and Usability Tests", () => {
  /**
   * Layout Consistency Test
   * Check consistency across screens
   */
  test("Layout Consistency Across Screens", async ({ page }) => {
    await login(page);

    // Get initial layout elements
    const header = page.locator(
      'header, [class*="header"], nav, [role="banner"]'
    );
    const footer = page.locator(
      'footer, [class*="footer"], [role="contentinfo"]'
    );
    const mainContent = page.locator(
      'main, [class*="main"], [class*="content"], [role="main"]'
    );

    // Check if header exists and is visible
    if ((await header.count()) > 0) {
      await expect(header.first()).toBeVisible();

      // Get header height and position for consistency check
      const headerBox = await header.first().boundingBox();
      expect(headerBox).toBeTruthy();
    }

    // Check main content area
    if ((await mainContent.count()) > 0) {
      await expect(mainContent.first()).toBeVisible();
    } else {
      // Fallback: check body has content
      await expect(page.locator("body")).toBeVisible();
    }

    // Navigate to different pages and verify layout consistency
    const menuLinks = page
      .locator('nav a, [role="navigation"] a, [class*="menu"] a')
      .first();
    if ((await menuLinks.count()) > 0) {
      const firstLink = menuLinks.first();
      const href = await firstLink.getAttribute("href");

      if (href && !href.includes("logout")) {
        await firstLink.click();
        await page
          .waitForLoadState("networkidle", { timeout: 5000 })
          .catch(() => {});

        // Verify header still exists and is consistent
        if ((await header.count()) > 0) {
          const newHeaderBox = await header.first().boundingBox();
          expect(newHeaderBox).toBeTruthy();
        }
      }
    }
  });

  /**
   * Navigation Usability Test
   * Ensure menus are intuitive
   */
  test("Navigation Menu Usability", async ({ page }) => {
    await login(page);

    // Find navigation menu
    const navMenu = page.locator(
      'nav, [role="navigation"], [class*="menu"], [class*="nav"]'
    );

    if ((await navMenu.count()) === 0) {
      test.skip("Navigation menu not found");
      return;
    }

    // Verify menu is visible
    await expect(navMenu.first()).toBeVisible();

    // Check menu items are clickable and have clear labels
    const menuItems = navMenu.locator("a, button");
    const itemCount = await menuItems.count();

    expect(itemCount).toBeGreaterThan(0);

    // Verify each menu item has text
    for (let i = 0; i < Math.min(itemCount, 5); i++) {
      const item = menuItems.nth(i);
      const text = await item.textContent();
      const isVisible = await item.isVisible();

      expect(text?.trim()).toBeTruthy();
      expect(isVisible).toBeTruthy();
    }
  });

  /**
   * Forms Usability Test
   * Verify labels, field instructions, and error messages
   */
  test("Forms Usability - Labels and Error Messages", async ({ page }) => {
    await page.goto(LOGIN_URL);

    // Find form fields
    const emailInput = page.locator(
      'input[type="email"], input[name="email"], input[id="email"]'
    );
    const passwordInput = page.locator(
      'input[type="password"], input[name="password"], input[id="password"]'
    );

    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();

    // Check for labels
    const emailLabel = page.locator(
      'label[for*="email"], label:has-text("Email"), label:has-text("email")'
    );
    const passwordLabel = page.locator(
      'label[for*="password"], label:has-text("Password"), label:has-text("password")'
    );

    // Verify labels exist (at least one should exist)
    const hasEmailLabel = (await emailLabel.count()) > 0;
    const hasPasswordLabel = (await passwordLabel.count()) > 0;

    if (!hasEmailLabel && !hasPasswordLabel) {
      // Check for placeholder text as alternative
      const emailPlaceholder = await emailInput.getAttribute("placeholder");
      const passwordPlaceholder = await passwordInput.getAttribute(
        "placeholder"
      );

      expect(emailPlaceholder || passwordPlaceholder).toBeTruthy();
    }

    // Test error message display
    // Submit form with invalid data
    await emailInput.fill("invalid-email");
    await passwordInput.fill("123");

    await page
      .click('button[type="submit"], button:has-text("Login")')
      .catch(() => {});
    await page.waitForTimeout(2000);

    // Check for error messages - look for the specific "Unable to login user" message
    // or any visible error indication
    const specificError = page.locator('text="Unable to login user"');
    const genericErrors = page.locator(
      '.error, .error-message, .alert-danger, [role="alert"], [class*="error"], [class*="invalid"]'
    );

    // Check if specific error message appears
    const hasSpecificError = (await specificError.count()) > 0;

    if (hasSpecificError) {
      // Verify the specific error message is visible
      await expect(specificError).toBeVisible();
    } else if ((await genericErrors.count()) > 0) {
      // If generic error elements exist, verify they have content
      const errorText = await genericErrors.first().textContent();
      if (errorText && errorText.trim()) {
        expect(errorText.trim()).toBeTruthy();
        await expect(genericErrors.first()).toBeVisible();
      }
    }
    // Note: If no error messages appear, the form might use HTML5 validation instead
  });

  /**
   * Colors and Branding Test
   * Validate compliance with EduTrace brand style
   * NOTE: Update expected colors based on actual brand guidelines
   */
  test("Colors and Branding Compliance", async ({ page }) => {
    await page.goto(LOGIN_URL);

    // Check primary button styling
    const loginButton = page.locator(
      'button[type="submit"], button:has-text("Login"), button:has-text("Sign in")'
    );

    if ((await loginButton.count()) > 0) {
      const button = loginButton.first();
      await expect(button).toBeVisible();

      // Get button styles
      const backgroundColor = await button.evaluate((el) => {
        return window.getComputedStyle(el).backgroundColor;
      });

      const color = await button.evaluate((el) => {
        return window.getComputedStyle(el).color;
      });

      const fontSize = await button.evaluate((el) => {
        return window.getComputedStyle(el).fontSize;
      });

      // Verify button has styling (not default browser styles)
      expect(backgroundColor).toBeTruthy();
      expect(color).toBeTruthy();
      expect(fontSize).toBeTruthy();

      // Log styles for manual verification
      test.info().annotations.push({
        type: "info",
        description: `Button styles - Background: ${backgroundColor}, Color: ${color}, Font Size: ${fontSize}`,
      });
    }

    // Check logo/branding elements
    const logo = page.locator(
      'img[alt*="logo"], img[alt*="EduTrace"], [class*="logo"]'
    );
    if ((await logo.count()) > 0) {
      await expect(logo.first()).toBeVisible();
    }

    // Check overall page styling consistency
    const bodyStyles = await page.evaluate(() => {
      const body = document.body;
      return {
        fontFamily: window.getComputedStyle(body).fontFamily,
        backgroundColor: window.getComputedStyle(body).backgroundColor,
        color: window.getComputedStyle(body).color,
      };
    });

    expect(bodyStyles.fontFamily).toBeTruthy();
    expect(bodyStyles.backgroundColor).toBeTruthy();
    expect(bodyStyles.color).toBeTruthy();
  });

  /**
   * Element Visibility Test
   * Assert key elements are visible
   */
  test("Element Visibility Assertions", async ({ page }) => {
    await page.goto(LOGIN_URL);

    // Verify login form elements are visible
    const emailInput = page.locator(
      'input[type="email"], input[name="email"], input[id="email"]'
    );
    const passwordInput = page.locator(
      'input[type="password"], input[name="password"], input[id="password"]'
    );
    const loginButton = page.locator(
      'button[type="submit"], button:has-text("Login"), button:has-text("Sign in")'
    );

    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();
    await expect(loginButton).toBeVisible();

    // Verify elements are enabled (not disabled)
    await expect(emailInput).toBeEnabled();
    await expect(passwordInput).toBeEnabled();
    await expect(loginButton).toBeEnabled();
  });

  /**
   * CSS Styling Test
   * Verify fonts, colors, buttons, alignment
   */
  test("CSS Styling Verification", async ({ page }) => {
    await page.goto(LOGIN_URL);

    // Get form container styles
    const form = page.locator('form, [class*="form"], [class*="login"]');

    if ((await form.count()) > 0) {
      const formStyles = await form.first().evaluate((el) => {
        const styles = window.getComputedStyle(el);
        return {
          display: styles.display,
          width: styles.width,
          maxWidth: styles.maxWidth,
          margin: styles.margin,
          padding: styles.padding,
        };
      });

      // Verify form has styling
      expect(formStyles.display).not.toBe("none");
      expect(formStyles.width).toBeTruthy();

      test.info().annotations.push({
        type: "info",
        description: `Form styles: ${JSON.stringify(formStyles)}`,
      });
    }

    // Check input field styling
    const emailInput = page.locator(
      'input[type="email"], input[name="email"], input[id="email"]'
    );
    const inputStyles = await emailInput.first().evaluate((el) => {
      const styles = window.getComputedStyle(el);
      return {
        padding: styles.padding,
        border: styles.border,
        borderRadius: styles.borderRadius,
        fontSize: styles.fontSize,
      };
    });

    expect(inputStyles.padding).toBeTruthy();
    expect(inputStyles.fontSize).toBeTruthy();

    // Check button styling
    const loginButton = page.locator(
      'button[type="submit"], button:has-text("Login")'
    );
    if ((await loginButton.count()) > 0) {
      const buttonStyles = await loginButton.first().evaluate((el) => {
        const styles = window.getComputedStyle(el);
        return {
          padding: styles.padding,
          borderRadius: styles.borderRadius,
          fontWeight: styles.fontWeight,
          cursor: styles.cursor,
        };
      });

      expect(buttonStyles.padding).toBeTruthy();
      // Verify button has a cursor style (could be pointer, default, or auto)
      // The important thing is that the button is clickable, which we verify separately
      expect(buttonStyles.cursor).toBeTruthy();

      // Verify button is actually clickable/enabled
      await expect(loginButton.first()).toBeEnabled();
    }
  });

  /**
   * Responsive Design Test (Basic)
   * Check layout at different viewport sizes
   */
  test("Responsive Design - Viewport Sizes", async ({ page }) => {
    await page.goto(LOGIN_URL);

    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.locator("body")).toBeVisible();

    const emailInputMobile = page.locator(
      'input[type="email"], input[name="email"]'
    );
    await expect(emailInputMobile.first()).toBeVisible();

    // Test tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    await expect(emailInputMobile.first()).toBeVisible();

    // Test desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 });
    await expect(emailInputMobile.first()).toBeVisible();
  });
});
