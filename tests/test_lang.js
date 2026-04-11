const { JSDOM } = require("jsdom");
const fs = require("fs");
const path = require("path");

// Create a basic DOM setup
const dom = new JSDOM(`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta name="description" content="Initial description">
    <meta property="og:description" content="Initial og">
    <meta property="twitter:description" content="Initial twitter">
</head>
<body>
    <div id="missing-key-test" data-i18n="non_existent_key">Original Text</div>
    <div data-i18n="nav_portfolio">Portfolio</div>
    <div data-i18n="hero_headline">HEAVY<br><em class="hero-accent">COMPUTER</em><br>WORK.</div>
    <input id="dummy-input" data-i18n-placeholder="form_placeholder_name" placeholder="Your name">
</body>
</html>
`, { url: "http://localhost" });

const { window } = dom;
global.window = window;
global.document = window.document;
global.localStorage = {
    _data: {},
    setItem: function(id, val) { return this._data[id] = String(val); },
    getItem: function(id) { return this._data.hasOwnProperty(id) ? this._data[id] : undefined; },
    removeItem: function(id) { return delete this._data[id]; },
    clear: function() { return this._data = {}; }
};

// Mock the translations object
global.translations = {
  en: {
    "nav_portfolio": "Portfolio",
    "hero_headline": "HEAVY<br><em class=\"hero-accent\">COMPUTER</em><br>WORK.",
    "form_placeholder_name": "Your name",
    "meta_desc": "English meta description"
  },
  fr: {
    "nav_portfolio": "Réalisations",
    "hero_headline": "UNE GROSSE JOB<br><em class=\"hero-accent\">D'ORDINATEUR.</em>",
    "form_placeholder_name": "Votre nom",
    "meta_desc": "French meta description"
  }
};

// Load the setLanguage function
const langJsCode = fs.readFileSync(path.join(__dirname, "..", "lang.js"), "utf-8");
// We need to extract just the setLanguage function to avoid running event listeners
const setLanguageMatch = langJsCode.match(/function setLanguage\([\s\S]*?\n\}/);

if (!setLanguageMatch) {
    console.error("Could not find setLanguage function in lang.js");
    process.exit(1);
}

// Evaluate the function in the global scope
eval(setLanguageMatch[0]);

function runTests() {
    let passed = 0;
    let failed = 0;

    function assert(condition, message) {
        if (!condition) {
            console.error("❌ FAIL: " + message);
            failed++;
        } else {
            console.log("✅ PASS: " + message);
            passed++;
        }
    }

    try {
        console.log("Testing setLanguage('fr')...");
        setLanguage('fr');

        // 1. Test localStorage and document lang
        assert(localStorage.getItem('collarwork_lang') === 'fr', "localStorage stores 'fr'");
        assert(document.documentElement.lang === 'fr-CA', "document.documentElement.lang is 'fr-CA'");

        // 2. Test basic string translation
        const portfolioDiv = document.querySelector('[data-i18n="nav_portfolio"]');
        assert(portfolioDiv.innerHTML === "Réalisations", `Portfolio text is translated. Got: ${portfolioDiv.innerHTML}`);

        // 3. Test HTML content translation
        const headlineDiv = document.querySelector('[data-i18n="hero_headline"]');
        assert(headlineDiv.innerHTML === "UNE GROSSE JOB<br><em class=\"hero-accent\">D'ORDINATEUR.</em>", "Headline HTML is translated");

        // 4. Test placeholder translation
        const inputElement = document.querySelector('#dummy-input');
        assert(inputElement.placeholder === "Votre nom", "Placeholder is translated");

        // 5. Test missing key
        const missingKeyDiv = document.querySelector('#missing-key-test');
        assert(missingKeyDiv.innerHTML === "Original Text", "Missing key leaves original text intact");

        // 6. Test Meta tags
        assert(document.querySelector('meta[name="description"]').content === "French meta description", "meta description updated");
        assert(document.querySelector('meta[property="og:description"]').content === "French meta description", "og:description updated");
        assert(document.querySelector('meta[property="twitter:description"]').content === "French meta description", "twitter:description updated");

        console.log("\nTesting setLanguage('en')...");
        setLanguage('en');

        assert(localStorage.getItem('collarwork_lang') === 'en', "localStorage stores 'en'");
        assert(document.documentElement.lang === 'en', "document.documentElement.lang is 'en'");
        assert(portfolioDiv.innerHTML === "Portfolio", "Portfolio text reverts to English");
        assert(inputElement.placeholder === "Your name", "Placeholder reverts to English");

        console.log(`\nTest Summary: ${passed} passed, ${failed} failed`);

        if (failed > 0) {
            process.exit(1);
        }
    } catch (e) {
        console.error("Test execution failed with error:");
        console.error(e);
        process.exit(1);
    }
}

runTests();
