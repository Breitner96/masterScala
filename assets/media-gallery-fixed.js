// Fixed Media Gallery Implementation
console.log('🔧 Loading Fixed Media Gallery Script');

if (!customElements.get('media-gallery')) {
  customElements.define(
    'media-gallery',
    class MediaGallery extends HTMLElement {
      constructor() {
        super();
        console.log('🔧 MediaGallery constructor called');
        
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
          document.addEventListener('DOMContentLoaded', () => this.init());
        } else {
          this.init();
        }
      }

      init() {
        console.log('🔧 Initializing MediaGallery');
        
        this.elements = {
          liveRegion: this.querySelector('[id^="GalleryStatus"]'),
          viewer: this.querySelector('[id^="GalleryViewer"]'),
          thumbnails: this.querySelector('[id^="GalleryThumbnails"]'),
        };
        
        console.log('🔧 MediaGallery elements:', this.elements);
        
        if (!this.elements.thumbnails) {
          console.log('❌ No thumbnails element found');
          return;
        }

        this.mql = window.matchMedia('(min-width: 750px)');
        
        // Set up event listeners
        this.setupEventListeners();
        
        // Set up slide change listener
        if (this.elements.viewer) {
          this.elements.viewer.addEventListener('slideChanged', (event) => {
            console.log('🔧 Slide changed event:', event.detail);
            this.onSlideChanged(event);
          });
        }
        
        // Remove list semantic if needed
        if (this.dataset.desktopLayout && this.dataset.desktopLayout.includes('thumbnail') && this.mql.matches) {
          this.removeListSemantic();
        }
      }

      setupEventListeners() {
        const thumbnailElements = this.elements.thumbnails.querySelectorAll('[data-target]');
        console.log('🔧 Setting up event listeners for', thumbnailElements.length, 'thumbnails');
        
        thumbnailElements.forEach((mediaToSwitch, index) => {
          const button = mediaToSwitch.querySelector('button');
          const dataTarget = mediaToSwitch.dataset.target;
          
          console.log(`🔧 Thumbnail ${index + 1}:`, {
            element: mediaToSwitch,
            button: button,
            dataTarget: dataTarget
          });
          
          if (button && dataTarget) {
            // Remove any existing listeners
            button.removeEventListener('click', this.handleThumbnailClick);
            
            // Add new listener
            button.addEventListener('click', (event) => {
              event.preventDefault();
              event.stopPropagation();
              console.log('🖱️ Thumbnail clicked:', dataTarget);
              this.setActiveMedia(dataTarget, false);
            });
            
            console.log(`✅ Event listener added to thumbnail ${index + 1}`);
          } else {
            console.log(`❌ Could not set up thumbnail ${index + 1}:`, {
              hasButton: !!button,
              hasDataTarget: !!dataTarget
            });
          }
        });
      }

      onSlideChanged(event) {
        if (!event.detail || !event.detail.currentElement) {
          console.log('⚠️ Invalid slideChanged event');
          return;
        }
        
        const mediaId = event.detail.currentElement.dataset.mediaId;
        console.log('🔧 Slide changed to media ID:', mediaId);
        
        const thumbnail = this.elements.thumbnails.querySelector(`[data-target="${mediaId}"]`);
        if (thumbnail) {
          this.setActiveThumbnail(thumbnail);
        }
      }

      setActiveMedia(mediaId, prepend) {
        console.log('🔧 setActiveMedia called with mediaId:', mediaId);
        
        if (!this.elements.viewer) {
          console.log('❌ No viewer element found');
          return;
        }
        
        const activeMedia = this.elements.viewer.querySelector(`[data-media-id="${mediaId}"]`);
        console.log('🔧 Found activeMedia:', activeMedia);
        
        if (!activeMedia) {
          console.log('❌ Active media not found for ID:', mediaId);
          return;
        }
        
        // Remove active class from all media
        this.elements.viewer.querySelectorAll('[data-media-id]').forEach((element) => {
          element.classList.remove('is-active');
        });
        
        // Add active class to selected media
        activeMedia.classList.add('is-active');
        console.log('✅ Set active media:', activeMedia);

        if (prepend) {
          activeMedia.parentElement.prepend(activeMedia);
          if (this.elements.thumbnails) {
            const activeThumbnail = this.elements.thumbnails.querySelector(`[data-target="${mediaId}"]`);
            if (activeThumbnail) {
              activeThumbnail.parentElement.prepend(activeThumbnail);
            }
          }
          if (this.elements.viewer.slider) {
            this.elements.viewer.resetPages();
          }
        }

        this.preventStickyHeader();
        
        // Scroll to active media
        setTimeout(() => {
          if (!this.mql.matches || this.elements.thumbnails) {
            activeMedia.parentElement.scrollTo({ left: activeMedia.offsetLeft });
          }
          const activeMediaRect = activeMedia.getBoundingClientRect();
          if (activeMediaRect.top > -0.5) return;
          const top = activeMediaRect.top + window.scrollY;
          window.scrollTo({ top: top, behavior: 'smooth' });
        }, 100);
        
        this.playActiveMedia(activeMedia);

        if (!this.elements.thumbnails) return;
        const activeThumbnail = this.elements.thumbnails.querySelector(`[data-target="${mediaId}"]`);
        if (activeThumbnail) {
          this.setActiveThumbnail(activeThumbnail);
          this.announceLiveRegion(activeMedia, activeThumbnail.dataset.mediaPosition);
        }
      }

      setActiveThumbnail(thumbnail) {
        if (!this.elements.thumbnails || !thumbnail) return;

        console.log('🔧 Setting active thumbnail:', thumbnail);
        
        this.elements.thumbnails
          .querySelectorAll('button')
          .forEach((element) => element.removeAttribute('aria-current'));
        
        const button = thumbnail.querySelector('button');
        if (button) {
          button.setAttribute('aria-current', true);
        }
        
        if (this.elements.thumbnails.isSlideVisible && this.elements.thumbnails.isSlideVisible(thumbnail, 10)) return;
        
        if (this.elements.thumbnails.slider) {
          this.elements.thumbnails.slider.scrollTo({ left: thumbnail.offsetLeft });
        }
      }

      announceLiveRegion(activeItem, position) {
        if (!this.elements.liveRegion) return;
        
        const image = activeItem.querySelector('.product__modal-opener--image img');
        if (!image) return;
        
        image.onload = () => {
          this.elements.liveRegion.setAttribute('aria-hidden', false);
          if (window.accessibilityStrings && window.accessibilityStrings.imageAvailable) {
            this.elements.liveRegion.innerHTML = window.accessibilityStrings.imageAvailable.replace('[index]', position);
          }
          setTimeout(() => {
            this.elements.liveRegion.setAttribute('aria-hidden', true);
          }, 2000);
        };
        image.src = image.src;
      }

      playActiveMedia(activeItem) {
        if (window.pauseAllMedia) {
          window.pauseAllMedia();
        }
        const deferredMedia = activeItem.querySelector('.deferred-media');
        if (deferredMedia && deferredMedia.loadContent) {
          deferredMedia.loadContent(false);
        }
      }

      preventStickyHeader() {
        this.stickyHeader = this.stickyHeader || document.querySelector('sticky-header');
        if (!this.stickyHeader) return;
        this.stickyHeader.dispatchEvent(new Event('preventHeaderReveal'));
      }

      removeListSemantic() {
        if (!this.elements.viewer || !this.elements.viewer.slider) return;
        this.elements.viewer.slider.setAttribute('role', 'presentation');
        if (this.elements.viewer.sliderItems) {
          this.elements.viewer.sliderItems.forEach((slide) => slide.setAttribute('role', 'presentation'));
        }
      }
    }
  );
  
  console.log('✅ MediaGallery custom element defined');
} else {
  console.log('⚠️ MediaGallery custom element already defined');
}
