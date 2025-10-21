// Performance optimization configuration
window.PerformanceConfig = {
  // Lazy loading configuration
  lazyLoading: {
    enabled: true,
    rootMargin: '50px 0px',
    threshold: 0.01,
    placeholder: true
  },
  
  // Image optimization
  images: {
    quality: 80,
    format: 'webp',
    fallbackFormat: 'jpg',
    sizes: '(max-width: 750px) 100vw, (max-width: 990px) 50vw, 33vw'
  },
  
  // Resource hints
  preload: {
    criticalCSS: true,
    criticalJS: true,
    fonts: true,
    images: false
  },
  
  // Compression
  compression: {
    gzip: true,
    brotli: true
  },
  
  // Caching
  caching: {
    static: '1y',
    dynamic: '1h',
    fonts: '1y'
  }
};

// Performance monitoring
if ('performance' in window) {
  window.addEventListener('load', function() {
    setTimeout(function() {
      const perfData = performance.getEntriesByType('navigation')[0];
      const loadTime = perfData.loadEventEnd - perfData.loadEventStart;
      const domContentLoaded = perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart;
      
      console.log('Performance Metrics:', {
        loadTime: loadTime + 'ms',
        domContentLoaded: domContentLoaded + 'ms',
        firstPaint: performance.getEntriesByType('paint')[0]?.startTime + 'ms' || 'N/A'
      });
    }, 0);
  });
}
