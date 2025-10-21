// EXTREME Preload System - Carga < 3 segundos
(function() {
  'use strict';
  
  const extremePreload = {
    preloadedResources: new Set(),
    criticalResources: [
      '{{ "base.css" | asset_url }}',
      '{{ "global.js" | asset_url }}',
      '{{ "lazy-loading.js" | asset_url }}',
      '{{ "extreme-performance.js" | asset_url }}'
    ],
    
    // EXTREME preload critical resources
    preloadCritical: function() {
      this.criticalResources.forEach(resource => {
        this.preloadResource(resource, this.getResourceType(resource));
      });
    },
    
    // EXTREME preload resource
    preloadResource: function(url, type) {
      if (this.preloadedResources.has(url)) return;
      
      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = url;
      link.as = type;
      link.crossOrigin = 'anonymous';
      
      link.onload = () => {
        this.preloadedResources.add(url);
      };
      
      link.onerror = () => {
        console.warn('Failed to preload:', url);
      };
      
      document.head.appendChild(link);
    },
    
    // Get resource type
    getResourceType: function(url) {
      if (url.includes('.css')) return 'style';
      if (url.includes('.js')) return 'script';
      if (url.includes('.woff2')) return 'font';
      if (url.includes('.jpg') || url.includes('.jpeg') || url.includes('.png') || url.includes('.webp')) return 'image';
      return 'fetch';
    },
    
    // EXTREME prefetch next pages
    prefetchNextPages: function() {
      const links = document.querySelectorAll('a[href*="/products/"], a[href*="/collections/"], a[href*="/pages/"]');
      links.forEach((link, index) => {
        if (index < 2) { // Only prefetch first 2 links
          this.prefetchPage(link.href);
        }
      });
    },
    
    // EXTREME prefetch page
    prefetchPage: function(url) {
      if (this.preloadedResources.has(url)) return;
      
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = url;
      
      link.onload = () => {
        this.preloadedResources.add(url);
      };
      
      document.head.appendChild(link);
    },
    
    // EXTREME preload images
    preloadImages: function() {
      const images = document.querySelectorAll('img[data-src]');
      images.forEach((img, index) => {
        if (index < 3) { // Only preload first 3 images
          this.preloadResource(img.dataset.src, 'image');
        }
      });
    },
    
    // EXTREME preload fonts
    preloadFonts: function() {
      const fontUrls = [
        '{{ settings.type_header_font | font_url }}',
        '{{ settings.type_body_font | font_url }}'
      ];
      
      fontUrls.forEach(url => {
        if (url && !url.includes('system')) {
          this.preloadResource(url, 'font');
        }
      });
    },
    
    // EXTREME initialization
    init: function() {
      // Preload critical resources immediately
      this.preloadCritical();
      
      // Preload fonts
      this.preloadFonts();
      
      // Preload images after DOM is ready
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
          this.preloadImages();
          this.prefetchNextPages();
        });
      } else {
        this.preloadImages();
        this.prefetchNextPages();
      }
    }
  };
  
  // Initialize immediately
  extremePreload.init();
  
  // Expose to global scope
  window.extremePreload = extremePreload;
})();
