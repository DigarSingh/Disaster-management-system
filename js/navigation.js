document.addEventListener('DOMContentLoaded', function() {
    // Get all navigation links
    const navLinks = document.querySelectorAll('nav ul li a');
    
    // Add click event listener to each nav link
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Get the target section ID from the href attribute
            const targetId = this.getAttribute('href').substring(1);
            
            // Hide all sections
            document.querySelectorAll('section.section').forEach(section => {
                section.classList.remove('active');
            });
            
            // Show the target section
            document.getElementById(targetId).classList.add('active');
            
            // Update active state in navigation
            document.querySelectorAll('nav ul li').forEach(item => {
                item.classList.remove('active');
            });
            
            // Add active class to parent li
            this.parentNode.classList.add('active');
            
            // Scroll to the top of the section
            window.scrollTo(0, 0);
        });
    });
});
