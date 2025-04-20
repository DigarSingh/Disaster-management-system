// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.18.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.18.0/firebase-analytics.js";
// Import Firebase authentication
import { getAuth, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.18.0/firebase-auth.js";
import { getFirestore, setDoc, doc } from 'https://www.gstatic.com/firebasejs/9.18.0/firebase-firestore.js'

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
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
// Initialize Firestore
const db = getFirestore(app);

// Ensure the DOM content is fully loaded
document.addEventListener('DOMContentLoaded', function() {
  console.log("Firebase signup.js script loaded and running");
  
  // Try to find the signup form or button
  const signupForm = document.getElementById('signupForm');
  const submitSignupBtn = document.getElementById('submitSignup');
  
  console.log("Form found:", !!signupForm);
  console.log("Submit button found:", !!submitSignupBtn);
  
  if (signupForm) {
    console.log("Attaching submit handler to form");
    
    signupForm.addEventListener('submit', handleSignup);
  } else if (submitSignupBtn) {
    console.log("Attaching click handler to button");
    
    submitSignupBtn.addEventListener('click', handleSignup);
  } else {
    console.error("Could not find signup form or button");
  }
  
  // Unified signup handler function
  async function handleSignup(event) {
    event.preventDefault();
    console.log("Signup handler triggered");
    
    // Get form inputs
    const email = document.getElementById('email')?.value;
    const password = document.getElementById('password')?.value;
    const fullname = document.getElementById('fullname')?.value;
    
    console.log("Form data:", { email: email ? "provided" : "missing", 
                               password: password ? "provided" : "missing", 
                               fullname: fullname ? "provided" : "missing" });
    
    // Validate inputs
    if (!email || !password || !fullname) {
      alert("Please fill all required fields");
      return;
    }
    
    // Get button for UI updates (could be the submit button or the clicked element)
    const button = submitSignupBtn || (event.target.tagName === 'BUTTON' ? event.target : 
                  signupForm.querySelector('button[type="submit"]'));
    
    if (button) {
      // Show loading state
      button.disabled = true;
      button.innerHTML = "Creating Account...";
    }
    
    try {
      console.log("Attempting to create user with Firebase");
      // Create user with email and password
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      console.log("User created successfully, storing in Firestore");
      // Store additional user data in Firestore
      await setDoc(doc(db, "users", user.uid), {
        fullname: fullname,
        email: email,
        createdAt: new Date().toISOString(),
      });
      
      alert("Account created successfully!");
      // Redirect to login page
      window.location.href = 'login.html';
    } catch (error) {
      console.error("Error during signup:", error);
      alert("Error: " + error.message);
    } finally {
      if (button) {
        // Reset button state
        button.disabled = false;
        button.innerHTML = "Sign Up <i class='fas fa-user-plus ml-2'></i>";
      }
    }
  }
});