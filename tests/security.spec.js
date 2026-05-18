const { test, expect } = require('@playwright/test');
const path = require('path');

test.describe('Security: DOM-based XSS in lang.js', () => {
  test.beforeEach(async ({ page }) => {
    // Load the index page
    await page.goto('http://127.0.0.1:3000');
  });

  test('should sanitize javascript: in href', async ({ page }) => {
    const result = await page.evaluate(() => {
      // Access sanitizeToFragment if it's global, or we might need to expose it
      // In lang.js it seems to be at top level but not exported.
      // However, it's used in the global scope of lang.js.

      // Let's try to call it.
      const html = '<a href="javascript:alert(1)">Click me</a>';
      const fragment = sanitizeToFragment(html);
      const a = fragment.querySelector('a');
      return a.hasAttribute('href');
    });
    expect(result).toBe(false);
  });

  test('should sanitize bypass attempts', async ({ page }) => {
    const bypasses = [
      '  javascript:alert(1)',
      'java\x01script:alert(1)',
      'j\x0aavasc\x09ript:alert(1)',
      'data:text/html,<script>alert(1)</script>',
      'vbscript:alert(1)' // Not currently blocked
    ];

    for (const href of bypasses) {
      const hasHref = await page.evaluate((h) => {
        const fragment = sanitizeToFragment(h.startsWith('<a') ? h : `<a href="${h}">Link</a>`);
        const a = fragment.querySelector('a');
        return a.hasAttribute('href');
      }, href);

      if (hasHref) {
          const actualHref = await page.evaluate((h) => {
            const fragment = sanitizeToFragment(h.startsWith('<a') ? h : `<a href="${h}">Link</a>`);
            return fragment.querySelector('a').getAttribute('href');
          }, href);
          console.log(`Bypass successful for: ${href}. Resulting href: ${actualHref}`);
      }
      expect(hasHref, `Href "${href}" should be sanitized`).toBe(false);
    }
  });
});
