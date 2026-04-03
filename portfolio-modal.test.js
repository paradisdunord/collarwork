/**
 * @jest-environment jsdom
 */

// We need to test the portfolio lightbox modal interaction in main.js.
// Since main.js runs immediately on DOMContentLoaded, we will set up the DOM,
// then require the script and trigger the event.

describe('Portfolio Lightbox Modal Interaction', () => {
  beforeEach(() => {
    // Reset the DOM
    document.body.innerHTML = `
      <!-- Portfolio Cards -->
      <div class="portfolio-card" id="card1">
        <img class="portfolio-card-img" src="img1.jpg" alt="Img 1" />
        <div class="portfolio-overlay-content">
          <h3 class="portfolio-card-title">Project 1</h3>
          <p>Description 1</p>
        </div>
      </div>
      <div class="portfolio-card" id="card-missing-elements">
        <!-- Missing img, title, desc to test edge cases -->
      </div>

      <!-- Modal Elements -->
      <div id="portfolio-modal" class="" aria-hidden="true">
        <img id="modal-img" src="" alt="Modal Image" />
        <h3 id="modal-title"></h3>
        <p id="modal-desc"></p>
        <button id="modal-close">Close</button>
        <div id="modal-overlay"></div>
      </div>
    `;

    // Clear any previous body styles
    document.body.style.overflow = '';

    // Re-evaluate main.js. We need to clear the module cache so it runs again
    // and attaches listeners to the newly created DOM elements.
    jest.resetModules();
    require('./main.js');

    // Trigger DOMContentLoaded
    const event = new Event('DOMContentLoaded');
    document.dispatchEvent(event);
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  test('opens modal and populates data on card click', () => {
    const card1 = document.getElementById('card1');
    const modal = document.getElementById('portfolio-modal');
    const modalImg = document.getElementById('modal-img');
    const modalTitle = document.getElementById('modal-title');
    const modalDesc = document.getElementById('modal-desc');

    card1.click();

    expect(modal.classList.contains('is-open')).toBe(true);
    expect(modal.getAttribute('aria-hidden')).toBe('false');
    expect(document.body.style.overflow).toBe('hidden');

    // Check if data is populated
    expect(modalImg.src).toContain('img1.jpg');
    expect(modalTitle.textContent).toBe('Project 1');
    expect(modalDesc.textContent).toBe('Description 1');
  });

  test('opens modal even if card has missing elements', () => {
    const cardMissing = document.getElementById('card-missing-elements');
    const modal = document.getElementById('portfolio-modal');
    const modalImg = document.getElementById('modal-img');
    const modalTitle = document.getElementById('modal-title');
    const modalDesc = document.getElementById('modal-desc');

    // Set initial values to ensure they aren't overwritten with undefined or errors
    modalImg.src = 'http://localhost/default.jpg';
    modalTitle.textContent = 'Default Title';
    modalDesc.textContent = 'Default Desc';

    cardMissing.click();

    expect(modal.classList.contains('is-open')).toBe(true);
    // Since elements were missing, modal content should remain what it was
    expect(modalImg.src).toBe('http://localhost/default.jpg');
    expect(modalTitle.textContent).toBe('Default Title');
    expect(modalDesc.textContent).toBe('Default Desc');
  });

  test('closes modal on close button click', () => {
    const card1 = document.getElementById('card1');
    const modal = document.getElementById('portfolio-modal');
    const modalClose = document.getElementById('modal-close');

    // Open first
    card1.click();
    expect(modal.classList.contains('is-open')).toBe(true);

    // Close
    modalClose.click();

    expect(modal.classList.contains('is-open')).toBe(false);
    expect(modal.getAttribute('aria-hidden')).toBe('true');
    expect(document.body.style.overflow).toBe('');
  });

  test('closes modal on overlay click', () => {
    const card1 = document.getElementById('card1');
    const modal = document.getElementById('portfolio-modal');
    const modalOverlay = document.getElementById('modal-overlay');

    // Open first
    card1.click();
    expect(modal.classList.contains('is-open')).toBe(true);

    // Close via overlay
    modalOverlay.click();

    expect(modal.classList.contains('is-open')).toBe(false);
    expect(modal.getAttribute('aria-hidden')).toBe('true');
    expect(document.body.style.overflow).toBe('');
  });

  test('closes modal on Escape keydown', () => {
    const card1 = document.getElementById('card1');
    const modal = document.getElementById('portfolio-modal');

    // Open first
    card1.click();
    expect(modal.classList.contains('is-open')).toBe(true);

    // Trigger Escape
    const escapeEvent = new KeyboardEvent('keydown', { key: 'Escape' });
    document.dispatchEvent(escapeEvent);

    expect(modal.classList.contains('is-open')).toBe(false);
    expect(modal.getAttribute('aria-hidden')).toBe('true');
    expect(document.body.style.overflow).toBe('');
  });

  test('does not close modal on other keydown', () => {
    const card1 = document.getElementById('card1');
    const modal = document.getElementById('portfolio-modal');

    // Open first
    card1.click();
    expect(modal.classList.contains('is-open')).toBe(true);

    // Trigger Enter
    const enterEvent = new KeyboardEvent('keydown', { key: 'Enter' });
    document.dispatchEvent(enterEvent);

    expect(modal.classList.contains('is-open')).toBe(true); // Should still be open
  });
});
