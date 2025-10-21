// Ultra Cache System - Maximum Performance
(function() {
  'use strict';
  
  const ultraCache = {
    cache: new Map(),
    maxSize: 100,
    ttl: 300000, // 5 minutes
    
    // Set cache with TTL
    set: function(key, value, ttl = this.ttl) {
      if (this.cache.size >= this.maxSize) {
        this.evictOldest();
      }
      
      this.cache.set(key, {
        value: value,
        timestamp: Date.now(),
        ttl: ttl
      });
    },
    
    // Get from cache
    get: function(key) {
      const item = this.cache.get(key);
      if (!item) return null;
      
      if (Date.now() - item.timestamp > item.ttl) {
        this.cache.delete(key);
        return null;
      }
      
      return item.value;
    },
    
    // Evict oldest item
    evictOldest: function() {
      let oldestKey = null;
      let oldestTime = Date.now();
      
      for (const [key, item] of this.cache) {
        if (item.timestamp < oldestTime) {
          oldestTime = item.timestamp;
          oldestKey = key;
        }
      }
      
      if (oldestKey) {
        this.cache.delete(oldestKey);
      }
    },
    
    // Clear cache
    clear: function() {
      this.cache.clear();
    },
    
    // Cache DOM queries
    querySelector: function(selector) {
      const cacheKey = 'query_' + selector;
      let element = this.get(cacheKey);
      
      if (!element) {
        element = document.querySelector(selector);
        if (element) {
          this.set(cacheKey, element, 60000); // 1 minute cache
        }
      }
      
      return element;
    },
    
    // Cache computed styles
    getComputedStyle: function(element) {
      const cacheKey = 'style_' + (element.id || element.className || element.tagName);
      let styles = this.get(cacheKey);
      
      if (!styles) {
        styles = window.getComputedStyle(element);
        this.set(cacheKey, styles, 30000); // 30 seconds cache
      }
      
      return styles;
    },
    
    // Cache API responses
    fetch: function(url, options = {}) {
      const cacheKey = 'fetch_' + url;
      const cached = this.get(cacheKey);
      
      if (cached) {
        return Promise.resolve(cached);
      }
      
      return fetch(url, options)
        .then(response => response.json())
        .then(data => {
          this.set(cacheKey, data, 300000); // 5 minutes cache
          return data;
        });
    },
    
    // Preload critical resources
    preload: function(url, type = 'script') {
      const cacheKey = 'preload_' + url;
      if (this.get(cacheKey)) return;
      
      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = url;
      link.as = type;
      link.crossOrigin = 'anonymous';
      
      link.onload = () => {
        this.set(cacheKey, true, 600000); // 10 minutes cache
      };
      
      document.head.appendChild(link);
    },
    
    // Prefetch resources
    prefetch: function(url) {
      const cacheKey = 'prefetch_' + url;
      if (this.get(cacheKey)) return;
      
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = url;
      
      link.onload = () => {
        this.set(cacheKey, true, 1800000); // 30 minutes cache
      };
      
      document.head.appendChild(link);
    },
    
    // Intelligent resource loading
    loadResource: function(url, type, priority = 'low') {
      const cacheKey = 'resource_' + url;
      const cached = this.get(cacheKey);
      
      if (cached) {
        return Promise.resolve(cached);
      }
      
      return new Promise((resolve, reject) => {
        const element = document.createElement(type === 'css' ? 'link' : 'script');
        
        if (type === 'css') {
          element.rel = 'preload';
          element.as = 'style';
          element.href = url;
          element.onload = function() {
            this.onload = null;
            this.rel = 'stylesheet';
            ultraCache.set(cacheKey, true, 600000);
            resolve(true);
          };
        } else {
          element.src = url;
          element.async = true;
          element.defer = true;
          element.onload = () => {
            ultraCache.set(cacheKey, true, 600000);
            resolve(true);
          };
        }
        
        element.onerror = reject;
        
        if (priority === 'high') {
          document.head.insertBefore(element, document.head.firstChild);
        } else {
          document.head.appendChild(element);
        }
      });
    },
    
    // Batch load resources
    loadBatch: function(resources, delay = 0) {
      return new Promise((resolve) => {
        setTimeout(() => {
          const promises = resources.map(resource => 
            this.loadResource(resource.url, resource.type, resource.priority)
          );
          
          Promise.all(promises).then(resolve);
        }, delay);
      });
    },
    
    // Initialize cache system
    init: function() {
      // Preload critical resources
      this.preload('{{ "base.css" | asset_url }}', 'style');
      this.preload('{{ "global.js" | asset_url }}', 'script');
      
      // Prefetch likely next pages
      const links = document.querySelectorAll('a[href*="/products/"], a[href*="/collections/"]');
      links.forEach((link, index) => {
        if (index < 3) {
          this.prefetch(link.href);
        }
      });
      
      // Clean up expired cache every 5 minutes
      setInterval(() => {
        for (const [key, item] of this.cache) {
          if (Date.now() - item.timestamp > item.ttl) {
            this.cache.delete(key);
          }
        }
      }, 300000);
    }
  };
  
  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => ultraCache.init());
  } else {
    ultraCache.init();
  }
  
  // Expose to global scope
  window.ultraCache = ultraCache;
})();
