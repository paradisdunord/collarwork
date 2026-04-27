/**
 * Custom Elastic Ease Out Back function
 * @param {number} t - Progress value from 0 to 1
 * @returns {number} - Eased value
 */
const c1 = 3.0; // High overshoot multiplier for a solid bump
const c3 = c1 + 1;

const easeOutBack = (t) => {
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
};

// Expose globally for the browser
if (typeof window !== 'undefined') {
  window.easeOutBack = easeOutBack;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { easeOutBack };
}


// Anti-Clickjacking: Frame-busting script
// Required because GitHub Pages doesn't allow X-Frame-Options headers
// and CSP <meta> tags don't support the frame-ancestors directive.
if (window.top !== window.self) {
  window.top.location = window.self.location;
}

/**
 * 1. Mobile Navigation Toggle
 */
function initMobileNav() {
  const navToggle = document.getElementById('nav-toggle');
  const navLinks = document.getElementById('nav-links');
  const navLinkItems = document.querySelectorAll('.nav-link');

  if (navToggle && navLinks) {
    navToggle.addEventListener('click', () => {
      navLinks.classList.toggle('is-open');
    });

    // Close mobile menu when a nav link is clicked
    navLinkItems.forEach(link => {
      link.addEventListener('click', () => {
        if (window.innerWidth <= 768) {
          navLinks.classList.remove('is-open');
        }
      });
    });
  }
}

/**
 * 2. Hyper-Fast Scroll to Top with Elastic Bump (Logo click)
 */
function initScrollToTop() {
  const navLogos = document.querySelectorAll('.nav-logo');

  navLogos.forEach(logo => {
    logo.addEventListener('click', (e) => {
      // If the link points to index.html and we're NOT on the homepage, let standard navigation happen
      const href = logo.getAttribute('href');
      const isIndexPage = window.location.pathname.endsWith('index.html') || window.location.pathname === '/';
      if (href === 'index.html' && !isIndexPage) {
        return; 
      }

      e.preventDefault();
      
      const startY = window.scrollY;
      if (startY <= 0) return;
      
      const duration = 500; // Hyper fast (500ms)
      let startTime = null;

      const step = (timestamp) => {
        if (!startTime) startTime = timestamp;
        const progress = timestamp - startTime;
        let t = Math.min(progress / duration, 1);
        
        let easedT = easeOutBack(t);
        let targetY = startY * (1 - easedT);

        if (targetY < 0) {
          // We overshot the top (targetY is negative). 
          // Since we can't scroll past 0, simulate the camera going "past" the top by pushing the body down.
          window.scrollTo(0, 0);
          document.body.style.transform = `translateY(${-targetY}px)`;
        } else {
          window.scrollTo(0, targetY);
          document.body.style.transform = '';
        }

        if (progress < duration) {
          requestAnimationFrame(step);
        } else {
          window.scrollTo(0, 0);
          document.body.style.transform = '';
        }
      };

      requestAnimationFrame(step);
    });
  });
}

/**
 * 3. Interactive Typographic List (Cursor Reveal)
 */
function initCursorReveal() {
  const kineticList = document.querySelector('.portfolio-kinetic-list');
  const cursorImg = document.getElementById('cursor-reveal-img');
  
  if (kineticList && cursorImg) {
    const items = kineticList.querySelectorAll('.kinetic-item');
    
    // Mouse tracking over the entire list area
    kineticList.addEventListener('mousemove', (e) => {
      // Use clientX/Y for fixed positioning against the viewport
      const x = e.clientX;
      const y = e.clientY;
      cursorImg.style.left = `${x}px`;
      cursorImg.style.top = `${y}px`;
    });

    items.forEach(item => {
      item.addEventListener('mouseenter', () => {
        const imgSrc = item.getAttribute('data-image');
        if (imgSrc) {
          cursorImg.style.backgroundImage = `url(${imgSrc})`;
          cursorImg.classList.add('is-active');
        }
      });

      item.addEventListener('mouseleave', () => {
        cursorImg.classList.remove('is-active');
      });
    });
  }
}

/**
 * 4. Portfolio Lightbox Modal (Adapted for Kinetic List)
 */
function initPortfolioLightbox() {
  const kineticItems = document.querySelectorAll('.kinetic-item');
  const modal = document.getElementById('portfolio-modal');
  const modalImg = document.getElementById('modal-img');
  const modalTitle = document.getElementById('modal-title');
  const modalDesc = document.getElementById('modal-desc');
  const modalClose = document.getElementById('modal-close');
  const modalOverlay = document.getElementById('modal-overlay');

  if (modal) {
    const closeModal = () => {
      modal.classList.remove('is-open');
      modal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    };

    kineticItems.forEach(item => {
      // Use cursor pointer to indicate clickability
      item.style.cursor = 'pointer';

      // Cache child references to avoid redundant DOM queries on click
      const imgSrc = item.getAttribute('data-image');
      const titleEl = item.querySelector('.kinetic-title');
      const descEl = item.querySelector('.kinetic-desc');
      const titleText = titleEl ? titleEl.textContent : '';
      const descText = descEl ? descEl.textContent : '';

      item.addEventListener('click', () => {
        // Populate modal using cached values
        if (imgSrc) modalImg.src = imgSrc;
        modalTitle.textContent = titleText;
        if (modalDesc) {
          modalDesc.textContent = descText;
        }

        // Open modal
        modal.classList.add('is-open');
        modal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
      });
    });

    if (modalClose) modalClose.addEventListener('click', closeModal);
    if (modalOverlay) modalOverlay.addEventListener('click', closeModal);

    // Also close on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal.classList.contains('is-open')) {
        closeModal();
      }
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  initMobileNav();
  initScrollToTop();
  initCursorReveal();
  initPortfolioLightbox();
});
