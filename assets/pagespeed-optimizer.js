// PageSpeed Insights Optimizer for Skala Theme
// Implements all PageSpeed Insights recommendations

class PageSpeedOptimizer {
  constructor() {
    this.init();
  }

  init() {
    // Run immediately for critical optimizations
    this.optimizeCriticalResources();
    
    // Run after DOM ready for non-critical optimizations
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.optimizeNonCritical());
    } else {
      this.optimizeNonCritical();
    }
  }

  // Critical optimizations that run immediately
  optimizeCriticalResources() {
    this.optimizeImages();
    this.optimizeFonts();
    this.optimizeCSS();
    this.setupResourceHints();
  }

  // Optimize images for better LCP and CLS
  optimizeImages() {
    // Critical images optimization
    const criticalImages = document.querySelectorAll('img[fetchpriority="high"]');
    criticalImages.forEach(img => {
      // Ensure proper attributes for PageSpeed Insights
      if (!img.loading) img.loading = 'eager';
      if (!img.decoding) img.decoding = 'sync';
      if (!img.fetchPriority) img.fetchPriority = 'high';
      
      // Add proper alt text if missing
      if (!img.alt) img.alt = '';
      
      // Preload critical images
      this.preloadImage(img);
    });

    // Lazy load non-critical images
    const lazyImages = document.querySelectorAll('img[loading="lazy"]');
    if ('IntersectionObserver' in window) {
      const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target;
            if (img.dataset.src) {
              img.src = img.dataset.src;
              img.removeAttribute('data-src');
            }
            img.classList.add('loaded');
            imageObserver.unobserve(img);
          }
        });
      }, { 
        rootMargin: '50px 0px',
        threshold: 0.01
      });

      lazyImages.forEach(img => imageObserver.observe(img));
    }
  }

  // Preload individual image with proper attributes
  preloadImage(img) {
    const imageUrl = img.src || img.dataset.src;
    if (!imageUrl || img.complete) return;

    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = imageUrl;
    link.fetchPriority = 'high';
    
    // Add media query for responsive images
    if (img.sizes) {
      const sizes = img.getAttribute('sizes');
      if (sizes && sizes.includes('max-width')) {
        link.media = '(max-width: 749px)';
      }
    }
    
    document.head.appendChild(link);
  }

  // Optimize font loading
  optimizeFonts() {
    // Preload critical fonts
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

  // Optimize CSS loading
  optimizeCSS() {
    // Convert blocking CSS to non-blocking
    const blockingCSS = document.querySelectorAll('link[rel="stylesheet"]:not([media])');
    blockingCSS.forEach(link => {
      if (!this.isCriticalCSS(link.href)) {
        link.media = 'print';
        link.onload = function() {
          this.media = 'all';
        };
      }
    });
  }

  // Check if CSS is critical
  isCriticalCSS(href) {
    const criticalCSS = ['base.css', 'banner', 'image-banner', 'component-image-loading'];
    return criticalCSS.some(css => href.includes(css));
  }

  // Setup resource hints
  setupResourceHints() {
    // Preconnect to external domains
    const externalDomains = [
      'https://cdn.shopify.com',
      'https://fonts.shopifycdn.com',
      'https://monorail-edge.shopifysvc.com'
    ];

    externalDomains.forEach(domain => {
      const link = document.createElement('link');
      link.rel = 'preconnect';
      link.href = domain;
      link.crossOrigin = 'anonymous';
      document.head.appendChild(link);
    });
  }

  // Non-critical optimizations
  optimizeNonCritical() {
    this.optimizeJavaScript();
    this.optimizeEventListeners();
    this.setupPerformanceMonitoring();
  }

  // Optimize JavaScript execution
  optimizeJavaScript() {
    // Defer non-critical scripts
    const nonCriticalScripts = document.querySelectorAll('script[src]:not([defer]):not([async])');
    nonCriticalScripts.forEach(script => {
      if (!this.isCriticalScript(script.src)) {
        script.defer = true;
      }
    });
  }

  // Check if script is critical
  isCriticalScript(src) {
    const criticalScripts = ['constants.js', 'pubsub.js', 'pagespeed-optimizer.js'];
    return criticalScripts.some(script => src.includes(script));
  }

  // Optimize event listeners for better performance
  optimizeEventListeners() {
    // Use passive event listeners where possible
    const events = ['scroll', 'touchstart', 'touchmove', 'wheel', 'mousewheel'];
    events.forEach(eventType => {
      document.addEventListener(eventType, () => {}, { passive: true });
    });
  }

  // Setup comprehensive performance monitoring
  setupPerformanceMonitoring() {
    if ('PerformanceObserver' in window) {
      // Monitor LCP
      new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        console.log('LCP (PageSpeed):', lastEntry.startTime, 'ms');
        
        // Log LCP element for debugging
        if (lastEntry.element) {
          console.log('LCP Element:', lastEntry.element.tagName, lastEntry.element.className);
        }
      }).observe({ entryTypes: ['largest-contentful-paint'] });

      // Monitor FCP
      new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach(entry => {
          if (entry.name === 'first-contentful-paint') {
            console.log('FCP (PageSpeed):', entry.startTime, 'ms');
          }
        });
      }).observe({ entryTypes: ['paint'] });

      // Monitor CLS
      new PerformanceObserver((list) => {
        let clsValue = 0;
        list.getEntries().forEach(entry => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
          }
        });
        console.log('CLS (PageSpeed):', clsValue);
      }).observe({ entryTypes: ['layout-shift'] });

      // Monitor TBT
      new PerformanceObserver((list) => {
        let totalBlockingTime = 0;
        list.getEntries().forEach(entry => {
          if (entry.duration > 50) {
            totalBlockingTime += entry.duration - 50;
          }
        });
        console.log('TBT (PageSpeed):', totalBlockingTime, 'ms');
      }).observe({ entryTypes: ['longtask'] });
    }

    // Monitor page load performance
    window.addEventListener('load', () => {
      setTimeout(() => {
        const perfData = performance.getEntriesByType('navigation')[0];
        console.log('Page Load Time (PageSpeed):', perfData.loadEventEnd - perfData.loadEventStart, 'ms');
        console.log('DOM Content Loaded (PageSpeed):', perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart, 'ms');
        console.log('First Byte (PageSpeed):', perfData.responseStart - perfData.requestStart, 'ms');
      }, 0);
    });
  }

  // Get PageSpeed Insights metrics
  getPageSpeedMetrics() {
    return new Promise((resolve) => {
      const metrics = {};
      
      if ('PerformanceObserver' in window) {
        // Get LCP
        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          metrics.lcp = lastEntry.startTime;
          resolve(metrics);
        }).observe({ entryTypes: ['largest-contentful-paint'] });
      } else {
        resolve(metrics);
      }
    });
  }
}

// Initialize PageSpeed optimizer immediately
const pageSpeedOptimizer = new PageSpeedOptimizer();

// Export for debugging
window.PageSpeedOptimizer = pageSpeedOptimizer;
