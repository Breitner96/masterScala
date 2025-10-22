// Debug script for media gallery functionality
console.log('🔍 Debug Media Gallery Script Loaded');

// Wait for all scripts to load
setTimeout(function() {
  console.log('🔍 Starting Media Gallery Debug after delay');
  
  // Check if media-gallery custom element is defined
  if (customElements.get('media-gallery')) {
    console.log('✅ media-gallery custom element is defined');
  } else {
    console.log('❌ media-gallery custom element is NOT defined');
  }
  
  // Check if slider-component custom element is defined
  if (customElements.get('slider-component')) {
    console.log('✅ slider-component custom element is defined');
  } else {
    console.log('❌ slider-component custom element is NOT defined');
  }
  
  // Find all media-gallery elements
  const mediaGalleries = document.querySelectorAll('media-gallery');
  console.log(`🔍 Found ${mediaGalleries.length} media-gallery elements`);
  
  mediaGalleries.forEach((gallery, index) => {
    console.log(`🔍 Media Gallery ${index + 1}:`, gallery);
    
    // Check elements
    const elements = {
      liveRegion: gallery.querySelector('[id^="GalleryStatus"]'),
      viewer: gallery.querySelector('[id^="GalleryViewer"]'),
      thumbnails: gallery.querySelector('[id^="GalleryThumbnails"]'),
    };
    
    console.log(`🔍 Gallery ${index + 1} elements:`, elements);
    
    if (elements.thumbnails) {
      const thumbnailButtons = elements.thumbnails.querySelectorAll('[data-target] button');
      console.log(`🔍 Gallery ${index + 1} thumbnail buttons:`, thumbnailButtons.length);
      
      thumbnailButtons.forEach((button, btnIndex) => {
        console.log(`🔍 Button ${btnIndex + 1}:`, {
          element: button,
          dataTarget: button.closest('[data-target]').dataset.target,
          hasClickListener: button.onclick !== null
        });
        
        // Add debug click listener
        button.addEventListener('click', function(e) {
          console.log('🖱️ Thumbnail clicked!', {
            button: this,
            dataTarget: this.closest('[data-target]').dataset.target,
            event: e
          });
        });
      });
    } else {
      console.log(`❌ Gallery ${index + 1} has no thumbnails element`);
    }
  });
  
  // Check for any JavaScript errors
  window.addEventListener('error', function(e) {
    console.log('❌ JavaScript Error:', e.error);
  });
  
  // Monitor for media-gallery custom element creation
  const observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
      if (mutation.type === 'childList') {
        mutation.addedNodes.forEach(function(node) {
          if (node.nodeType === 1 && node.tagName === 'MEDIA-GALLERY') {
            console.log('🔍 New media-gallery element added:', node);
          }
        });
      }
    });
  });
  
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
}, 1000); // Wait 1 second for all scripts to load
