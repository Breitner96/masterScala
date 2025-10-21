// Optimized lazy loading script
(function() {
  'use strict';
  
  // Check if IntersectionObserver is supported
  if (!('IntersectionObserver' in window)) {
    // Fallback for older browsers
    const images = document.querySelectorAll('img[data-src]');
    images.forEach(img => {
      img.src = img.dataset.src;
      if (img.dataset.srcset) {
        img.srcset = img.dataset.srcset;
      }
    });
    return;
  }

  // Configuration
  const config = {
    root: null,
    rootMargin: '50px 0px',
    threshold: 0.01
  };

  // Create intersection observer
  const imageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        
        // Load the image
        if (img.dataset.src) {
          img.src = img.dataset.src;
          img.classList.remove('lazy');
          img.classList.add('loaded');
        }
        
        if (img.dataset.srcset) {
          img.srcset = img.dataset.srcset;
        }
        
        // Stop observing this image
        observer.unobserve(img);
      }
    });
  }, config);

  // Initialize lazy loading for all images with data-src
  const lazyImages = document.querySelectorAll('img[data-src]');
  lazyImages.forEach(img => {
    img.classList.add('lazy');
    imageObserver.observe(img);
  });

  // Add CSS for smooth loading transition
  const style = document.createElement('style');
  style.textContent = `
    .lazy {
      opacity: 0;
      transition: opacity 0.3s ease-in-out;
    }
    .loaded {
      opacity: 1;
    }
    .placeholder-image {
      background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
      background-size: 200% 100%;
      animation: loading 1.5s infinite;
    }
    @keyframes loading {
      0% { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }
  `;
  document.head.appendChild(style);
})();
