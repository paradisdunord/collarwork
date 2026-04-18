const { test, expect } = require('@playwright/test');

test.describe('Contact Form', () => {
  test('shows error message on fetch failure', async ({ page }) => {
    // Navigate to contact page
    await page.goto('http://127.0.0.1:3000/contact.html');

    // Route the form submission to mock a failed response
    await page.route('https://mailer.collarworkdesign.workers.dev*', async route => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ success: false })
      });
    });

    // Fill out required fields
    await page.fill('#client-name', 'Test User');
    await page.fill('#client-email', 'test@example.com');
    await page.selectOption('#project-type', 'web_design');
    await page.fill('#project-title', 'Test Project');
    await page.fill('#project-goals', 'These are the project goals which must be at least 20 characters long.');

    await page.selectOption('#project-urgency', '1_month');
    await page.selectOption('#project-budget', '5000-10000');


    // Submit the form
    await page.click('#submit-btn');

    // Wait for error message to be visible
    const errorMsg = page.locator('#form-error');
    await expect(errorMsg).toHaveClass(/is-visible/);

    // Form should be hidden
    const form = page.locator('#project-form');
    await expect(form).toHaveClass(/is-hidden/);

    // Check the error message text
    const errorText = page.locator('#error-message');
    await expect(errorText).toContainText('error sending your message');
  });
});
