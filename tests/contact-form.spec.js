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

  test('validates required fields on submit', async ({ page }) => {
    await page.goto('http://127.0.0.1:3000/contact.html');

    // Click submit without filling anything
    await page.click('#submit-btn');

    // Check for error class on a required field group
    const nameGroup = page.locator('.floating-group').filter({ hasText: 'Full Name' });
    await expect(nameGroup).toHaveClass(/has-error/);

    const emailGroup = page.locator('.floating-group').filter({ hasText: 'Email Address' });
    await expect(emailGroup).toHaveClass(/has-error/);

    const errorMsg = page.locator('#name-error');
    await expect(errorMsg).toBeVisible();
  });

  test('validates email format', async ({ page }) => {
    await page.goto('http://127.0.0.1:3000/contact.html');

    await page.fill('#client-email', 'invalid-email');
    await page.focus('#client-name'); // Trigger blur on email

    const emailGroup = page.locator('.floating-group').filter({ hasText: 'Email Address' });
    await expect(emailGroup).toHaveClass(/has-error/);

    const errorMsg = page.locator('#email-error');
    await expect(errorMsg).toContainText('valid email address');
  });

  test('validates minimum length for project goals', async ({ page }) => {
    await page.goto('http://127.0.0.1:3000/contact.html');

    await page.fill('#project-goals', 'Too short');
    await page.click('#submit-btn');

    const goalsGroup = page.locator('.floating-group').filter({ hasText: 'What are you trying to achieve?' });
    await expect(goalsGroup).toHaveClass(/has-error/);

    const errorMsg = page.locator('#goals-error');
    await expect(errorMsg).toContainText('at least 20 characters');
  });

  test('clears error on input', async ({ page }) => {
    await page.goto('http://127.0.0.1:3000/contact.html');

    await page.click('#submit-btn');
    const nameGroup = page.locator('.floating-group').filter({ hasText: 'Full Name' });
    await expect(nameGroup).toHaveClass(/has-error/);

    await page.fill('#client-name', 'J');
    await expect(nameGroup).not.toHaveClass(/has-error/);
  });
});
