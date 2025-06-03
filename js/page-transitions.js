document.addEventListener('DOMContentLoaded', () => {
    // Configuration
    const transitionDuration = 1000; // milliseconds
    const transitionEasing = 'cubic-bezier(0.19, 1, 0.22, 1)'; // Smooth easing

    // Calculate scale needed to cover the screen from a point
    function getRequiredScale(x, y) {
        // Calculate distances to the four corners of the viewport
        const distToTopLeft = Math.sqrt(x*x + y*y);
        const distToTopRight = Math.sqrt(Math.pow(window.innerWidth - x, 2) + y*y);
        const distToBottomLeft = Math.sqrt(x*x + Math.pow(window.innerHeight - y, 2));
        const distToBottomRight = Math.sqrt(
            Math.pow(window.innerWidth - x, 2) + 
            Math.pow(window.innerHeight - y, 2)
        );
        
        // Get the maximum distance (to the furthest corner)
        const maxDist = Math.max(distToTopLeft, distToTopRight, distToBottomLeft, distToBottomRight);
        
        // Scale factor: diameter needs to be 2× the max distance
        // Starting from a 2px diameter element, we need to scale by maxDist
        return maxDist / 1;
    }

    // Create transition overlay container
    const overlay = document.createElement('div');
    overlay.className = 'page-transition-overlay';
    document.body.appendChild(overlay);

    // Check if this is a page load that requires a reveal effect
    function checkForRevealTransition() {
        // Get stored click position or default to center
        const clickX = sessionStorage.getItem('transitionClickX') || (window.innerWidth / 2);
        const clickY = sessionStorage.getItem('transitionClickY') || (window.innerHeight / 2);
        
        if (sessionStorage.getItem('transitionActive') === 'true') {
            // Create the page overlay
            const loadOverlay = document.createElement('div');
            loadOverlay.className = 'page-load-overlay';
            
            // Set the clip-path center position using CSS variables
            loadOverlay.style.setProperty('--clip-x', `${clickX}px`);
            loadOverlay.style.setProperty('--clip-y', `${clickY}px`);
            
            // Start with a full white overlay
            loadOverlay.style.clipPath = `circle(100% at ${clickX}px ${clickY}px)`;
            
            // Add to DOM
            document.body.appendChild(loadOverlay);
            
            // Force a reflow to ensure CSS transitions work
            void loadOverlay.offsetWidth;
            
            // Set up the transition for the reveal animation
            loadOverlay.style.transition = `clip-path ${transitionDuration}ms ${transitionEasing}`;
            
            // Trigger the reveal animation - shrink the circle to reveal the page
            setTimeout(() => {
                loadOverlay.style.clipPath = `circle(0% at ${clickX}px ${clickY}px)`;
                
                // Remove overlay after animation completes
                setTimeout(() => {
                    loadOverlay.remove();
                    sessionStorage.removeItem('transitionClickX');
                    sessionStorage.removeItem('transitionClickY');
                    sessionStorage.removeItem('transitionActive');
                }, transitionDuration + 50);
            }, 10);
        }
    }

    // Set up click handlers for all internal links
    function setupLinkTransitions() {
        // Select all links that appear to be internal navigation
        const internalLinks = document.querySelectorAll('a:not([href^="http"]):not([href^="#"]):not([target="_blank"])');
        
        internalLinks.forEach(link => {
            link.addEventListener('click', handleLinkClick);
        });
    }

    // Handle link clicks
    function handleLinkClick(e) {
        // Skip if modifier keys are pressed (new tab, download, etc.)
        if (e.metaKey || e.ctrlKey || e.shiftKey) return;
        
        // Get the target URL
        const href = this.getAttribute('href');
        
        // Skip for non-navigating links, external links, or hash links
        if (!href || href.startsWith('#') || href.startsWith('mailto:') || 
            (href.includes('://') && !href.startsWith(window.location.origin))) {
            return;
        }
        
        // Prevent default navigation
        e.preventDefault();
        
        // Save click coordinates in sessionStorage (more appropriate than localStorage)
        sessionStorage.setItem('transitionClickX', e.clientX);
        sessionStorage.setItem('transitionClickY', e.clientY);
        sessionStorage.setItem('transitionActive', 'true');
        
        // Calculate required scale to cover the viewport
        const requiredScale = getRequiredScale(e.clientX, e.clientY);
        
        // Create the expanding circle
        const circle = document.createElement('div');
        circle.className = 'transition-circle';
        
        // Position at cursor
        circle.style.left = `${e.clientX}px`;
        circle.style.top = `${e.clientY}px`;
        
        // Add to DOM
        overlay.appendChild(circle);
        
        // Force a reflow to ensure CSS transitions work
        void circle.offsetWidth;
        
        // Start animation
        circle.style.transition = `transform ${transitionDuration}ms ${transitionEasing}`;
        circle.style.transform = `scale(${requiredScale})`;
        
        // Navigate after animation completes
        setTimeout(() => {
            window.location.href = href;
        }, transitionDuration - 100);
    }

    // Initialize
    checkForRevealTransition();
    setupLinkTransitions();
});
