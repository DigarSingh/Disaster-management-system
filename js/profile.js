document.addEventListener('DOMContentLoaded', function() {
    // User profile dropdown toggle
    const userProfileToggle = document.getElementById('userProfileToggle');
    const userDropdown = document.getElementById('userDropdown');
    
    if (userProfileToggle && userDropdown) {
        userProfileToggle.addEventListener('click', function(e) {
            e.stopPropagation();
            userProfileToggle.classList.toggle('active');
            userDropdown.classList.toggle('show');
        });
        
        // Close the dropdown when clicking outside
        document.addEventListener('click', function(e) {
            if (!userProfileToggle.contains(e.target) && !userDropdown.contains(e.target)) {
                userProfileToggle.classList.remove('active');
                userDropdown.classList.remove('show');
            }
        });
    }
    
    // Edit profile button functionality
    const editProfileBtn = document.getElementById('editProfile');
    if (editProfileBtn) {
        editProfileBtn.addEventListener('click', function(e) {
            e.preventDefault();
            // Show profile edit modal - this is a placeholder
            alert('Edit profile functionality will be implemented here');
        });
    }
    
    // Logout button functionality
    const logoutBtn = document.getElementById('logout');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            // Implement logout functionality
            if (confirm('Are you sure you want to logout?')) {
                // Perform logout actions (normally would clear session/cookies)
                alert('Logged out successfully');
                // Redirect to login page
                window.location.href = '../index.html';
            }
        });
    }
});
