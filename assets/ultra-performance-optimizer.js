// Ultra Performance Optimizer for Skala Theme
// Optimized for maximum Core Web Vitals performance

class UltraPerformanceOptimizer {
  constructor() {
    this.init();
  }

  init() {
    // Only run after page load to avoid blocking
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.optimize());
    } else {
      this.optimize();
    }
  }

  optimize() {
    this.optimizeImages();
    this.optimizeCSS();
    this.optimizeJavaScript();
    this.optimizeFonts();
    this.setupPerformanceMonitoring();
  }

  // Optimize images for better LCP and CLS
  optimizeImages() {
    // Critical images optimization
    const criticalImages = document.querySelectorAll('img[fetchpriority="high"]');
    criticalImages.forEach(img => {
      // Ensure proper loading attributes
      if (!img.loading) img.loading = 'eager';
      if (!img.decoding) img.decoding = 'sync';
      if (!img.fetchPriority) img.fetchPriority = 'high';
      
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
      }, { rootMargin: '50px 0px' });

      lazyImages.forEach(img => imageObserver.observe(img));
    }
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
    document.head.appendChild(link);
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
    const criticalCSS = ['base.css', 'banner', 'image-banner'];
    return criticalCSS.some(css => href.includes(css));
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

    // Optimize event listeners
    this.optimizeEventListeners();
  }

  // Check if script is critical
  isCriticalScript(src) {
    const criticalScripts = ['constants.js', 'pubsub.js', 'lcp-optimizer.js'];
    return criticalScripts.some(script => src.includes(script));
  }

  // Optimize event listeners for better performance
  optimizeEventListeners() {
    // Use passive event listeners where possible
    const events = ['scroll', 'touchstart', 'touchmove', 'wheel'];
    events.forEach(eventType => {
      document.addEventListener(eventType, () => {}, { passive: true });
    });
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

  // Setup comprehensive performance monitoring
  setupPerformanceMonitoring() {
    if ('PerformanceObserver' in window) {
      // Monitor LCP
      new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        console.log('LCP:', lastEntry.startTime, 'ms');
      }).observe({ entryTypes: ['largest-contentful-paint'] });

      // Monitor FCP
      new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach(entry => {
          console.log('FCP:', entry.startTime, 'ms');
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
        console.log('CLS:', clsValue);
      }).observe({ entryTypes: ['layout-shift'] });

      // Monitor TBT
      new PerformanceObserver((list) => {
        let totalBlockingTime = 0;
        list.getEntries().forEach(entry => {
          if (entry.duration > 50) {
            totalBlockingTime += entry.duration - 50;
          }
        });
        console.log('TBT:', totalBlockingTime, 'ms');
      }).observe({ entryTypes: ['longtask'] });
    }

    // Monitor page load performance
    window.addEventListener('load', () => {
      setTimeout(() => {
        const perfData = performance.getEntriesByType('navigation')[0];
        console.log('Page Load Time:', perfData.loadEventEnd - perfData.loadEventStart, 'ms');
        console.log('DOM Content Loaded:', perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart, 'ms');
        console.log('First Byte:', perfData.responseStart - perfData.requestStart, 'ms');
      }, 0);
    });
  }

  // Get performance metrics
  getPerformanceMetrics() {
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

// Initialize ultra performance optimizer
const ultraPerfOptimizer = new UltraPerformanceOptimizer();

// Export for debugging
window.UltraPerformanceOptimizer = ultraPerfOptimizer;
