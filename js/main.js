document.addEventListener('DOMContentLoaded', () => {
  // --- 1. Mobile Menu Drawer Toggle ---
  const menuToggle = document.querySelector('.menu-toggle');
  const mobileNav = document.querySelector('.mobile-nav');

  if (menuToggle && mobileNav) {
    menuToggle.addEventListener('click', () => {
      const isActive = menuToggle.classList.toggle('active');
      mobileNav.classList.toggle('active', isActive);
      document.body.style.overflow = isActive ? 'hidden' : '';
    });

    // Close menu when a link inside is clicked
    mobileNav.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        menuToggle.classList.remove('active');
        mobileNav.classList.remove('active');
        document.body.style.overflow = '';
      });
    });
  }

  // --- 2. Custom Scroll Snap Carousel Logic ---
  document.querySelectorAll('.carousel-wrapper').forEach(wrapper => {
    const container = wrapper.querySelector('.carousel-container');
    const prevBtn = wrapper.querySelector('.carousel-btn-prev');
    const nextBtn = wrapper.querySelector('.carousel-btn-next');

    if (container && prevBtn && nextBtn) {
      const getScrollAmount = () => {
        const firstSlide = container.querySelector('.carousel-slide');
        return firstSlide ? firstSlide.clientWidth + 24 : container.clientWidth * 0.8;
      };

      prevBtn.addEventListener('click', () => {
        container.scrollBy({ left: -getScrollAmount(), behavior: 'smooth' });
      });

      nextBtn.addEventListener('click', () => {
        container.scrollBy({ left: getScrollAmount(), behavior: 'smooth' });
      });

      // Optional: hide/show navigation buttons based on scroll position
      const toggleButtons = () => {
        const isStart = container.scrollLeft <= 5;
        const isEnd = container.scrollLeft + container.clientWidth >= container.scrollHeight - 5; // wait, scrollLeft + clientWidth >= scrollWidth - 5
        // Wait, for horizontal scroll, it is scrollWidth, not scrollHeight!
        const maxScroll = container.scrollWidth - container.clientWidth;
        prevBtn.style.opacity = isStart ? '0.3' : '1';
        prevBtn.style.pointerEvents = isStart ? 'none' : 'auto';
        nextBtn.style.opacity = container.scrollLeft >= maxScroll - 5 ? '0.3' : '1';
        nextBtn.style.pointerEvents = container.scrollLeft >= maxScroll - 5 ? 'none' : 'auto';
      };

      container.addEventListener('scroll', toggleButtons);
      // Run once on load
      setTimeout(toggleButtons, 300);
      window.addEventListener('resize', toggleButtons);
    }
  });

  // --- 3. Custom Native Lightbox Dialog System ---
  // Create and inject the dialog element if not already present
  let lightbox = document.getElementById('lightbox-dialog');
  if (!lightbox) {
    lightbox = document.createElement('dialog');
    lightbox.id = 'lightbox-dialog';
    lightbox.className = 'lightbox-dialog';
    lightbox.innerHTML = `
      <div class="lightbox-content">
        <button class="lightbox-close-btn" aria-label="Close lightbox">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <button class="lightbox-arrow lightbox-arrow-prev" aria-label="Previous image">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </button>
        <div class="lightbox-img-wrapper">
          <img src="" alt="" id="lightbox-img" />
        </div>
        <button class="lightbox-arrow lightbox-arrow-next" aria-label="Next image">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
        </button>
        <div class="lightbox-caption" id="lightbox-caption"></div>
      </div>
    `;
    document.body.appendChild(lightbox);
  }

  const lightboxImg = lightbox.querySelector('#lightbox-img');
  const lightboxCaption = lightbox.querySelector('#lightbox-caption');
  const closeBtn = lightbox.querySelector('.lightbox-close-btn');
  const prevArrow = lightbox.querySelector('.lightbox-arrow-prev');
  const nextArrow = lightbox.querySelector('.lightbox-arrow-next');

  let activeGallery = [];
  let currentIndex = -1;

  const openLightbox = (index) => {
    if (index < 0 || index >= activeGallery.length) return;
    currentIndex = index;
    const item = activeGallery[currentIndex];

    // Smooth transition between images
    lightboxImg.style.opacity = '0';
    lightboxImg.style.transform = 'scale(0.97)';
    
    setTimeout(() => {
      lightboxImg.src = item.href;
      lightboxImg.alt = item.caption;
      lightboxCaption.textContent = item.caption;
      lightboxImg.style.opacity = '1';
      lightboxImg.style.transform = 'scale(1)';
    }, 150);

    if (!lightbox.open) {
      lightbox.showModal();
      document.body.style.overflow = 'hidden';
    }
  };

  const closeLightbox = () => {
    lightbox.close();
    document.body.style.overflow = '';
  };

  const showNext = () => {
    if (activeGallery.length <= 1) return;
    const nextIndex = (currentIndex + 1) % activeGallery.length;
    openLightbox(nextIndex);
  };

  const showPrev = () => {
    if (activeGallery.length <= 1) return;
    const prevIndex = (currentIndex - 1 + activeGallery.length) % activeGallery.length;
    openLightbox(prevIndex);
  };

  // Attach gallery item event listeners
  const initGalleries = () => {
    const galleryLinks = Array.from(document.querySelectorAll('a[data-fancybox]'));
    
    // Group links by their gallery attribute
    const galleries = {};
    galleryLinks.forEach(link => {
      const groupName = link.getAttribute('data-fancybox') || 'default';
      if (!galleries[groupName]) {
        galleries[groupName] = [];
      }
      galleries[groupName].push(link);
    });

    // Setup click handlers
    Object.keys(galleries).forEach(groupName => {
      const items = galleries[groupName];
      items.forEach((link, idx) => {
        link.addEventListener('click', (e) => {
          e.preventDefault();
          // Build structure for active gallery items
          activeGallery = items.map(el => ({
            href: el.getAttribute('href'),
            caption: el.getAttribute('data-caption') || el.getAttribute('title') || ''
          }));
          openLightbox(idx);
        });
      });
    });
  };

  initGalleries();

  // Lightbox navigation event listeners
  closeBtn.addEventListener('click', closeLightbox);
  prevArrow.addEventListener('click', showPrev);
  nextArrow.addEventListener('click', showNext);

  // Close lightbox on clicking backdrop
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox || e.target.classList.contains('lightbox-content')) {
      closeLightbox();
    }
  });

  // Keyboard navigation
  document.addEventListener('keydown', (e) => {
    if (!lightbox.open) return;
    if (e.key === 'ArrowRight') showNext();
    else if (e.key === 'ArrowLeft') showPrev();
    else if (e.key === 'Escape') closeLightbox();
  });

  // Simple touch swipe support for lightbox mobile
  let touchStartX = 0;
  let touchEndX = 0;

  lightbox.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
  }, { passive: true });

  lightbox.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
  }, { passive: true });

  const handleSwipe = () => {
    const swipeThreshold = 50;
    if (touchStartX - touchEndX > swipeThreshold) {
      showNext(); // swipe left, show next
    } else if (touchEndX - touchStartX > swipeThreshold) {
      showPrev(); // swipe right, show prev
    }
  };

  // --- 4. Lightweight Scroll Reveal Observer (AOS Replacement) ---
  const revealElements = document.querySelectorAll('[data-reveal]');
  if ('IntersectionObserver' in window && revealElements.length > 0) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          // Once animated, we don't need to observe it anymore
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.12,
      rootMargin: '0px 0px -50px 0px'
    });

    revealElements.forEach(el => revealObserver.observe(el));
  } else {
    // Fallback if IntersectionObserver is not supported
    revealElements.forEach(el => el.classList.add('visible'));
  }
});