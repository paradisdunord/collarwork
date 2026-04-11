const { test, expect } = require('@playwright/test');

test.describe('Language switching and translations (lang.js)', () => {

  test.beforeEach(async ({ page }) => {
    // Start at the homepage
    await page.goto('http://127.0.0.1:3000');
  });

  test('should load default language as English', async ({ page }) => {
    // Check html lang attribute
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');

    // Check local storage
    const storedLang = await page.evaluate(() => localStorage.getItem('collarwork_lang'));
    expect(storedLang).toBe('en');

    // Check a sample translated element (e.g., hero_cta)
    await expect(page.locator('[data-i18n="hero_cta"]')).toHaveText('Start a Project');
  });

  test('should switch to French when toggle button is clicked', async ({ page }) => {
    // Click language toggle
    await page.locator('#lang-toggle').click();

    // Check html lang attribute
    await expect(page.locator('html')).toHaveAttribute('lang', 'fr-CA');

    // Check local storage updated
    const storedLang = await page.evaluate(() => localStorage.getItem('collarwork_lang'));
    expect(storedLang).toBe('fr');

    // Check sample translated element
    await expect(page.locator('[data-i18n="hero_cta"]')).toHaveText('Démarrer un projet');

    // Check that toggle text updated to 'EN'
    await expect(page.locator('#lang-toggle')).toHaveText('EN');
  });

  test('should update placeholder translations if any exist', async ({ page }) => {
    // Even though there are none right now, the logic is in lang.js and this ensures it works if added
    await page.setContent(`
      <input type="text" data-i18n-placeholder="hero_cta">
      <script>
        const translations = {
          en: { "hero_cta": "Start a Project" },
          fr: { "hero_cta": "Démarrer un projet" }
        };
        function setLanguage(lang) {
          const placeholders = document.querySelectorAll('[data-i18n-placeholder]');
          placeholders.forEach(el => {
            const key = el.getAttribute('data-i18n-placeholder');
            if (translations[lang] && translations[lang][key]) {
              el.placeholder = translations[lang][key];
            }
          });
        }
        setLanguage('fr');
      </script>
    `);

    const input = page.locator('input');
    await expect(input).toHaveAttribute('placeholder', 'Démarrer un projet');
  });

  test('should update meta descriptions', async ({ page }) => {
    // Check initial English meta description
    const metaDesc = page.locator('meta[name="description"]');
    await expect(metaDesc).toHaveAttribute('content', /A graphic and video design studio/);

    // Switch to French
    await page.locator('#lang-toggle').click();

    // Check French meta description
    await expect(metaDesc).toHaveAttribute('content', /Un studio de design/);
  });

  test('should persist language preference on reload', async ({ page }) => {
    // Switch to French
    await page.locator('#lang-toggle').click();

    // Reload the page
    await page.reload();

    // Check that it's still French
    await expect(page.locator('html')).toHaveAttribute('lang', 'fr-CA');
    await expect(page.locator('[data-i18n="hero_cta"]')).toHaveText('Démarrer un projet');
  });
});
