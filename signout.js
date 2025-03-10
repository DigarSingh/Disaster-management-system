// Redirect if user is not authenticated
if (!sessionStorage.getItem("isAuthenticated")) {
     window.location.href = "login.html"; // Go to login
 }
 
 function logout() {
     sessionStorage.removeItem("isAuthenticated"); // Remove login status
     window.location.href = "login.html"; // Redirect to login page
 }
 