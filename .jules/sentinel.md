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
## 2026-04-10 - LocalStorage Untrusted Input
**Vulnerability:** The `collarwork_lang` value retrieved from `localStorage` was used without validation as an object key to read `translations` and injected into the DOM via `innerHTML`.
**Learning:** Values from `localStorage` can be manipulated by malicious scripts or users. Failing to validate them can lead to Object Prototype Pollution or XSS vulnerabilities, especially when used to construct DOM elements.
**Prevention:** Always validate values retrieved from `localStorage` against a safelist (e.g., `['en', 'fr']`) before using them in sensitive operations like object property access or DOM manipulation.

## 2026-04-13 - Missing Timeout on External API Call
**Vulnerability:** External fetch request lacked a timeout, leading to potential resource exhaustion and client UI hanging.
**Learning:** Relying on default network timeouts can result in poor user experience or DoS if external services (like formsubmit.co) hang.
**Prevention:** Always implement an `AbortController` with a reasonable timeout for external API calls, ensuring proper cleanup with `clearTimeout` in a `finally` block.

## 2024-04-18 - XSS and Prototype Pollution in Translations
**Vulnerability:** Translation keys injected unsanitized user-controlled values into the DOM via innerHTML, leading to potential Cross-Site Scripting (XSS). In addition, checking existence of properties using array notation `translations[lang][key]` exposes the application to Object Prototype Pollution.
**Learning:** `innerHTML` should never be used on unsanitized data, and Object keys should be verified using `hasOwnProperty`.
**Prevention:** Use a sanitizer utility to strip potentially malicious tags and attributes before injection or use safer methods like `textContent`. Always validate keys with `Object.prototype.hasOwnProperty.call()` when accessing objects using dynamic variables.

## 2026-04-20 - Deprecated formsubmit.co in Content-Security-Policy
**Vulnerability:** The `form-action` directive in the Content-Security-Policy (CSP) of `404.html`, `privacy.html`, and `terms.html` pointed to the deprecated `https://formsubmit.co` instead of the project's custom mailer endpoint.
**Learning:** Inconsistent application of security policies across multiple HTML files can leave parts of the site using outdated or incorrect configurations when services are migrated.
**Prevention:** Maintain consistency in security headers (like CSP) across all pages of the site. Use automated checks or templates to ensure that when a service endpoint is updated, it is reflected in all relevant policy directives.
