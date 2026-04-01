document.addEventListener('DOMContentLoaded', () => {

  // 1. Mobile Navigation Toggle
  const navToggle = document.getElementById('nav-toggle');
  const navLinks = document.getElementById('nav-links');

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

      // Custom Elastic Ease Out Back
      const easeOutBack = (t) => {
        const c1 = 3.0; // High overshoot multiplier for a solid bump
        const c3 = c1 + 1;
        return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
      };

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
          document.body.style.transform = `translateY(0px)`;
        }

        if (progress < duration) {
          requestAnimationFrame(step);
        } else {
          window.scrollTo(0, 0);
          document.body.style.transform = 'translateY(0px)';
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

});
