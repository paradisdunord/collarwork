/**
 * @jest-environment jsdom
 */

describe('Performance optimization test', () => {
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
      <div class="portfolio-card" id="card2">
        <img class="portfolio-card-img" src="img2.jpg" alt="Img 2" />
        <div class="portfolio-overlay-content">
          <h3 class="portfolio-card-title">Project 2</h3>
          <p>Description 2</p>
        </div>
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

    document.body.style.overflow = '';
    jest.resetModules();
    require('./main.js');
    const event = new Event('DOMContentLoaded');
    document.dispatchEvent(event);
  });

  test('measure click performance', () => {
    const card1 = document.getElementById('card1');
    const start = performance.now();
    for (let i = 0; i < 10000; i++) {
        card1.click();
    }
    const end = performance.now();
    console.log(`10000 clicks took ${end - start} ms`);
  });
});
