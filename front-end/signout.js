// Redirect if user is not authenticated
if (!sessionStorage.getItem("isAuthenticated")) {
     window.location.href = "front-end/login.html"; // Go to login
 }
 
 function logout() {
     sessionStorage.removeItem("isAuthenticated"); // Remove login status
     window.location.href = "front-end/login.html"; // Redirect to login page
 }
 