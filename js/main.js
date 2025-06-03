document.addEventListener('DOMContentLoaded', () => {

    // --- Carousel Functionality ---
    if (document.querySelector('.carousel')) {
        const carousels = document.querySelectorAll('.carousel');

        // Define parameters for proportional styling
        const MAIN_CARD_SCALE = 1.0;
        const MIN_CARD_SCALE = 0.85;
        const MAIN_CARD_BRIGHTNESS = 1.0;
        const MIN_CARD_BRIGHTNESS = 0.85;
        // New: Parameters for dynamic margins
        const MAIN_CARD_HORIZONTAL_MARGIN = 7; // e.g., 15px on each side for "main" cards
        const MIN_CARD_HORIZONTAL_MARGIN = -50;   // e.g., 5px on each side for "far" cards
        // New: Max z-index for the base (non-hovered) main card
        const MAX_BASE_Z_INDEX = 10; // e.g., main card is 10, adjacent are 9, next are 8, etc.

        carousels.forEach(carousel => {
            const cards = Array.from(carousel.querySelectorAll('.card'));
            if (cards.length === 0) return;

            let targetAlignmentX = 0;
            const wrapper = carousel.closest('.carousel-section-wrapper');
            if (wrapper) {
                const wrapperStyle = window.getComputedStyle(wrapper);
                targetAlignmentX = parseFloat(wrapperStyle.paddingLeft);
            } else {
                targetAlignmentX = carousel.getBoundingClientRect().left - parseFloat(window.getComputedStyle(carousel).paddingLeft);
            }

            const maxInfluenceDistance = carousel.offsetWidth || window.innerWidth;
            let mainCardIndex = -1; // To store the array index of the mainSelectedCard

            function updateCardStyles() {
                let mainSelectedCard = null;
                let minDistanceToAlignmentGuide = Infinity;

                // Pass 1: Find the mainSelectedCard and its array index
                cards.forEach((card, index) => {
                    const cardRect = card.getBoundingClientRect();
                    const distance = Math.abs(cardRect.left - targetAlignmentX);
                    if (distance < minDistanceToAlignmentGuide) {
                        minDistanceToAlignmentGuide = distance;
                        mainSelectedCard = card;
                        mainCardIndex = index; // Store the index of the main card
                    }
                });

                // Pass 2: Apply styles to all cards
                if (mainSelectedCard) { // Proceed only if a main card is identified
                    cards.forEach((card, index) => {
                        const cardRect = card.getBoundingClientRect();
                        const distanceToGuide = Math.abs(cardRect.left - targetAlignmentX);

                        let currentScale, currentBrightness, currentMargin;
                        const normalizedDistance = Math.min(distanceToGuide / maxInfluenceDistance, 1);

                        // Calculate positional distance (0 for main, 1 for adjacent, etc.)
                        const positionalDistanceFromMain = Math.abs(index - mainCardIndex);
                        // Calculate z-index: main card gets MAX_BASE_Z_INDEX, others decrease
                        // Ensure z-index is at least 1
                        const currentZIndex = Math.max(1, MAX_BASE_Z_INDEX - positionalDistanceFromMain);
                        card.style.zIndex = currentZIndex;

                        if (card === mainSelectedCard) {
                            currentScale = MAIN_CARD_SCALE;
                            currentBrightness = MAIN_CARD_BRIGHTNESS;
                            currentMargin = MAIN_CARD_HORIZONTAL_MARGIN;
                            // z-index is already set to MAX_BASE_Z_INDEX via the formula above
                        } else {
                            currentScale = MAIN_CARD_SCALE - (normalizedDistance * (MAIN_CARD_SCALE - MIN_CARD_SCALE));
                            currentBrightness = MAIN_CARD_BRIGHTNESS - (normalizedDistance * (MAIN_CARD_BRIGHTNESS - MIN_CARD_BRIGHTNESS));
                            currentMargin = MAIN_CARD_HORIZONTAL_MARGIN - (normalizedDistance * (MAIN_CARD_HORIZONTAL_MARGIN - MIN_CARD_HORIZONTAL_MARGIN));

                            currentScale = Math.max(MIN_CARD_SCALE, currentScale);
                            currentBrightness = Math.max(MIN_CARD_BRIGHTNESS, currentBrightness);
                            currentMargin = Math.max(MIN_CARD_HORIZONTAL_MARGIN, currentMargin);
                        }

                        card.style.setProperty('--card-scale', currentScale);
                        card.style.setProperty('--card-brightness', currentBrightness);
                        card.style.marginLeft = `${currentMargin}px`;
                        card.style.marginRight = `${currentMargin}px`;

                        // The .is-main-active class is now less critical for z-index
                        // but can be kept for other specific non-proportional styles if needed.
                        if (card === mainSelectedCard) {
                            card.classList.add('is-main-active');
                        } else {
                            card.classList.remove('is-main-active');
                        }
                    });
                }
            }

            if (cards.length > 0) {
                requestAnimationFrame(updateCardStyles);
                carousel.addEventListener('scroll', () => requestAnimationFrame(updateCardStyles), { passive: true });
                window.addEventListener('resize', () => requestAnimationFrame(updateCardStyles));
            }
        });
    }

    // --- Page Sidebar Functionality ---
    const sidebarNavs = document.querySelectorAll('.sidebar-nav');
    if (sidebarNavs.length > 0) {
        sidebarNavs.forEach(sidebarNav => {
            const links = Array.from(sidebarNav.querySelectorAll('.sidebar-link'));
            const maxPadding = 45; // Max right padding for the hovered item (px)
            const neighborPadding = 35; // Right padding for direct neighbors (px)
            const secondNeighborPadding = 25; // Right padding for second neighbors (px)
            
            const maxTextTranslate = 15; // Max text movement to the right (px)
            const neighborTextTranslate = 8; // Text movement for neighbors (px)
            const secondNeighborTextTranslate = 4; // Text movement for second neighbors (px)
            
            // Set initial styles for animation
            links.forEach(link => {
                // Use transition for both padding and transform
                link.style.transition = 'padding-right 0.3s ease, box-shadow 0.2s ease, background-color 0.2s ease';
                // link.style.width = '100%'; // Ensure full width for padding effect
                
                // Find the link text element
                const linkText = link.querySelector('.link-text');
                if (linkText) {
                    linkText.style.transition = 'transform 0.3s ease, opacity 0.2s 0.1s ease';
                    linkText.style.display = 'inline-block'; // Enable transform
                }
            });

            links.forEach((link, hoveredIndex) => {
                link.addEventListener('mouseenter', () => {
                    links.forEach((otherLink, otherIndex) => {
                        const distance = Math.abs(hoveredIndex - otherIndex);
                        let rightPadding = 20; // Default padding
                        let textTranslate = 0;
                        
                        if (distance === 0) {
                            rightPadding = maxPadding;
                            textTranslate = maxTextTranslate;
                            otherLink.style.boxShadow = '1px 0 2px rgba(0,0,0,0.1)';
                            otherLink.style.zIndex = '10';
                        } else if (distance === 1) {
                            rightPadding = neighborPadding;
                            textTranslate = neighborTextTranslate;
                        } else if (distance === 2) {
                            rightPadding = secondNeighborPadding;
                            textTranslate = secondNeighborTextTranslate;
                        }
                        
                        otherLink.style.paddingRight = `${rightPadding}px`;
                        
                        // Move the text element
                        const linkText = otherLink.querySelector('.link-text');
                        if (linkText) {
                            linkText.style.transform = `translateX(${textTranslate}px)`;
                        }
                    });
                });
                
                link.addEventListener('mouseleave', () => {
                    links.forEach(link => {
                        link.style.paddingRight = '20px'; // Reset to default padding
                        link.style.boxShadow = '';
                        link.style.zIndex = '';
                        
                        // Reset text position
                        const linkText = link.querySelector('.link-text');
                        if (linkText) {
                            linkText.style.transform = 'translateX(0)';
                        }
                    });
                });
            });
        });
    }

    // --- Mobile Navigation Functionality ---
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const mobileNavPanel = document.querySelector('.mobile-nav-panel');
    const mobileNavOverlay = document.querySelector('.mobile-nav-overlay');
    const mobileNavClose = document.querySelector('.mobile-nav-close');
    const projectsSubmenuLink = document.querySelector('.mobile-nav-list a[data-submenu="projects"]');
    const backArrowBtn = document.querySelector('.back-arrow');
    const mobileMainNav = document.querySelector('.mobile-main-nav');
    const mobileProjectNav = document.querySelector('.mobile-project-nav');
    
    // Open mobile menu
    if (mobileMenuToggle && mobileNavPanel && mobileNavOverlay) {
        mobileMenuToggle.addEventListener('click', () => {
            mobileMenuToggle.classList.add('active');
            mobileNavPanel.classList.add('active');
            mobileNavOverlay.classList.add('active');
            document.body.classList.add('mobile-menu-open');
            
            // Always show main navigation first when opening menu
            mobileMainNav.classList.add('active');
            mobileProjectNav.classList.remove('active');
            mobileNavPanel.classList.remove('projects-view');
        });
        
        // Close mobile menu
        const closeMobileMenu = () => {
            mobileMenuToggle.classList.remove('active');
            mobileNavPanel.classList.remove('active');
            mobileNavOverlay.classList.remove('active');
            document.body.classList.remove('mobile-menu-open');
        };
        
        mobileNavOverlay.addEventListener('click', closeMobileMenu);
        mobileNavClose.addEventListener('click', closeMobileMenu);
        
        // Handle mobile link clicks to close menu except for special submenu links
        const mobileNavLinks = document.querySelectorAll('.mobile-nav-list a:not(.has-submenu)');
        mobileNavLinks.forEach(link => {
            link.addEventListener('click', () => {
                closeMobileMenu();
            });
        });
        
        // Show project navigation when Projects submenu link is clicked
        if (projectsSubmenuLink) {
            projectsSubmenuLink.addEventListener('click', (e) => {
                e.preventDefault(); // Ensure we prevent the default navigation
                e.stopPropagation(); // Stop event bubbling
                mobileMainNav.classList.remove('active');
                mobileProjectNav.classList.add('active');
                mobileNavPanel.classList.add('projects-view');
                return false; // Extra layer of protection against navigation
            });
        }
        
        // Back to main navigation when back arrow is clicked
        if (backArrowBtn) {
            backArrowBtn.addEventListener('click', () => {
                mobileProjectNav.classList.remove('active');
                mobileMainNav.classList.add('active');
                mobileNavPanel.classList.remove('projects-view');
            });
        }
    }
    
    // Add spacer if we're on a mobile view with fixed header
    if (window.innerWidth <= 768) {
        const spacer = document.createElement('div');
        spacer.className = 'mobile-spacer';
        if (!document.querySelector('.mobile-spacer')) {
            const firstChild = document.body.firstChild;
            document.body.insertBefore(spacer, firstChild);
        }
    }
});