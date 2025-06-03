// document.addEventListener('DOMContentLoaded', function() {
//     // Function to handle sidebar link interactions
//     function setupSidebarInteractions(sidebarSelector) {
//         const sidebar = document.querySelector(sidebarSelector);
//         if (!sidebar) return;
        
//         const sidebarLinks = sidebar.querySelectorAll('.sidebar-link');
        
//         sidebarLinks.forEach(link => {
//             // Handle hover effects
//             link.addEventListener('mouseenter', function() {
//                 this.style.boxShadow = '1px 0 2px rgba(0,0,0,0.1)';
//                 this.style.zIndex = '10';
                
//                 // Show active indicator on hover
//                 const indicator = this.querySelector('.active-indicator');
//                 if (indicator) {
//                     indicator.style.opacity = '1';
//                 }
//             });
            
//             link.addEventListener('mouseleave', function() {
//                 this.style.boxShadow = '';
//                 this.style.zIndex = '';
                
//                 // Hide indicator on mouse leave unless it's an active link and sidebar is expanded
//                 const indicator = this.querySelector('.active-indicator');
//                 if (indicator && !this.classList.contains('active-link')) {
//                     indicator.style.opacity = '0';
//                 }
//             });
//         });
//     }
    
//     // Set up interactions for both sidebars
//     setupSidebarInteractions('.page-sidebar:not(.project-sidebar)');
//     setupSidebarInteractions('.project-sidebar');
// });
