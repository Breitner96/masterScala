// LCP (Largest Contentful Paint) Optimizer for Skala Theme
class LCPOptimizer {
  constructor() {
    this.init();
  }

  init() {
    this.optimizeCriticalResources();
    this.setupLCPMonitoring();
    this.optimizeImageLoading();
  }

  // Optimize critical resources for LCP
  optimizeCriticalResources() {
    // Preload critical fonts
    this.preloadCriticalFonts();
    
    // Preload critical CSS
    this.preloadCriticalCSS();
    
    // Optimize critical images
    this.optimizeCriticalImages();
  }

  // Preload critical fonts
  preloadCriticalFonts() {
    const criticalFonts = [
      '{{ settings.type_header_font | font_url }}',
      '{{ settings.type_body_font | font_url }}'
    ];

    criticalFonts.forEach(fontUrl => {
      if (fontUrl && !fontUrl.includes('undefined')) {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.href = fontUrl;
        link.as = 'font';
        link.type = 'font/woff2';
        link.crossOrigin = 'anonymous';
        link.fetchPriority = 'high';
        document.head.appendChild(link);
      }
    });
  }

  // Preload critical CSS
  preloadCriticalCSS() {
    const criticalCSS = [
      '{{ "base.css" | asset_url }}',
      '{{ "section-image-banner.css" | asset_url }}',
      '{{ "component-image-loading.css" | asset_url }}'
    ];

    criticalCSS.forEach(cssUrl => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = cssUrl;
      link.as = 'style';
      link.fetchPriority = 'high';
      link.onload = function() {
        this.rel = 'stylesheet';
      };
      document.head.appendChild(link);
    });
  }

  // Optimize critical images
  optimizeCriticalImages() {
    // Find LCP candidate images
    const lcpCandidates = document.querySelectorAll('img[fetchpriority="high"], .banner img, .slideshow img:first-child');
    
    lcpCandidates.forEach(img => {
      // Ensure proper attributes for LCP
      if (!img.fetchpriority) {
        img.fetchPriority = 'high';
      }
      if (!img.loading || img.loading !== 'eager') {
        img.loading = 'eager';
      }
      if (img.decoding !== 'sync') {
        img.decoding = 'sync';
      }
      
      // Preload the image
      this.preloadImage(img);
    });
  }

  // Preload individual image
  preloadImage(img) {
    const imageUrl = img.src || img.dataset.src;
    if (!imageUrl || img.complete) return;

    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = imageUrl;
    link.fetchPriority = 'high';
    
    // Add responsive media query
    if (img.sizes) {
      const sizes = img.getAttribute('sizes');
      if (sizes && sizes.includes('max-width')) {
        link.media = '(max-width: 749px)';
      }
    }
    
    document.head.appendChild(link);
  }

  // Setup LCP monitoring
  setupLCPMonitoring() {
    if ('PerformanceObserver' in window) {
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        
        console.log('LCP Element:', lastEntry.element);
        console.log('LCP Time:', lastEntry.startTime);
        console.log('LCP Size:', lastEntry.size);
        
        // Log LCP element details for debugging
        if (lastEntry.element) {
          console.log('LCP Element Tag:', lastEntry.element.tagName);
          console.log('LCP Element Class:', lastEntry.element.className);
          console.log('LCP Element Src:', lastEntry.element.src);
        }
      });

      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
    }
  }

  // Optimize image loading for better LCP
  optimizeImageLoading() {
    // Remove any blocking CSS that might delay LCP
    const blockingStyles = document.querySelectorAll('link[rel="stylesheet"]:not([media])');
    blockingStyles.forEach(link => {
      if (!link.href.includes('base.css') && !link.href.includes('banner')) {
        link.media = 'print';
        link.onload = function() {
          this.media = 'all';
        };
      }
    });

    // Optimize critical images further
    const criticalImages = document.querySelectorAll('img[fetchpriority="high"]');
    criticalImages.forEach(img => {
      // Ensure image is loaded as soon as possible
      if (img.dataset.src) {
        img.src = img.dataset.src;
        img.removeAttribute('data-src');
      }
      
      // Add immediate loading class
      img.classList.add('lcp-critical');
    });
  }

  // Get LCP score
  getLCPScore() {
    return new Promise((resolve) => {
      if ('PerformanceObserver' in window) {
        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          resolve(lastEntry.startTime);
        });
        observer.observe({ entryTypes: ['largest-contentful-paint'] });
      } else {
        resolve(null);
      }
    });
  }
}

// Initialize LCP optimizer immediately
const lcpOptimizer = new LCPOptimizer();

// Export for debugging
window.LCPOptimizer = lcpOptimizer;
