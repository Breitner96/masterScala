// Unified Image Optimizer for Skala Theme
class ImageOptimizer {
  constructor() {
    this.initialized = false;
    this.imageObserver = null;
    this.animationObserver = null;
    this.init();
  }

  init() {
    if (this.initialized) return;
    this.initialized = true;
    
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.setupOptimizations());
    } else {
      this.setupOptimizations();
    }
  }

  setupOptimizations() {
    this.setupLazyLoading();
    this.optimizeExistingImages();
    this.setupIntersectionObserver();
    this.preloadCriticalImages();
    this.setupWebPSupport();
    this.handleResize();
  }

  // Enhanced lazy loading with better performance
  setupLazyLoading() {
    if (!('IntersectionObserver' in window)) return;

    this.imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          this.loadImage(img).then(() => {
            img.classList.add('loaded');
            observer.unobserve(img);
          }).catch(() => {
            // Handle error gracefully
            img.classList.add('error');
            observer.unobserve(img);
          });
        }
      });
    }, {
      rootMargin: '50px 0px',
      threshold: 0.01
    });

    // Observe all lazy images
    this.observeLazyImages();
  }

  observeLazyImages() {
    const lazyImages = document.querySelectorAll('img[data-src], img[loading="lazy"]:not(.loaded)');
    lazyImages.forEach(img => {
      if (this.imageObserver) {
        this.imageObserver.observe(img);
      }
    });
  }

  // Load image with promise and better error handling
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
        img.onerror = () => reject(new Error('Failed to load image'));
      }
    });
  }

  // Optimize existing images without aggressive opacity changes
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

      // Only add fade-in effect for images that are not already loaded
      if (!img.complete && !img.classList.contains('loaded')) {
        img.style.transition = 'opacity 0.3s ease-in-out';
        img.style.opacity = '0.8'; // Start with slight transparency instead of 0
        
        img.onload = () => {
          img.style.opacity = '1';
          img.classList.add('loaded');
        };
      }
    });
  }

  // Intersection Observer for animations
  setupIntersectionObserver() {
    if (!('IntersectionObserver' in window)) return;

    this.animationObserver = new IntersectionObserver((entries) => {
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
      this.animationObserver.observe(el);
    });
  }

  // Preload critical images
  preloadCriticalImages() {
    const criticalImages = document.querySelectorAll('img[fetchpriority="high"], img[loading="eager"]');
    
    criticalImages.forEach(img => {
      if (img.complete) return;
      
      const imageUrl = img.src || img.dataset.src;
      if (!imageUrl) return;
      
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = imageUrl;
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
        // Re-observe lazy images after resize
        this.observeLazyImages();
      }, 250);
    };

    window.addEventListener('resize', handleResize, { passive: true });
  }

  // Cleanup method
  destroy() {
    if (this.imageObserver) {
      this.imageObserver.disconnect();
    }
    if (this.animationObserver) {
      this.animationObserver.disconnect();
    }
  }
}

// Initialize image optimizer
let imageOptimizerInstance = null;

function initializeImageOptimizer() {
  if (!imageOptimizerInstance) {
    imageOptimizerInstance = new ImageOptimizer();
  }
  return imageOptimizerInstance;
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeImageOptimizer);
} else {
  initializeImageOptimizer();
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ImageOptimizer;
}
