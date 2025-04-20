// Import the functions from Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.18.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.18.0/firebase-analytics.js";
// Import Firebase authentication
import { getAuth, signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/9.18.0/firebase-auth.js";

// Firebase configuration - must match the one used in signup.js
const firebaseConfig = {
  apiKey: "AIzaSyAPJ2_ZgJPt2moVakPh4ctVj7n9lDLcnQo",
  authDomain: "disaster-management-syst-d722e.firebaseapp.com",
  projectId: "disaster-management-syst-d722e",
  storageBucket: "disaster-management-syst-d722e.firebasestorage.app",
  messagingSenderId: "322078337309",
  appId: "1:322078337309:web:96f6699906c2493a7b59f4",
  measurementId: "G-4F4PJLX7FG"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
// Initialize Firebase Authentication
const auth = getAuth(app);

// Ensure the DOM content is fully loaded
document.addEventListener('DOMContentLoaded', function() {
  console.log("Firebase auth.js script loaded and running");
  
  // Get the login form
  const loginForm = document.getElementById('loginForm');
  
  if (loginForm) {
    console.log("Login form found, attaching submit handler");
    loginForm.addEventListener('submit', handleLogin);
  } else {
    console.log("Login form not found, checking for logout button");
    
    // Check for logout button (on any page)
    const logoutButton = document.getElementById('logout');
    if (logoutButton) {
      console.log("Logout button found, attaching click handler");
      logoutButton.addEventListener('click', handleLogout);
    }
    
    // Check if user is logged in
    checkAuthStatus();
  }
  
  // Login handler function
  async function handleLogin(event) {
    event.preventDefault();
    console.log("Login handler triggered");
    
    // Get form inputs
    const email = document.getElementById('email')?.value;
    const password = document.getElementById('password')?.value;
    
    console.log("Login attempt with email:", email ? "provided" : "missing");
    
    // Validate inputs
    if (!email || !password) {
      alert("Please enter both email and password");
      return;
    }
    
    // Get submit button for UI updates
    const button = loginForm.querySelector('button[type="submit"]');
    
    if (button) {
      // Show loading state
      button.disabled = true;
      const originalButtonText = button.innerHTML;
      button.innerHTML = "Logging in...";
    }
    
    try {
      console.log("Attempting to authenticate with Firebase");
      // Sign in with email and password
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      console.log("Login successful, user ID:", user.uid);
      
      // Store user info in localStorage
      localStorage.setItem('currentUser', JSON.stringify({
        uid: user.uid,
        email: user.email,
        loggedIn: true
      }));
      
      console.log("Redirecting to home page...");
      
      // Try multiple redirection methods
      try {
        // Method 1: Try a full path with location.replace (most reliable)
        const fullPath = window.location.origin + window.location.pathname.replace('login.html', 'home.html');
        console.log("Attempting redirection to:", fullPath);
        window.location.replace(fullPath);
        
        // Method 2: Set a fallback with timeout
        setTimeout(() => {
          if (document.location.href.includes('login.html')) {
            console.log("Fallback redirection with absolute path");
            window.location.href = window.location.origin + "/Disaster Management System/pages/home.html";
          }
        }, 500);
        
        // Method 3: Last resort fallback
        setTimeout(() => {
          if (document.location.href.includes('login.html')) {
            console.log("Last resort redirection");
            alert("Login successful! Click OK to continue to home page.");
            window.location = "/Disaster Management System/pages/home.html";
          }
        }, 1000);
      } catch (redirectError) {
        console.error("Error during redirection:", redirectError);
        alert("Login successful but redirection failed. Please click OK to go to home page.");
        window.location.href = '/Disaster Management System/pages/home.html';
      }
    } catch (error) {
      console.error("Login error:", error);
      let errorMessage = "Invalid email or password. Please try again.";
      
      // More specific error messages if needed
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        errorMessage = "Invalid email or password. Please try again.";
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = "Too many failed login attempts. Please try again later.";
      } else if (error.code === 'auth/user-disabled') {
        errorMessage = "This account has been disabled. Please contact support.";
      }
      
      alert(errorMessage);
    } finally {
      if (button) {
        // Reset button state
        button.disabled = false;
        button.innerHTML = '<i class="fas fa-sign-in-alt" style="margin-right: 8px;"></i>Login';
      }
    }
  }
  
  // Logout handler function
  async function handleLogout() {
    console.log("Logout handler triggered");
    
    try {
      // Sign out from Firebase
      await signOut(auth);
      console.log("Firebase sign out successful");
      
      // Clear local storage
      localStorage.removeItem('currentUser');
      console.log("Local storage cleared");
      
      // Redirect to login page with relative path (this will work regardless of server configuration)
      console.log("Redirecting to login page...");
      
      // Use a relative path that will work in different hosting environments
      window.location.href = "../pages/login.html";
      
      // If that fails, try a backup approach with a short timeout
      setTimeout(() => {
        if (!document.location.href.includes('login.html')) {
          console.log("Fallback redirection");
          window.location.href = "login.html";
        }
      }, 500);
    } catch (error) {
      console.error("Error during logout:", error);
      alert("Failed to log out. Please try again.");
    }
  }
  
  // Check authentication status
  function checkAuthStatus() {
    const currentUser = localStorage.getItem('currentUser');
    if (!currentUser) {
      console.log("No user logged in, redirecting to login page");
      
      // Don't redirect if already on login or signup page
      if (!window.location.pathname.includes("login.html") && 
          !window.location.pathname.includes("signup.html")) {
        window.location.replace("login.html");
      }
    } else {
      console.log("User is logged in");
      // Update UI with user info
      const userData = JSON.parse(currentUser);
      
      // Retrieve any stored profile data
      const storedUserProfile = localStorage.getItem('userProfile');
      let fullName = null;
      if (storedUserProfile) {
        try {
          const userProfile = JSON.parse(storedUserProfile);
          fullName = userProfile.fullName;
        } catch (e) {
          console.error("Error parsing stored user profile");
        }
      }
      
      // Dispatch an event with all available user information
      const authEvent = new CustomEvent('firebaseAuthStateChanged', {
        detail: {
          uid: userData.uid,
          email: userData.email,
          displayName: userData.displayName || fullName || (userData.email ? userData.email.split('@')[0] : "User"),
          fullName: fullName
        }
      });
      window.dispatchEvent(authEvent);
      
      // Update UI elements if they exist
      const usernameElement = document.getElementById('username');
      if (usernameElement) {
        // Display name prioritization: displayName > fullName > email username > "User"
        const displayName = userData.displayName || fullName || (userData.email ? userData.email.split('@')[0] : "User");
        usernameElement.textContent = displayName;
      }
      
      const dropdownUsername = document.getElementById('dropdownUsername');
      if (dropdownUsername) {
        const displayName = userData.displayName || fullName || (userData.email ? userData.email.split('@')[0] : "User");
        dropdownUsername.textContent = displayName;
      }
      
      const dropdownEmail = document.getElementById('dropdownEmail');
      if (dropdownEmail) {
        dropdownEmail.textContent = userData.email || "Not signed in";
      }
    }
  }

  // Add an auth state observer
  auth.onAuthStateChanged(user => {
    if (user) {
      // User is signed in
      console.log("Auth state changed: user signed in", user);
      
      // Get user info from localStorage in case we have more details from signup
      const storedUserInfo = localStorage.getItem('userProfile');
      let fullName = null;
      
      if (storedUserInfo) {
        try {
          const userProfile = JSON.parse(storedUserInfo);
          fullName = userProfile.fullName || null;
        } catch (e) {
          console.error("Error parsing stored user profile:", e);
        }
      }
      
      // Store user info in localStorage with enhanced data
      localStorage.setItem('currentUser', JSON.stringify({
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || fullName || (user.email ? user.email.split('@')[0] : 'User'),
        photoURL: user.photoURL || null,
        fullName: fullName,
        loggedIn: true
      }));
      
      // Dispatch event for other scripts to know user is authenticated
      // Include all relevant user information, prioritizing actual names
      const authEvent = new CustomEvent('firebaseAuthStateChanged', {
        detail: {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName || fullName || (user.email ? user.email.split('@')[0] : 'User'),
          photoURL: user.photoURL,
          emailVerified: user.emailVerified,
          fullName: fullName
        }
      });
      window.dispatchEvent(authEvent);
    } else {
      // User is signed out
      console.log("Auth state changed: user signed out");
      localStorage.removeItem('currentUser');
      
      // Dispatch event for other scripts to know user is signed out
      const authEvent = new CustomEvent('firebaseAuthStateChanged', {
        detail: null
      });
      window.dispatchEvent(authEvent);
    }
  });
});
