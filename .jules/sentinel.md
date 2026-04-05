## 2024-04-05 - Missing Content Security Policy (CSP)
**Vulnerability:** The static website lacks a Content Security Policy (CSP), leaving it vulnerable to Cross-Site Scripting (XSS) attacks, data injection, and other malicious content execution.
**Learning:** For statically hosted websites (e.g., GitHub Pages) where modifying HTTP headers isn't possible, CSP must be implemented directly in each HTML file using a `<meta http-equiv="Content-Security-Policy">` tag.
**Prevention:** Always ensure a robust CSP is included in the `<head>` of HTML documents for static sites.
