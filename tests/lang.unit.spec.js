const assert = require('node:assert');
const { test, describe } = require('node:test');

// 1. Mock browser globals before requiring the module
global.Node = {
  ELEMENT_NODE: 1,
  TEXT_NODE: 3,
  DOCUMENT_FRAGMENT_NODE: 11
};

class MockNode {
  constructor(nodeType, tagName = null) {
    this.nodeType = nodeType;
    this.tagName = tagName ? tagName.toUpperCase() : null;
    this.childNodes = [];
    this.attributes = [];
    this.parentNode = null;
  }

  remove() {
    if (this.parentNode) {
      const index = this.parentNode.childNodes.indexOf(this);
      if (index > -1) {
        this.parentNode.childNodes.splice(index, 1);
      }
      this.parentNode = null;
    }
  }

  removeAttribute(name) {
    this.attributes = this.attributes.filter(attr => attr.name !== name);
  }

  appendChild(node) {
    node.parentNode = this;
    this.childNodes.push(node);
    return node;
  }

  replaceChildren(...nodes) {
    this.childNodes = [];
    for (let node of nodes) {
      if (node.nodeType === global.Node.DOCUMENT_FRAGMENT_NODE) {
        // Correctly handle DocumentFragment by moving its children
        const children = [...node.childNodes];
        for (let child of children) {
          this.appendChild(child);
        }
        node.childNodes = []; // Fragment is emptied after append
      } else {
        this.appendChild(node);
      }
    }
  }

  getAttribute(name) {
    const attr = this.attributes.find(a => a.name === name);
    return attr ? attr.value : null;
  }
}

global.document = {
  addEventListener: () => {},
  createElement: (tagName) => {
    if (tagName === 'template') {
      return {
        content: new MockNode(global.Node.DOCUMENT_FRAGMENT_NODE),
        set innerHTML(html) {
          this._innerHTML = html;
        }
      };
    }
    return new MockNode(global.Node.ELEMENT_NODE, tagName);
  },
  querySelectorAll: () => [],
  getElementById: () => null,
  querySelector: () => null,
  documentElement: { lang: '' }
};

global.localStorage = {
  getItem: () => null,
  setItem: () => {}
};

global.window = {
  addEventListener: () => {}
};

// 2. Import the module
const { sanitizeToFragment } = require('../lang.js');

// 3. Define Tests
describe('sanitizeToFragment (Unit)', () => {

  test('should allow safe tags (BR, EM, I, SPAN, A)', () => {
    const template = document.createElement('template');
    const em = new MockNode(global.Node.ELEMENT_NODE, 'EM');
    const br = new MockNode(global.Node.ELEMENT_NODE, 'BR');
    const i = new MockNode(global.Node.ELEMENT_NODE, 'I');
    const span = new MockNode(global.Node.ELEMENT_NODE, 'SPAN');
    const a = new MockNode(global.Node.ELEMENT_NODE, 'A');

    template.content.appendChild(em);
    template.content.appendChild(br);
    template.content.appendChild(i);
    template.content.appendChild(span);
    template.content.appendChild(a);

    const originalCreateElement = global.document.createElement;
    global.document.createElement = (tag) => tag === 'template' ? template : originalCreateElement(tag);

    sanitizeToFragment('...ignored...');

    assert.strictEqual(template.content.childNodes.length, 5);
    assert.strictEqual(template.content.childNodes[0].tagName, 'EM');
    assert.strictEqual(template.content.childNodes[1].tagName, 'BR');
    assert.strictEqual(template.content.childNodes[2].tagName, 'I');
    assert.strictEqual(template.content.childNodes[3].tagName, 'SPAN');
    assert.strictEqual(template.content.childNodes[4].tagName, 'A');

    global.document.createElement = originalCreateElement;
  });

  test('should remove unsafe tags (e.g. SCRIPT, DIV, IMG)', () => {
    const template = document.createElement('template');
    const script = new MockNode(global.Node.ELEMENT_NODE, 'SCRIPT');
    const div = new MockNode(global.Node.ELEMENT_NODE, 'DIV');
    const img = new MockNode(global.Node.ELEMENT_NODE, 'IMG');

    template.content.appendChild(script);
    template.content.appendChild(div);
    template.content.appendChild(img);

    const originalCreateElement = global.document.createElement;
    global.document.createElement = (tag) => tag === 'template' ? template : originalCreateElement(tag);

    sanitizeToFragment('...ignored...');

    assert.strictEqual(template.content.childNodes.length, 0);
    global.document.createElement = originalCreateElement;
  });

  test('should allow safe attributes (class, href, target, rel)', () => {
    const template = document.createElement('template');
    const a = new MockNode(global.Node.ELEMENT_NODE, 'A');
    a.attributes = [
      { name: 'href', value: 'https://example.com' },
      { name: 'class', value: 'btn' },
      { name: 'target', value: '_blank' },
      { name: 'rel', value: 'noopener' },
      { name: 'onclick', value: 'alert(1)' },
      { name: 'style', value: 'color:red' }
    ];
    template.content.appendChild(a);

    const originalCreateElement = global.document.createElement;
    global.document.createElement = (tag) => tag === 'template' ? template : originalCreateElement(tag);

    sanitizeToFragment('...ignored...');

    assert.strictEqual(a.attributes.length, 4);
    assert.ok(a.attributes.find(attr => attr.name === 'href'));
    assert.ok(a.attributes.find(attr => attr.name === 'class'));
    assert.ok(a.attributes.find(attr => attr.name === 'target'));
    assert.ok(a.attributes.find(attr => attr.name === 'rel'));
    assert.ok(!a.attributes.find(attr => attr.name === 'onclick'));
    assert.ok(!a.attributes.find(attr => attr.name === 'style'));

    global.document.createElement = originalCreateElement;
  });

  test('should block malicious URI schemes in href', () => {
    const template = document.createElement('template');

    const a1 = new MockNode(global.Node.ELEMENT_NODE, 'A');
    a1.attributes = [{ name: 'href', value: 'javascript:alert(1)' }];

    const a2 = new MockNode(global.Node.ELEMENT_NODE, 'A');
    a2.attributes = [{ name: 'href', value: 'data:text/html,<script>alert(1)</script>' }];

    const a3 = new MockNode(global.Node.ELEMENT_NODE, 'A');
    a3.attributes = [{ name: 'href', value: '  java\nscript:alert(2)' }];

    const a4 = new MockNode(global.Node.ELEMENT_NODE, 'A');
    a4.attributes = [{ name: 'href', value: 'HTTPS://SAFE.COM' }];

    template.content.appendChild(a1);
    template.content.appendChild(a2);
    template.content.appendChild(a3);
    template.content.appendChild(a4);

    const originalCreateElement = global.document.createElement;
    global.document.createElement = (tag) => tag === 'template' ? template : originalCreateElement(tag);

    sanitizeToFragment('...ignored...');

    assert.strictEqual(a1.attributes.length, 0, 'Should block javascript:');
    assert.strictEqual(a2.attributes.length, 0, 'Should block data:');
    assert.strictEqual(a3.attributes.length, 0, 'Should block javascript: with whitespace/newlines');
    assert.strictEqual(a4.attributes.length, 1, 'Should allow https:');
    assert.strictEqual(a4.attributes[0].value, 'HTTPS://SAFE.COM');

    global.document.createElement = originalCreateElement;
  });

  test('should handle nested elements and text nodes', () => {
    const template = document.createElement('template');
    const span = new MockNode(global.Node.ELEMENT_NODE, 'SPAN');
    const em = new MockNode(global.Node.ELEMENT_NODE, 'EM');
    const text = new MockNode(global.Node.TEXT_NODE);
    text.textContent = 'safe text';
    const script = new MockNode(global.Node.ELEMENT_NODE, 'SCRIPT');

    em.appendChild(text);
    span.appendChild(em);
    span.appendChild(script);
    template.content.appendChild(span);

    const originalCreateElement = global.document.createElement;
    global.document.createElement = (tag) => tag === 'template' ? template : originalCreateElement(tag);

    sanitizeToFragment('...ignored...');

    assert.strictEqual(template.content.childNodes.length, 1);
    assert.strictEqual(span.childNodes.length, 1); // script removed
    assert.strictEqual(span.childNodes[0].tagName, 'EM');
    assert.strictEqual(em.childNodes.length, 1);
    assert.strictEqual(em.childNodes[0].nodeType, global.Node.TEXT_NODE);

    global.document.createElement = originalCreateElement;
  });

  test('should remove elements that are not allowed even if they contain allowed ones', () => {
    const template = document.createElement('template');
    const div = new MockNode(global.Node.ELEMENT_NODE, 'DIV');
    const span = new MockNode(global.Node.ELEMENT_NODE, 'SPAN');

    div.appendChild(span);
    template.content.appendChild(div);

    const originalCreateElement = global.document.createElement;
    global.document.createElement = (tag) => tag === 'template' ? template : originalCreateElement(tag);

    sanitizeToFragment('...ignored...');

    assert.strictEqual(template.content.childNodes.length, 0, 'DIV should be removed along with its children');

    global.document.createElement = originalCreateElement;
  });
});
