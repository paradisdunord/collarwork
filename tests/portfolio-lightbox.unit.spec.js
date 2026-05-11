const test = require('node:test');
const assert = require('node:assert');

// Mock browser globals
global.window = {
  addEventListener: () => {},
  scrollTo: () => {},
  location: { pathname: '/' }
};
global.document = {
  addEventListener: () => {},
  querySelectorAll: () => [],
  getElementById: () => null,
  body: { style: {} }
};

// We need to provide a more functional mock for querySelectorAll to simulate kinetic items
let modalImg = { src: '' };
let modalTitle = { textContent: '' };
let modalDesc = { textContent: '' };
let modalClose = { addEventListener: () => {} };
let modalOverlay = { addEventListener: () => {} };

const { initPortfolioLightbox } = require('../main.js');

test('Portfolio Lightbox Initialization (Unit)', async (t) => {
  await t.test('should attach click listeners to kinetic items and populate modal', () => {
    let clickHandler = null;
    const item = {
      style: {},
      getAttribute: (attr) => {
        if (attr === 'data-image') return 'test-image.jpg';
        return null;
      },
      querySelector: (selector) => {
        if (selector === '.kinetic-title') return { textContent: 'Test Title' };
        if (selector === '.kinetic-desc') return { textContent: 'Test Description' };
        return null;
      },
      addEventListener: (event, handler) => {
        if (event === 'click') clickHandler = handler;
      }
    };

    global.document.querySelectorAll = (selector) => {
      if (selector === '.kinetic-item') return [item];
      return [];
    };

    const modal = {
      classList: {
        add: (cls) => modal.classes.push(cls),
        remove: (cls) => {
          const index = modal.classes.indexOf(cls);
          if (index > -1) modal.classes.splice(index, 1);
        },
        contains: (cls) => modal.classes.includes(cls)
      },
      classes: [],
      setAttribute: (name, val) => { modal.attrs[name] = val; },
      attrs: {}
    };

    global.document.getElementById = (id) => {
      if (id === 'portfolio-modal') return modal;
      if (id === 'modal-img') return modalImg;
      if (id === 'modal-title') return modalTitle;
      if (id === 'modal-desc') return modalDesc;
      if (id === 'modal-close') return modalClose;
      if (id === 'modal-overlay') return modalOverlay;
      return null;
    };

    initPortfolioLightbox();

    assert.strictEqual(item.style.cursor, 'pointer');
    assert.ok(clickHandler, 'Click handler should be attached');

    // Trigger click
    clickHandler();

    assert.strictEqual(modalImg.src, 'test-image.jpg');
    assert.strictEqual(modalTitle.textContent, 'Test Title');
    assert.strictEqual(modalDesc.textContent, 'Test Description');
    assert.ok(modal.classes.includes('is-open'));
    assert.strictEqual(modal.attrs['aria-hidden'], 'false');
    assert.strictEqual(global.document.body.style.overflow, 'hidden');
  });
});
