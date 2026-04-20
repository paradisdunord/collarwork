document.addEventListener('DOMContentLoaded', () => {

  // 1. Mobile Navigation Toggle
  const navToggle = document.getElementById('nav-toggle');
  const navLinks = document.getElementById('nav-links');
  const navLinkItems = document.querySelectorAll('.nav-link');

  if (navToggle && navLinks) {
    navToggle.addEventListener('click', () => {
      navLinks.style.display = navLinks.style.display === 'flex' ? 'none' : 'flex';
      navLinks.style.flexDirection = 'column';
      navLinks.style.position = 'absolute';
      navLinks.style.top = '80px';
      navLinks.style.left = '0';
      navLinks.style.width = '100%';
      navLinks.style.background = '#fafafa';
      navLinks.style.padding = '2rem';
      navLinks.style.borderBottom = '1px solid var(--border-color)';
    });

    // Close mobile menu when a nav link is clicked
    navLinkItems.forEach(link => {
      link.addEventListener('click', () => {
        if (window.innerWidth <= 768) {
          navLinks.removeAttribute('style');
        }
      });
    });
  }

  // Removed cheesy scroll-reveal effects. Collarwork is rugged and static.

  // 2. Hyper-Fast Scroll to Top with Elastic Bump (Logo click)
  const navLogos = document.querySelectorAll('.nav-logo');
  navLogos.forEach(logo => {
    logo.addEventListener('click', (e) => {
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

  // 3. Cinematic Hover Drift for Portfolio Track
  const track = document.querySelector('.portfolio-horizontal');
  let driftAnimationId;
  let isDrifting = false;
  let scrollAcc = 0; // Accumulator for fractional pixels

  if (track) {
    const driftStep = () => {
      if (!isDrifting) {
        track.style.scrollSnapType = 'x mandatory'; 
        return;
      }
      
      scrollAcc += 0.5; // Very slow drift
      if (scrollAcc >= 1) {
        track.scrollLeft += Math.floor(scrollAcc);
        scrollAcc -= Math.floor(scrollAcc);
      }
      
      driftAnimationId = requestAnimationFrame(driftStep);
    };

    track.addEventListener('mouseenter', () => {
      if (isDrifting) return;
      isDrifting = true;
      track.style.scrollSnapType = 'none'; 
      scrollAcc = 0; 
      driftAnimationId = requestAnimationFrame(driftStep);
    });

    track.addEventListener('mouseleave', () => {
      isDrifting = false;
      cancelAnimationFrame(driftAnimationId);
    });
  }

  // 4. Manual Slider Navigation
  const btnPrev = document.querySelector('.slider-prev');
  const btnNext = document.querySelector('.slider-next');

  if (track && btnPrev && btnNext) {
    const scrollAmount = () => {
      const card = track.firstElementChild;
      return card ? card.offsetWidth + 24 : 400; // card width + 1.5rem gap (24px)
    };

    btnPrev.addEventListener('click', () => {
      track.scrollBy({ left: -scrollAmount(), behavior: 'smooth' });
    });

    btnNext.addEventListener('click', () => {
      track.scrollBy({ left: scrollAmount(), behavior: 'smooth' });
    });
  }

  // 5. Portfolio Lightbox Modal
  const portfolioCards = document.querySelectorAll('.portfolio-card');
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

    portfolioCards.forEach(card => {
      // Use cursor pointer to indicate clickability
      card.style.cursor = 'pointer';
      
      card.addEventListener('click', (e) => {
        // Find elements inside the card
        const img = card.querySelector('.portfolio-card-img');
        const title = card.querySelector('.portfolio-card-title');
        const desc = card.querySelector('.portfolio-overlay-content p');

        // Populate modal
        if (img) modalImg.src = img.src;
        if (title) modalTitle.textContent = title.textContent;
        if (desc) modalDesc.textContent = desc.textContent;

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

});
