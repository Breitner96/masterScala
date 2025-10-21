// Performance Configuration for Skala Theme
window.SKALA_PERFORMANCE_CONFIG = {
  // Critical resource preloading
  criticalResources: {
    css: [
      'base.css',
      'component-cart.css',
      'component-search.css'
    ],
    js: [
      'constants.js',
      'pubsub.js',
      'global.js'
    ],
    fonts: [
      'archivo-regular.woff2',
      'archivo-bold.woff2'
    ]
  },

  // Lazy loading configuration
  lazyLoading: {
    enabled: true,
    rootMargin: '50px 0px',
    threshold: 0.01,
    placeholder: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMSIgaGVpZ2h0PSIxIiB2aWV3Qm94PSIwIDAgMSAxIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxIiBoZWlnaHQ9IjEiIGZpbGw9IiNmM2Y0ZjYiLz48L3N2Zz4='
  },

  // Image optimization
  imageOptimization: {
    enabled: true,
    quality: 85,
    formats: ['webp', 'avif', 'jpg'],
    sizes: {
      mobile: '375px',
      tablet: '768px',
      desktop: '1200px',
      large: '1920px'
    }
  },

  // Animation optimization
  animations: {
    enabled: true,
    reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    duration: 300,
    easing: 'cubic-bezier(0.4, 0, 0.2, 1)'
  },

  // Service Worker configuration
  serviceWorker: {
    enabled: true,
    cacheStrategy: 'staleWhileRevalidate',
    maxCacheSize: 50 * 1024 * 1024, // 50MB
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  },

  // Performance monitoring
  monitoring: {
    enabled: true,
    logLevel: 'info',
    metrics: {
      lcp: true,
      fid: true,
      cls: true,
      fcp: true,
      ttfb: true
    }
  },

  // Resource hints
  resourceHints: {
    preconnect: [
      'https://fonts.shopifycdn.com',
      'https://connect.facebook.net',
      'https://www.google-analytics.com'
    ],
    dnsPrefetch: [
      'https://cdn.shopify.com',
      'https://monorail-edge.shopifysvc.com'
    ]
  },

  // Critical CSS
  criticalCSS: {
    enabled: true,
    inline: true,
    maxSize: 14 * 1024, // 14KB
    selectors: [
      '.header',
      '.banner',
      '.button',
      '.visually-hidden',
      'body',
      'html'
    ]
  },

  // JavaScript optimization
  javascript: {
    codeSplitting: true,
    treeShaking: true,
    minification: true,
    compression: true,
    deferNonCritical: true
  },

  // Font optimization
  fontOptimization: {
    preload: true,
    display: 'swap',
    fallback: 'system-ui, -apple-system, sans-serif',
    subset: true
  }
};

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = window.SKALA_PERFORMANCE_CONFIG;
}
