document.addEventListener('DOMContentLoaded', function() {
    // SVG icons for navigation
    const leftArrowSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="none" d="M0 0h24v24H0z"/><path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" fill="white"/></svg>`;
    const rightArrowSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="none" d="M0 0h24v24H0z"/><path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" fill="white"/></svg>`;

    // Get all timeline galleries and project galleries
    const galleries = document.querySelectorAll('.timeline-gallery, .project-gallery');
    
    // Process each gallery separately
    galleries.forEach(gallery => {
        const galleryImages = gallery.querySelectorAll('img.gallery-image, img');
        let galleryArray = [];
        
        // Build image array for this specific gallery
        galleryImages.forEach(image => {
            galleryArray.push(image.src);
        });
        
        // Set up click handlers for each image in this gallery
        galleryImages.forEach((image, index) => {
            image.addEventListener('click', function() {
                createLightbox(galleryArray, index);
            });
        });
    });
    
    function createLightbox(images, startIndex) {
        // Create the lightbox container
        const lightbox = document.createElement('div');
        lightbox.className = 'gallery-lightbox';
        
        // Build lightbox HTML structure with modified image container for swipe animation
        let lightboxHTML = `
            <div class="lightbox-overlay">
                <button class="lightbox-close">&times;</button>
                <div class="lightbox-container">
                    <div class="lightbox-image-container">
                        <div class="lightbox-image-wrapper">
                            <img src="${images[startIndex]}" alt="Gallery image" class="lightbox-image">
                        </div>
                    </div>
                    <div class="lightbox-controls">
                        <button class="lightbox-nav lightbox-prev">${leftArrowSvg}</button>
                        <div class="lightbox-counter">${startIndex + 1} / ${images.length}</div>
                        <button class="lightbox-nav lightbox-next">${rightArrowSvg}</button>
                    </div>
                </div>
            </div>
        `;
        
        lightbox.innerHTML = lightboxHTML;
        document.body.appendChild(lightbox);
        document.body.style.overflow = 'hidden'; // Prevent scrolling
        
        // Set up event listeners
        setupLightboxEvents(lightbox, images, startIndex);
        
        // Animation
        setTimeout(() => {
            lightbox.classList.add('active');
        }, 10);
    }
    
    function setupLightboxEvents(lightbox, images, startIndex) {
        let currentIndex = startIndex; // Initialize currentIndex with startIndex
        
        // Initial references to DOM elements
        const closeBtn = lightbox.querySelector('.lightbox-close');
        const prevBtn = lightbox.querySelector('.lightbox-prev');
        const nextBtn = lightbox.querySelector('.lightbox-next');
        const lightboxOverlay = lightbox.querySelector('.lightbox-overlay');
        let lightboxImageContainer = lightbox.querySelector('.lightbox-image-container');
        let lightboxImageWrapper = lightbox.querySelector('.lightbox-image-wrapper');
        let lightboxImage = lightbox.querySelector('.lightbox-image');
        const lightboxCounter = lightbox.querySelector('.lightbox-counter');
        
        // Close lightbox
        closeBtn.addEventListener('click', closeLightbox);
        lightboxOverlay.addEventListener('click', function(e) {
            if (e.target === lightboxOverlay) {
                closeLightbox();
            }
        });
        
        // Keyboard navigation
        document.addEventListener('keydown', handleKeyPress);
        
        // Navigation buttons
        prevBtn.addEventListener('click', showPrevImage);
        nextBtn.addEventListener('click', showNextImage);
        
        // Enhanced touch swipe functionality on the entire overlay
        let touchStartX = 0;
        let touchEndX = 0;
        let currentTranslate = 0;
        let isDragging = false;
        let startTime = 0;
        const screenWidth = window.innerWidth;
        
        // Add swipe events to the entire overlay instead of just the container
        lightboxOverlay.addEventListener('touchstart', handleTouchStart, { passive: true });
        lightboxOverlay.addEventListener('touchmove', handleTouchMove, { passive: false });
        lightboxOverlay.addEventListener('touchend', handleTouchEnd);
        
        // Add mouse events for desktop drag behavior
        lightboxOverlay.addEventListener('mousedown', handleTouchStart);
        lightboxOverlay.addEventListener('mousemove', handleTouchMove);
        lightboxOverlay.addEventListener('mouseup', handleTouchEnd);
        lightboxOverlay.addEventListener('mouseleave', handleTouchEnd);
        
        function handleTouchStart(e) {
            startTime = Date.now();
            isDragging = true;
            const clientX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
            touchStartX = clientX;
            lightboxOverlay.classList.add('swiping');
            
            // Prevent default to avoid browser native behaviors
            if (e.type.includes('mouse')) {
                e.preventDefault();
            }
        }
        
        function handleTouchMove(e) {
            if (!isDragging) return;
            
            const clientX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
            const diff = clientX - touchStartX;
            
            // Calculate how far to translate based on drag distance
            currentTranslate = diff;
            
            // Apply transform to create the swipe animation
            lightboxImageWrapper.style.transform = `translateX(${currentTranslate}px)`;
            
            // Prevent default to disable scrolling while swiping
            e.preventDefault();
        }
        
        function handleTouchEnd(e) {
            if (!isDragging) return;
            
            const clientX = e.type.includes('mouse') ? e.clientX : e.changedTouches ? e.changedTouches[0].clientX : touchStartX;
            touchEndX = clientX;
            isDragging = false;
            lightboxOverlay.classList.remove('swiping');
            
            const swipeDuration = Date.now() - startTime;
            const swipeDistance = touchEndX - touchStartX;
            const swipeThreshold = 50; // Minimum distance to register as a swipe
            const quickSwipe = swipeDuration < 250 && Math.abs(swipeDistance) > 30;
            
            if (swipeDistance > swipeThreshold || (quickSwipe && swipeDistance > 0)) {
                // Swipe to the right (previous image)
                currentIndex = (currentIndex - 1 + images.length) % images.length;
                animateSwipe('right'); // Direction of animation
            } else if (swipeDistance < -swipeThreshold || (quickSwipe && swipeDistance < 0)) {
                // Swipe to the left (next image)
                currentIndex = (currentIndex + 1) % images.length;
                animateSwipe('left'); // Direction of animation
            } else {
                // Snap back to original position if swipe wasn't far enough
                // Get the current wrapper (which might have been updated)
                const currentWrapper = lightboxImageContainer.querySelector('.lightbox-image-wrapper');
                currentWrapper.style.transition = 'transform 0.2s ease-out';
                currentWrapper.style.transform = 'translateX(0)';
                setTimeout(() => {
                    currentWrapper.style.transition = '';
                }, 200);
            }
            
            currentTranslate = 0;
        }
        
        function animateSwipe(direction) {
            // First, create the new image element
            const newImg = document.createElement('img');
            newImg.className = 'lightbox-image';
            newImg.src = images[currentIndex];
            newImg.alt = "Gallery image";
            
            // Create a wrapper for the animation
            const animWrapper = document.createElement('div');
            animWrapper.className = 'lightbox-image-wrapper';
            animWrapper.style.display = 'flex';
            animWrapper.style.width = '200%'; // Double width to hold both images
            
            // Position depends on swipe direction
            if (direction === 'left') {
                // Current image is at position 0, new image is at 100%
                animWrapper.style.transform = 'translateX(0)';
                animWrapper.appendChild(lightboxImage.cloneNode(true)); // Current image
                animWrapper.appendChild(newImg); // New image
            } else {
                // New image is at -100%, current image is at 0
                animWrapper.style.transform = 'translateX(-50%)';
                animWrapper.appendChild(newImg); // New image
                animWrapper.appendChild(lightboxImage.cloneNode(true)); // Current image
            }
            
            // Replace the current wrapper with our animation wrapper
            lightboxImageWrapper.innerHTML = '';
            lightboxImageWrapper.appendChild(animWrapper);
            
            // Force a reflow to ensure the initial position is applied
            void animWrapper.offsetWidth;
            
            // Animate to the final position
            animWrapper.style.transition = 'transform 0.3s ease-out';
            animWrapper.style.transform = direction === 'left' ? 'translateX(-50%)' : 'translateX(0)';
            
            // After animation completes, completely rebuild the image container structure
            setTimeout(() => {
                // Get the container that holds the wrapper
                const imageContainer = lightboxImageWrapper.parentElement;
                
                // Completely rebuild the container structure from scratch
                imageContainer.innerHTML = '';
                
                // Create a fresh wrapper with no inline styles
                const newWrapper = document.createElement('div');
                newWrapper.className = 'lightbox-image-wrapper';
                
                // Create a fresh image with no inline styles
                const finalImage = document.createElement('img');
                finalImage.src = images[currentIndex];
                finalImage.alt = "Gallery image";
                finalImage.className = "lightbox-image";
                
                // Add the new image to the wrapper
                newWrapper.appendChild(finalImage);
                
                // Add the wrapper to the container
                imageContainer.appendChild(newWrapper);
                
                // Update our references to the new DOM elements
                lightboxImageWrapper = newWrapper;
                lightboxImage = finalImage;
                
                // Update counter
                lightboxCounter.textContent = `${currentIndex + 1} / ${images.length}`;
            }, 300);
        }
        
        function closeLightbox() {
            lightbox.classList.remove('active');
            setTimeout(() => {
                document.body.removeChild(lightbox);
                document.body.style.overflow = ''; // Re-enable scrolling
            }, 300);
            document.removeEventListener('keydown', handleKeyPress);
        }
        
        function showPrevImage() {
            currentIndex = (currentIndex - 1 + images.length) % images.length;
            updateImageImmediately();
        }
        
        function showNextImage() {
            currentIndex = (currentIndex + 1) % images.length;
            updateImageImmediately();
        }
        
        function updateImageImmediately() {
            // Get the current wrapper (which might have been updated)
            const currentWrapper = lightboxImageContainer.querySelector('.lightbox-image-wrapper');
            
            // Create new image element
            const newImage = document.createElement('img');
            newImage.src = images[currentIndex];
            newImage.alt = "Gallery image";
            newImage.className = "lightbox-image";
            
            // Clear and update the wrapper
            currentWrapper.innerHTML = '';
            currentWrapper.appendChild(newImage);
            
            // Update our image reference
            lightboxImage = newImage;
            
            // Update counter
            lightboxCounter.textContent = `${currentIndex + 1} / ${images.length}`;
        }
        
        function handleKeyPress(e) {
            switch (e.key) {
                case 'Escape':
                    closeLightbox();
                    break;
                case 'ArrowLeft':
                    showPrevImage();
                    break;
                case 'ArrowRight':
                    showNextImage();
                    break;
            }
        }
    }
});
