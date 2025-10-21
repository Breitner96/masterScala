// Image Optimizer for Skala Theme
class ImageOptimizer {
  constructor() {
    this.init();
  }

  init() {
    this.setupLazyLoading();
    this.optimizeExistingImages();
    this.setupIntersectionObserver();
    this.preloadCriticalImages();
  }

  // Enhanced lazy loading with better performance
  setupLazyLoading() {
    if ('IntersectionObserver' in window) {
      const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target;
            
            // Load image with fade-in effect
            this.loadImage(img).then(() => {
              img.classList.add('loaded');
              observer.unobserve(img);
            });
          }
        });
      }, {
        rootMargin: '50px 0px',
        threshold: 0.01
      });

      // Observe all lazy images
      document.querySelectorAll('img[data-src], img[loading="lazy"]').forEach(img => {
        imageObserver.observe(img);
      });
    }
  }

  // Load image with promise
  loadImage(img) {
    return new Promise((resolve, reject) => {
      if (img.dataset.src) {
        img.src = img.dataset.src;
        img.removeAttribute('data-src');
      }
      
      if (img.complete) {
        resolve();
      } else {
        img.onload = () => resolve();
        img.onerror = () => reject();
      }
    });
  }

  // Optimize existing images
  optimizeExistingImages() {
    document.querySelectorAll('img').forEach(img => {
      // Add decoding async if not present
      if (!img.decoding) {
        img.decoding = 'async';
      }

      // Add loading lazy for non-critical images
      if (!img.loading && !img.hasAttribute('fetchpriority')) {
        img.loading = 'lazy';
      }

      // Add fade-in effect
      img.style.transition = 'opacity 0.3s ease-in-out';
      img.style.opacity = '0';
      
      img.onload = () => {
        img.style.opacity = '1';
      };
    });
  }

  // Intersection Observer for animations
  setupIntersectionObserver() {
    if ('IntersectionObserver' in window) {
      const animationObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-in');
          }
        });
      }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
      });

      // Observe elements with animation classes
      document.querySelectorAll('.scroll-trigger, .animate--fade-in, .animate--slide-in').forEach(el => {
        animationObserver.observe(el);
      });
    }
  }

  // Preload critical images
  preloadCriticalImages() {
    const criticalImages = document.querySelectorAll('img[fetchpriority="high"], img[loading="eager"]');
    
    criticalImages.forEach(img => {
      if (img.complete) return;
      
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = img.src || img.dataset.src;
      document.head.appendChild(link);
    });
  }

  // Optimize image sizes based on viewport
  optimizeImageSizes() {
    const viewportWidth = window.innerWidth;
    const pixelRatio = window.devicePixelRatio || 1;
    
    document.querySelectorAll('img[srcset]').forEach(img => {
      const sizes = img.getAttribute('sizes');
      if (sizes) {
        // Update sizes based on viewport
        const optimizedSizes = this.calculateOptimalSizes(viewportWidth, pixelRatio);
        img.setAttribute('sizes', optimizedSizes);
      }
    });
  }

  // Calculate optimal sizes for images
  calculateOptimalSizes(viewportWidth, pixelRatio) {
    if (viewportWidth < 768) {
      return '100vw';
    } else if (viewportWidth < 1200) {
      return '50vw';
    } else {
      return '33vw';
    }
  }

  // WebP support detection and conversion
  setupWebPSupport() {
    const webpSupported = this.supportsWebP();
    
    if (webpSupported) {
      document.querySelectorAll('img[src*=".jpg"], img[src*=".jpeg"], img[src*=".png"]').forEach(img => {
        const webpSrc = img.src.replace(/\.(jpg|jpeg|png)$/, '.webp');
        
        // Test if WebP version exists
        this.testImageExists(webpSrc).then(exists => {
          if (exists) {
            img.src = webpSrc;
          }
        });
      });
    }
  }

  // Check WebP support
  supportsWebP() {
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
  }

  // Test if image exists
  testImageExists(url) {
    return new Promise(resolve => {
      const img = new Image();
      img.onload = () => resolve(true);
      img.onerror = () => resolve(false);
      img.src = url;
    });
  }

  // Optimize for mobile
  optimizeForMobile() {
    if (window.innerWidth < 768) {
      // Reduce image quality for mobile
      document.querySelectorAll('img').forEach(img => {
        if (img.src.includes('_')) {
          // Replace high-res images with mobile versions
          img.src = img.src.replace(/_(\d+)x/, '_375x');
        }
      });
    }
  }

  // Handle resize events
  handleResize() {
    let resizeTimeout;
    
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        this.optimizeImageSizes();
        this.optimizeForMobile();
      }, 250);
    };

    window.addEventListener('resize', handleResize, { passive: true });
  }
}

// Initialize image optimizer when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new ImageOptimizer();
  });
} else {
  new ImageOptimizer();
}
