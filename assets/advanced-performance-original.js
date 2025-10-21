// Advanced Performance Optimizations
(function() {
  'use strict';
  
  // Performance monitoring
  const performanceMonitor = {
    metrics: {},
    
    mark: function(name) {
      if (performance.mark) {
        performance.mark(name);
      }
    },
    
    measure: function(name, startMark, endMark) {
      if (performance.measure) {
        try {
          performance.measure(name, startMark, endMark);
        } catch (e) {
          console.warn('Performance measure failed:', e);
        }
      }
    },
    
    getMetrics: function() {
      return this.metrics;
    }
  };
  
  // Resource hints optimization
  const resourceHints = {
    preloadCritical: function() {
      const criticalResources = [
        '{{ "base.css" | asset_url }}',
        '{{ "global.js" | asset_url }}'
      ];
      
      criticalResources.forEach(function(href) {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.href = href;
        link.as = href.includes('.css') ? 'style' : 'script';
        document.head.appendChild(link);
      });
    },
    
    prefetchNextPage: function() {
      // Prefetch likely next pages
      const nextPageLinks = document.querySelectorAll('a[href*="/products/"], a[href*="/collections/"]');
      nextPageLinks.forEach(function(link, index) {
        if (index < 3) { // Only prefetch first 3 links
          const prefetchLink = document.createElement('link');
          prefetchLink.rel = 'prefetch';
          prefetchLink.href = link.href;
          document.head.appendChild(prefetchLink);
        }
      });
    }
  };
  
  // Image optimization
  const imageOptimizer = {
    init: function() {
      this.lazyLoadImages();
      this.optimizeImageFormats();
    },
    
    lazyLoadImages: function() {
      if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver(function(entries) {
          entries.forEach(function(entry) {
            if (entry.isIntersecting) {
              const img = entry.target;
              if (img.dataset.src) {
                img.src = img.dataset.src;
                img.classList.remove('lazy');
                img.classList.add('loaded');
              }
              imageObserver.unobserve(img);
            }
          });
        }, {
          rootMargin: '50px 0px',
          threshold: 0.01
        });
        
        document.querySelectorAll('img[data-src]').forEach(function(img) {
          imageObserver.observe(img);
        });
      }
    },
    
    optimizeImageFormats: function() {
      // Check for WebP support and update image sources
      if (this.supportsWebP()) {
        document.querySelectorAll('img[data-webp]').forEach(function(img) {
          img.src = img.dataset.webp;
        });
      }
    },
    
    supportsWebP: function() {
      const canvas = document.createElement('canvas');
      return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
    }
  };
  
  // Script optimization
  const scriptOptimizer = {
    loadScript: function(src, callback, errorCallback) {
      const script = document.createElement('script');
      script.src = src;
      script.async = true;
      script.defer = true;
      
      script.onload = callback || function() {};
      script.onerror = errorCallback || function() {
        console.warn('Failed to load script:', src);
      };
      
      document.head.appendChild(script);
    },
    
    loadConditionalScripts: function() {
      // Load scripts based on page type
      const pageType = document.body.dataset.pageType;
      
      if (pageType === 'product') {
        this.loadScript('{{ "product-form.js" | asset_url }}');
        this.loadScript('{{ "product-info.js" | asset_url }}');
      }
      
      if (pageType === 'collection') {
        this.loadScript('{{ "facets.js" | asset_url }}');
      }
    }
  };
  
  // CSS optimization
  const cssOptimizer = {
    loadNonCriticalCSS: function() {
      const nonCriticalCSS = [
        '{{ "component-rating.css" | asset_url }}',
        '{{ "component-volume-pricing.css" | asset_url }}',
        '{{ "component-accordion.css" | asset_url }}'
      ];
      
      nonCriticalCSS.forEach(function(href) {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.href = href;
        link.as = 'style';
        link.onload = function() {
          this.onload = null;
          this.rel = 'stylesheet';
        };
        document.head.appendChild(link);
      });
    }
  };
  
  // Initialize optimizations
  function init() {
    performanceMonitor.mark('performance-init-start');
    
    // Initialize image optimization
    imageOptimizer.init();
    
    // Load non-critical CSS
    cssOptimizer.loadNonCriticalCSS();
    
    // Load conditional scripts
    scriptOptimizer.loadConditionalScripts();
    
    // Prefetch next page resources
    resourceHints.prefetchNextPage();
    
    performanceMonitor.mark('performance-init-end');
    performanceMonitor.measure('performance-init', 'performance-init-start', 'performance-init-end');
  }
  
  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
  
  // Expose to global scope for debugging
  window.performanceOptimizer = {
    monitor: performanceMonitor,
    images: imageOptimizer,
    scripts: scriptOptimizer,
    css: cssOptimizer
  };
})();
