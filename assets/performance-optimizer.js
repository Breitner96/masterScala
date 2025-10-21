// Performance Optimizer for Skala Theme
class PerformanceOptimizer {
  constructor() {
    this.init();
  }

  init() {
    // Skip image optimization as it's handled by image-optimizer.js
    this.setupResourceHints();
    this.setupCriticalResourcePreloading();
    this.setupIntersectionObserver();
    this.setupPerformanceMonitoring();
    this.optimizeScrollPerformance();
    this.optimizeResizePerformance();
  }

  // Resource hints for better performance
  setupResourceHints() {
    // Preconnect to external domains
    const externalDomains = [
      'https://fonts.shopifycdn.com',
      'https://connect.facebook.net',
      'https://www.google-analytics.com'
    ];

    externalDomains.forEach(domain => {
      const link = document.createElement('link');
      link.rel = 'preconnect';
      link.href = domain;
      link.crossOrigin = 'anonymous';
      document.head.appendChild(link);
    });

    // DNS prefetch for external resources
    const dnsPrefetchDomains = [
      'https://cdn.shopify.com',
      'https://monorail-edge.shopifysvc.com'
    ];

    dnsPrefetchDomains.forEach(domain => {
      const link = document.createElement('link');
      link.rel = 'dns-prefetch';
      link.href = domain;
      document.head.appendChild(link);
    });
  }

  // Preload critical resources
  setupCriticalResourcePreloading() {
    const criticalResources = [
      { href: '/assets/base.css', as: 'style' },
      { href: '/assets/constants.js', as: 'script' },
      { href: '/assets/pubsub.js', as: 'script' }
    ];

    criticalResources.forEach(resource => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = resource.href;
      link.as = resource.as;
      document.head.appendChild(link);
    });
  }

  // Intersection Observer for animations and lazy loading
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

  // Performance monitoring
  setupPerformanceMonitoring() {
    // Monitor Core Web Vitals
    if ('PerformanceObserver' in window) {
      // LCP monitoring
      new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        console.log('LCP:', lastEntry.startTime);
      }).observe({ entryTypes: ['largest-contentful-paint'] });

      // FID monitoring
      new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach(entry => {
          console.log('FID:', entry.processingStart - entry.startTime);
        });
      }).observe({ entryTypes: ['first-input'] });

      // CLS monitoring
      new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach(entry => {
          if (!entry.hadRecentInput) {
            console.log('CLS:', entry.value);
          }
        });
      }).observe({ entryTypes: ['layout-shift'] });
    }

    // Monitor page load performance
    window.addEventListener('load', () => {
      setTimeout(() => {
        const perfData = performance.getEntriesByType('navigation')[0];
        console.log('Page Load Time:', perfData.loadEventEnd - perfData.loadEventStart);
        console.log('DOM Content Loaded:', perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart);
      }, 0);
    });
  }

  // Optimize scroll performance
  optimizeScrollPerformance() {
    let ticking = false;
    
    const updateScrollPosition = () => {
      // Throttled scroll handling
      ticking = false;
    };

    const requestTick = () => {
      if (!ticking) {
        requestAnimationFrame(updateScrollPosition);
        ticking = true;
      }
    };

    window.addEventListener('scroll', requestTick, { passive: true });
  }

  // Optimize resize performance
  optimizeResizePerformance() {
    let resizeTimeout;
    
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        // Throttled resize handling
        document.documentElement.style.setProperty('--viewport-height', `${window.innerHeight}px`);
      }, 250);
    };

    window.addEventListener('resize', handleResize, { passive: true });
  }

  // Preload critical fonts
  preloadCriticalFonts() {
    const criticalFonts = [
      '/assets/fonts/archivo-regular.woff2',
      '/assets/fonts/archivo-bold.woff2'
    ];

    criticalFonts.forEach(font => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = font;
      link.as = 'font';
      link.type = 'font/woff2';
      link.crossOrigin = 'anonymous';
      document.head.appendChild(link);
    });
  }

  // Optimize third-party scripts
  optimizeThirdPartyScripts() {
    // Defer non-critical third-party scripts
    const thirdPartyScripts = [
      'https://connect.facebook.net/en_US/fbevents.js',
      'https://www.google-analytics.com/analytics.js'
    ];

    thirdPartyScripts.forEach(src => {
      const script = document.createElement('script');
      script.src = src;
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    });
  }
}

// Initialize performance optimizer when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new PerformanceOptimizer();
  });
} else {
  new PerformanceOptimizer();
}

// Service Worker registration
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/assets/sw.js')
      .then(registration => {
        console.log('SW registered: ', registration);
      })
      .catch(registrationError => {
        console.log('SW registration failed: ', registrationError);
      });
  });
}
