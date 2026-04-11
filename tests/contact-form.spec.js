const { test, expect } = require('@playwright/test');

test.describe('Form Field Validation', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the contact page to load the HTML structure and scripts
    await page.goto('file:///app/contact.html');
    await page.waitForLoadState('networkidle');
  });

  test('Required field validation - Empty value fails', async ({ page }) => {
    const hasError = await page.evaluate(() => {
      const { validateField } = window.__contactFormInternals;
      const field = document.getElementById('client-name');

      // Clear value
      field.value = '';

      // Call our targeted function
      const isValid = validateField(field);

      return {
        isValid,
        hasClass: field.classList.contains('has-error'),
        groupHasClass: field.closest('.floating-group').classList.contains('has-error'),
        hasValidClass: field.classList.contains('is-valid')
      };
    });

    expect(hasError.isValid).toBe(false);
    expect(hasError.hasClass).toBe(true);
    expect(hasError.groupHasClass).toBe(true);
    expect(hasError.hasValidClass).toBe(false);
  });

  test('Minimum length validation - Short value fails', async ({ page }) => {
    const hasError = await page.evaluate(() => {
      const { validateField } = window.__contactFormInternals;
      const field = document.getElementById('client-name');

      // Set value below minLength (2)
      field.value = 'A';

      const isValid = validateField(field);

      return {
        isValid,
        hasClass: field.classList.contains('has-error'),
        groupHasClass: field.closest('.floating-group').classList.contains('has-error'),
        hasValidClass: field.classList.contains('is-valid')
      };
    });

    expect(hasError.isValid).toBe(false);
    expect(hasError.hasClass).toBe(true);
    expect(hasError.groupHasClass).toBe(true);
    expect(hasError.hasValidClass).toBe(false);
  });

  test('Valid input passes validation', async ({ page }) => {
    const validState = await page.evaluate(() => {
      const { validateField } = window.__contactFormInternals;
      const field = document.getElementById('client-name');

      // Set a valid value
      field.value = 'Jane Doe';

      const isValid = validateField(field);

      return {
        isValid,
        hasClass: field.classList.contains('has-error'),
        groupHasClass: field.closest('.floating-group').classList.contains('has-error'),
        hasValidClass: field.classList.contains('is-valid')
      };
    });

    expect(validState.isValid).toBe(true);
    expect(validState.hasClass).toBe(false);
    expect(validState.groupHasClass).toBe(false);
    expect(validState.hasValidClass).toBe(true);
  });

  test('Email pattern validation - Invalid email fails', async ({ page }) => {
    const hasError = await page.evaluate(() => {
      const { validateField } = window.__contactFormInternals;
      const field = document.getElementById('client-email');

      // Set invalid email
      field.value = 'invalid-email-address';

      const isValid = validateField(field);

      return {
        isValid,
        hasClass: field.classList.contains('has-error'),
        groupHasClass: field.closest('.floating-group').classList.contains('has-error')
      };
    });

    expect(hasError.isValid).toBe(false);
    expect(hasError.hasClass).toBe(true);
    expect(hasError.groupHasClass).toBe(true);
  });

  test('Email pattern validation - Valid email passes', async ({ page }) => {
    const validState = await page.evaluate(() => {
      const { validateField } = window.__contactFormInternals;
      const field = document.getElementById('client-email');

      // Set valid email
      field.value = 'jane.doe@example.com';

      const isValid = validateField(field);

      return {
        isValid,
        hasClass: field.classList.contains('has-error'),
        groupHasClass: field.closest('.floating-group').classList.contains('has-error'),
        hasValidClass: field.classList.contains('is-valid')
      };
    });

    expect(validState.isValid).toBe(true);
    expect(validState.hasClass).toBe(false);
    expect(validState.groupHasClass).toBe(false);
    expect(validState.hasValidClass).toBe(true);
  });
});
