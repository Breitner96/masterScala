// EXTREME Performance System - Carga < 3 segundos
(function() {
  'use strict';
  
  const extremePerformance = {
    metrics: {
      lcp: 0,
      fid: 0,
      cls: 0,
      fcp: 0,
      ttfb: 0,
      loadTime: 0
    },
    
    observers: [],
    loadedResources: new Set(),
    
    // EXTREME performance monitoring
    initMonitoring: function() {
      if (!('PerformanceObserver' in window)) return;
      
      // LCP Observer - Most critical
      const lcpObserver = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        const lastEntry = entries[entries.length - 1];
        this.metrics.lcp = lastEntry.startTime;
        this.logMetric('LCP', lastEntry.startTime);
        
        // If LCP is too slow, trigger emergency optimizations
        if (lastEntry.startTime > 2500) {
          this.triggerEmergencyOptimizations();
        }
      });
      lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });
      this.observers.push(lcpObserver);
      
      // FID Observer
      const fidObserver = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        entries.forEach(entry => {
          this.metrics.fid = entry.processingStart - entry.startTime;
          this.logMetric('FID', this.metrics.fid);
        });
      });
      fidObserver.observe({ type: 'first-input', buffered: true });
      this.observers.push(fidObserver);
      
      // CLS Observer
      let clsValue = 0;
      const clsObserver = new PerformanceObserver((entryList) => {
        for (const entry of entryList.getEntries()) {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
            this.metrics.cls = clsValue;
            this.logMetric('CLS', clsValue);
          }
        }
      });
      clsObserver.observe({ type: 'layout-shift', buffered: true });
      this.observers.push(clsObserver);
      
      // FCP Observer
      const fcpObserver = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        entries.forEach(entry => {
          this.metrics.fcp = entry.startTime;
          this.logMetric('FCP', entry.startTime);
        });
      });
      fcpObserver.observe({ type: 'paint', buffered: true });
      this.observers.push(fcpObserver);
    },
    
    // EXTREME resource loading with zero blocking
    loadResource: function(url, type, priority, callback) {
      if (this.loadedResources.has(url)) {
        if (callback) callback();
        return;
      }
      
      const resource = document.createElement(type === 'css' ? 'link' : 'script');
      
      if (type === 'css') {
        resource.rel = 'preload';
        resource.as = 'style';
        resource.href = url;
        resource.onload = function() {
          this.onload = null;
          this.rel = 'stylesheet';
          extremePerformance.loadedResources.add(url);
          if (callback) callback();
        };
      } else {
        resource.src = url;
        resource.async = true;
        resource.defer = true;
        resource.onload = function() {
          extremePerformance.loadedResources.add(url);
          if (callback) callback();
        };
        resource.onerror = function() {
          console.warn('Failed to load resource:', url);
        };
      }
      
      // Priority-based loading
      if (priority === 'critical') {
        document.head.insertBefore(resource, document.head.firstChild);
      } else if (priority === 'high') {
        const firstScript = document.head.querySelector('script');
        if (firstScript) {
          document.head.insertBefore(resource, firstScript);
        } else {
          document.head.appendChild(resource);
        }
      } else {
        document.head.appendChild(resource);
      }
    },
    
    // EXTREME intelligent prefetching
    intelligentPrefetch: function() {
      const viewportHeight = window.innerHeight;
      
      // Prefetch images in viewport + 100px
      const images = document.querySelectorAll('img[data-src]');
      images.forEach(img => {
        const rect = img.getBoundingClientRect();
        if (rect.top < viewportHeight + 100) {
          this.loadImage(img);
        }
      });
      
      // Prefetch critical next pages
      const links = document.querySelectorAll('a[href*="/products/"], a[href*="/collections/"]');
      links.forEach((link, index) => {
        if (index < 1) { // Only prefetch first link
          const prefetchLink = document.createElement('link');
          prefetchLink.rel = 'prefetch';
          prefetchLink.href = link.href;
          document.head.appendChild(prefetchLink);
        }
      });
    },
    
    // EXTREME image loading
    loadImage: function(img) {
      if (img.dataset.src) {
        img.src = img.dataset.src;
        img.classList.remove('lazy');
        img.classList.add('loaded');
      }
      if (img.dataset.srcset) {
        img.srcset = img.dataset.srcset;
      }
    },
    
    // EXTREME lazy loading with Intersection Observer
    initLazyLoading: function() {
      if (!('IntersectionObserver' in window)) {
        // Fallback for older browsers
        document.querySelectorAll('img[data-src]').forEach(img => {
          this.loadImage(img);
        });
        return;
      }
      
      const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            this.loadImage(entry.target);
            imageObserver.unobserve(entry.target);
          }
        });
      }, {
        rootMargin: '100px 0px',
        threshold: 0.01
      });
      
      document.querySelectorAll('img[data-src]').forEach(img => {
        imageObserver.observe(img);
      });
    },
    
    // EXTREME critical resource preloading
    preloadCritical: function() {
      const criticalResources = [
        { url: '{{ "base.css" | asset_url }}', type: 'css', priority: 'critical' },
        { url: '{{ "global.js" | asset_url }}', type: 'js', priority: 'high' }
      ];
      
      criticalResources.forEach(resource => {
        this.loadResource(resource.url, resource.type, resource.priority);
      });
    },
    
    // EXTREME non-critical resource loading
    loadNonCritical: function() {
      const nonCriticalResources = [
        { url: '{{ "component-rating.css" | asset_url }}', type: 'css', priority: 'low' },
        { url: '{{ "component-volume-pricing.css" | asset_url }}', type: 'css', priority: 'low' },
        { url: '{{ "component-accordion.css" | asset_url }}', type: 'css', priority: 'low' }
      ];
      
      // Load with significant delay to not block critical rendering
      setTimeout(() => {
        nonCriticalResources.forEach(resource => {
          this.loadResource(resource.url, resource.type, resource.priority);
        });
      }, 2000);
    },
    
    // EXTREME WebP optimization
    optimizeImages: function() {
      if (this.supportsWebP()) {
        document.querySelectorAll('img[data-webp]').forEach(img => {
          img.src = img.dataset.webp;
        });
      }
    },
    
    supportsWebP: function() {
      const canvas = document.createElement('canvas');
      return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
    },
    
    // EXTREME emergency optimizations
    triggerEmergencyOptimizations: function() {
      console.warn('EXTREME: Triggering emergency optimizations due to slow LCP');
      
      // Remove non-critical CSS
      const nonCriticalCSS = document.querySelectorAll('link[rel="stylesheet"]:not([data-critical])');
      nonCriticalCSS.forEach(link => {
        if (link.href.includes('component-') || link.href.includes('section-')) {
          link.remove();
        }
      });
      
      // Defer all non-critical scripts
      const nonCriticalScripts = document.querySelectorAll('script[src*="component-"], script[src*="section-"]');
      nonCriticalScripts.forEach(script => {
        script.defer = true;
        script.async = true;
      });
    },
    
    // EXTREME performance logging
    logMetric: function(name, value) {
      if (navigator.sendBeacon) {
        navigator.sendBeacon('/api/performance', JSON.stringify({
          name: name,
          value: value,
          url: window.location.href,
          timestamp: Date.now()
        }));
      } else {
        console.log(`EXTREME Performance - ${name}: ${value}ms`);
      }
    },
    
    // EXTREME initialization
    init: function() {
      this.initMonitoring();
      this.preloadCritical();
      this.initLazyLoading();
      this.optimizeImages();
      
      // Load non-critical resources after page is interactive
      if (document.readyState === 'complete') {
        this.loadNonCritical();
        this.intelligentPrefetch();
      } else {
        window.addEventListener('load', () => {
          setTimeout(() => {
            this.loadNonCritical();
            this.intelligentPrefetch();
          }, 1000);
        });
      }
    },
    
    // Cleanup
    destroy: function() {
      this.observers.forEach(observer => observer.disconnect());
      this.observers = [];
    }
  };
  
  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => extremePerformance.init());
  } else {
    extremePerformance.init();
  }
  
  // Expose to global scope
  window.extremePerformance = extremePerformance;
})();
