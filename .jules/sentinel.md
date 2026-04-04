## 2024-05-18 - [Add Content Security Policy (CSP) headers]
**Vulnerability:** Missing Content Security Policy (CSP) headers, which left the application more susceptible to Cross-Site Scripting (XSS) and unauthorized resource loading.
**Learning:** For static sites deployed without backend server control (like GitHub Pages), HTTP security headers cannot be set conventionally. Instead, CSP rules can be effectively applied using the `<meta http-equiv="Content-Security-Policy" content="...">` tag directly within the HTML files to enforce resource restrictions.
**Prevention:** Always verify if a site is statically hosted and use meta tags to enforce CSP and other security policies if server configuration is unavailable.
