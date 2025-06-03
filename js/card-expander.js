document.addEventListener('DOMContentLoaded', function() {
    // Configuration
    const CAROUSEL_INTERVAL = 5000; // Time between auto-sliding (ms)
    
    // Card expansion functionality
    setupExpandableCards();
    
    function setupExpandableCards() {
        // Target work experience and leadership cards
        // This selector may need adjustment based on your actual HTML structure
        const expandableCards = document.querySelectorAll(
            '.carousel .card[data-category="work"], ' + 
            '.carousel .card[data-category="leadership"]'
        );
        
        // Set up click handler for each expandable card
        expandableCards.forEach(card => {
            // Add a visual indicator that the card is expandable
            card.classList.add('expandable');
            
            // Add click event for expansion
            card.addEventListener('click', function(e) {
                // Don't expand if clicking on specific elements like links
                if (e.target.closest('.github-link, a')) {
                    return;
                }
                
                // Prevent other click handlers
                e.preventDefault();
                e.stopPropagation();
                
                // Show expanded card view
                createExpandedCard(card);
            });
        });
    }
    
    function createExpandedCard(originalCard) {
        // Get data from card
        const title = originalCard.querySelector('h3').textContent;
        const subtitle = originalCard.querySelector('.card-subtitle')?.textContent || '';
        
        // Get description - use .card-content p as fallback if there's no dedicated description field
        let description = originalCard.getAttribute('data-full-description') || 
            originalCard.querySelector('.card-content p')?.textContent || '';
        
        // Get metadata
        const date = originalCard.querySelector('.date')?.textContent || '';
        const location = originalCard.querySelector('.location')?.textContent || '';
        
        // Get images - main one plus any additional ones specified in data attribute
        const mainImage = originalCard.querySelector('.card-image')?.src;
        const additionalImages = originalCard.getAttribute('data-additional-images');
        let imageArray = [];
        
        // Add main image if exists
        if (mainImage) {
            imageArray.push(mainImage);
        }
        
        // Add additional images if specified
        if (additionalImages) {
            const additionalImagesArray = additionalImages.split(',');
            imageArray = imageArray.concat(additionalImagesArray);
        }
        
        // Create overlay
        const overlay = document.createElement('div');
        overlay.className = 'expanded-card-overlay';
        
        // Create expanded card
        const expandedCard = document.createElement('div');
        expandedCard.className = 'expanded-card';
        
        // Build card HTML structure
        let cardHTML = `
            <button class="expanded-card-close">&times;</button>
        `;
        
        // Add image carousel if there are images
        if (imageArray.length > 0) {
            cardHTML += `<div class="expanded-card-carousel">
                <div class="carousel-container">`;
            
            imageArray.forEach((img, index) => {
                cardHTML += `
                    <div class="carousel-slide">
                        <img src="${img}" alt="${title} image ${index + 1}" class="carousel-image">
                    </div>`;
            });
            
            cardHTML += `</div>`;
            
            // Add carousel controls only if multiple images
            if (imageArray.length > 1) {
                cardHTML += `
                    <button class="carousel-arrow carousel-prev">&lt;</button>
                    <button class="carousel-arrow carousel-next">&gt;</button>
                    <div class="carousel-controls">`;
                
                imageArray.forEach((_, index) => {
                    cardHTML += `<button class="carousel-indicator ${index === 0 ? 'active' : ''}" data-index="${index}"></button>`;
                });
                
                cardHTML += `</div>`;
            }
            
            cardHTML += `</div>`;
        }
        
        // Add content
        cardHTML += `
            <div class="expanded-card-content">
                <h2 class="expanded-card-title">${title}</h2>
                <div class="expanded-card-subtitle">${subtitle}</div>
                <div class="expanded-card-description">${description}</div>
                <div class="expanded-card-metadata">
                    ${date ? `<div class="expanded-card-date"><i>📅</i> ${date}</div>` : ''}
                    ${location ? `<div class="expanded-card-location"><i>📍</i> ${location}</div>` : ''}
                </div>
            </div>
        `;
        
        expandedCard.innerHTML = cardHTML;
        overlay.appendChild(expandedCard);
        document.body.appendChild(overlay);
        
        // Set up carousel functionality if there are multiple images
        let carouselInterval;
        if (imageArray.length > 1) {
            const carouselContainer = expandedCard.querySelector('.carousel-container');
            const indicators = expandedCard.querySelectorAll('.carousel-indicator');
            const prevButton = expandedCard.querySelector('.carousel-prev');
            const nextButton = expandedCard.querySelector('.carousel-next');
            let currentSlide = 0;
            
            // Function to move to a specific slide
            function moveToSlide(index) {
                // Adjust index to ensure it's within bounds
                if (index < 0) index = imageArray.length - 1;
                if (index >= imageArray.length) index = 0;
                
                currentSlide = index;
                
                // Update carousel position
                carouselContainer.style.transform = `translateX(-${currentSlide * 100}%)`;
                
                // Update indicators
                indicators.forEach((indicator, i) => {
                    indicator.classList.toggle('active', i === currentSlide);
                });
            }
            
            // Set up auto-advance
            function startCarousel() {
                stopCarousel(); // Clear any existing interval first
                carouselInterval = setInterval(() => {
                    moveToSlide(currentSlide + 1);
                }, CAROUSEL_INTERVAL);
            }
            
            function stopCarousel() {
                if (carouselInterval) {
                    clearInterval(carouselInterval);
                }
            }
            
            // Set up event listeners
            if (prevButton) {
                prevButton.addEventListener('click', (e) => {
                    e.stopPropagation();
                    moveToSlide(currentSlide - 1);
                    startCarousel(); // Restart timer after manual navigation
                });
            }
            
            if (nextButton) {
                nextButton.addEventListener('click', (e) => {
                    e.stopPropagation();
                    moveToSlide(currentSlide + 1);
                    startCarousel(); // Restart timer after manual navigation
                });
            }
            
            indicators.forEach(indicator => {
                indicator.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const index = parseInt(indicator.getAttribute('data-index'));
                    moveToSlide(index);
                    startCarousel(); // Restart timer after manual navigation
                });
            });
            
            // Start auto-advance
            startCarousel();
            
            // Pause carousel on hover
            expandedCard.querySelector('.expanded-card-carousel').addEventListener('mouseenter', stopCarousel);
            expandedCard.querySelector('.expanded-card-carousel').addEventListener('mouseleave', startCarousel);
        }
        
        // Add click handler for image zoom toggle
        const carouselImages = expandedCard.querySelectorAll('.carousel-image');
        carouselImages.forEach(image => {
            // Default to cover mode (zoomed in)
            image.style.objectFit = 'cover';
            
            // Add click handler to toggle between cover and contain modes
            image.addEventListener('click', function(e) {
                e.stopPropagation();
                
                // Toggle between cover (zoomed) and contain (fit/letterboxed) modes
                if (image.style.objectFit === 'cover') {
                    image.style.objectFit = 'contain';
                    image.style.backgroundColor = '#333'; // Dark gray background for letterboxing
                } else {
                    image.style.objectFit = 'cover';
                    image.style.backgroundColor = 'transparent';
                }
            });
        });
        
        // Animate in
        requestAnimationFrame(() => {
            overlay.classList.add('active');
            expandedCard.classList.add('active');
        });
        
        // Set up close functionality
        const closeButton = expandedCard.querySelector('.expanded-card-close');
        closeButton.addEventListener('click', closeExpandedCard);
        overlay.addEventListener('click', function(e) {
            if (e.target === overlay) {
                closeExpandedCard();
            }
        });
        
        function closeExpandedCard() {
            // Stop carousel interval if it exists
            if (carouselInterval) {
                clearInterval(carouselInterval);
            }
            
            // Animate out
            overlay.classList.remove('active');
            expandedCard.classList.remove('active');
            
            // Remove after animation
            setTimeout(() => {
                overlay.remove();
            }, 300);
        }
    }
});
