const { test, expect } = require('@playwright/test');

test.describe('Portfolio Lightbox', () => {
  test.beforeEach(async ({ page }) => {
    // Intercept external font and image requests to avoid timeouts in restricted environments
    await page.route('**/*.{png,jpg,jpeg,webp,svg}', route => route.fulfill({ status: 200, body: '' }));
    await page.route('https://fonts.googleapis.com/**', route => route.abort());
    await page.route('https://fonts.gstatic.com/**', route => route.abort());

    await page.goto('http://127.0.0.1:3000/index.html');
  });

  test('should open modal and populate content when a kinetic item is clicked', async ({ page }) => {
    const firstItem = page.locator('.kinetic-item').first();

    // Get expected data from the item
    const expectedTitle = await firstItem.locator('.kinetic-title').textContent();
    const expectedDesc = await firstItem.locator('.kinetic-desc').textContent();
    const expectedImg = await firstItem.getAttribute('data-image');

    // Click the item
    await firstItem.click();

    // Verify modal is open
    const modal = page.locator('#portfolio-modal');
    await expect(modal).toHaveClass(/is-open/);
    await expect(modal).toHaveAttribute('aria-hidden', 'false');
    await expect(page.locator('body')).toHaveCSS('overflow', 'hidden');

    // Verify content
    const modalTitle = page.locator('#modal-title');
    const modalDesc = page.locator('#modal-desc');
    const modalImg = page.locator('#modal-img');

    await expect(modalTitle).toHaveText(expectedTitle);
    await expect(modalDesc).toHaveText(expectedDesc);
    // Since we mocked images, we just check the src attribute
    await expect(modalImg).toHaveAttribute('src', expectedImg);
  });

  test('should close modal when close button is clicked', async ({ page }) => {
    const firstItem = page.locator('.kinetic-item').first();
    await firstItem.click();

    const modal = page.locator('#portfolio-modal');
    await expect(modal).toHaveClass(/is-open/);

    await page.click('#modal-close');

    await expect(modal).not.toHaveClass(/is-open/);
    await expect(modal).toHaveAttribute('aria-hidden', 'true');
    await expect(page.locator('body')).not.toHaveCSS('overflow', 'hidden');
  });

  test('should close modal when overlay is clicked', async ({ page }) => {
    const firstItem = page.locator('.kinetic-item').first();
    await firstItem.click();

    const modal = page.locator('#portfolio-modal');
    await expect(modal).toHaveClass(/is-open/);

    // Click the overlay
    // Using force: true because sometimes overlays might be "behind" but still clickable for this purpose
    // or we can click by coordinates or just use the ID.
    await page.click('#modal-overlay');

    await expect(modal).not.toHaveClass(/is-open/);
    await expect(modal).toHaveAttribute('aria-hidden', 'true');
  });

  test('should close modal when Escape key is pressed', async ({ page }) => {
    const firstItem = page.locator('.kinetic-item').first();
    await firstItem.click();

    const modal = page.locator('#portfolio-modal');
    await expect(modal).toHaveClass(/is-open/);

    await page.keyboard.press('Escape');

    await expect(modal).not.toHaveClass(/is-open/);
    await expect(modal).toHaveAttribute('aria-hidden', 'true');
  });
});
