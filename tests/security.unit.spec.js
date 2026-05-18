const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');

// Mock Node because it's used in lang.js
global.Node = {
  ELEMENT_NODE: 1,
  TEXT_NODE: 3
};

// Mock document and related elements for Node.js environment
class MockAttribute {
  constructor(name, value) {
    this.name = name;
    this.value = value;
  }
}

class MockNode {
  constructor(tagName = '', nodeType = Node.ELEMENT_NODE) {
    this.tagName = tagName.toUpperCase();
    this.nodeType = nodeType;
    this.attributes = [];
    this.childNodes = [];
  }

  hasAttribute(name) {
    return this.attributes.some(attr => attr.name === name);
  }

  getAttribute(name) {
    const attr = this.attributes.find(attr => attr.name === name);
    return attr ? attr.value : null;
  }

  removeAttribute(name) {
    this.attributes = this.attributes.filter(attr => attr.name !== name);
  }

  remove() {
    // No-op for this mock
  }

  appendChild(child) {
    this.childNodes.push(child);
  }
}

global.document = {
  createElement: (tagName) => {
    if (tagName === 'template') {
      return {
        content: new MockNode('template_content'),
        set innerHTML(html) {
          // Very basic parser for our specific test cases
          if (html.startsWith('<a')) {
            const a = new MockNode('A');
            const hrefMatch = html.match(/href="([^"]+)"/);
            if (hrefMatch) {
              a.attributes.push(new MockAttribute('href', hrefMatch[1]));
            }
            this.content.appendChild(a);
          }
        }
      };
    }
    return new MockNode(tagName);
  },
  querySelectorAll: () => [],
  querySelector: () => null,
  addEventListener: () => {}
};

global.window = {
  location: { pathname: '/' },
  addEventListener: () => {}
};

global.localStorage = {
  getItem: () => 'en',
  setItem: () => {}
};

const { sanitizeToFragment } = require('../lang.js');

test('sanitizeToFragment should block malicious protocols', () => {
  const payloads = [
    'javascript:alert(1)',
    '  javascript:alert(2)',
    'java\x01script:alert(3)',
    'vbscript:alert(4)',
    'data:text/html,<script>alert(5)</script>',
    'javascript://%0Aalert(6)'
  ];

  for (const payload of payloads) {
    const html = `<a href="${payload}">Link</a>`;
    const fragment = sanitizeToFragment(html);
    const a = fragment.childNodes[0];
    assert.strictEqual(a.hasAttribute('href'), false, `Should block malicious payload: ${payload}`);
  }
});

test('sanitizeToFragment should allow safe protocols', () => {
  const safe = [
    'https://example.com',
    'http://example.com',
    'mailto:hello@collarworkdesign.com',
    'tel:+123456789',
    'index.html',
    '#portfolio',
    '/privacy.html',
    'images/logo.png'
  ];

  for (const href of safe) {
    const html = `<a href="${href}">Link</a>`;
    const fragment = sanitizeToFragment(html);
    const a = fragment.childNodes[0];
    assert.strictEqual(a.getAttribute('href'), href, `Should allow safe href: ${href}`);
  }
});
