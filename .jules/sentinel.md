## 2024-04-05 - Missing Content Security Policy (CSP)
**Vulnerability:** The static website lacks a Content Security Policy (CSP), leaving it vulnerable to Cross-Site Scripting (XSS) attacks, data injection, and other malicious content execution.
**Learning:** For statically hosted websites (e.g., GitHub Pages) where modifying HTTP headers isn't possible, CSP must be implemented directly in each HTML file using a `<meta http-equiv="Content-Security-Policy">` tag.
**Prevention:** Always ensure a robust CSP is included in the `<head>` of HTML documents for static sites.

## 2024-05-20 - Clickjacking Defense on Static Sites
**Vulnerability:** The website was vulnerable to clickjacking because `X-Frame-Options` cannot be set via `<meta>` tags and CSP `frame-ancestors` directive is ignored in `<meta>` tags.
**Learning:** For statically hosted websites (like GitHub Pages) where HTTP headers cannot be modified, standard header-based clickjacking defenses (`X-Frame-Options`, CSP `frame-ancestors`) are unavailable or ignored when used in `<meta>` tags.
**Prevention:** Implement a frame-busting script (e.g., `if (window.top !== window.self) { window.top.location = window.self.location; }`) in the main JavaScript bundle to prevent the site from being embedded in an iframe on other domains.
## 2026-04-07 - Fix Email Address Exposure in Form Action
**Vulnerability:** Plaintext email address was exposed in the form action attribute for formsubmit.co.
**Learning:** The plaintext email could be easily scraped by bots leading to spam.
**Prevention:** Use a random 32-character hexadecimal string provided by formsubmit.co instead of a plaintext email address.

## 2026-04-09 - LocalStorage Prototype Pollution and XSS Defense
**Vulnerability:** Untrusted input from `localStorage` was being directly used as an object key (`translations[lang]`) and the resulting value was passed to `innerHTML`. This could lead to Object Prototype Pollution or Cross-Site Scripting (XSS) if an attacker manipulates the `localStorage` value to point to prototype properties (like `__proto__`) which might be coerced or evaluated unsafely.
**Learning:** Values from `localStorage` must be treated as untrusted user input, just like URL parameters or form data. Using unvalidated `localStorage` values as object keys or inserting them via `innerHTML` without sanitization is a security risk.
**Prevention:** Always strictly validate and constrain values loaded from `localStorage` against a safelist (e.g., using a ternary operator to force valid values like `const safeLang = (lang === 'fr') ? 'fr' : 'en';`) before using them in logic, property access, or DOM updates.
