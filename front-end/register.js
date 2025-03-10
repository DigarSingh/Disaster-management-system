// Toggle Password Visibility
function togglePassword() {
     let passwordField = document.getElementById("password");
     passwordField.type = passwordField.type === "password" ? "text" : "password";
 }
 
 // Handle Registration
 function registerUser(event) {
     event.preventDefault();
     
     let fullname = document.getElementById("fullname").value;
     let username = document.getElementById("username").value;
     let email = document.getElementById("email").value;
     let password = document.getElementById("password").value;
 
     // Save to Local Storage (Fake Database)
     let users = JSON.parse(localStorage.getItem("users")) || [];
     
     let existingUser = users.find(user => user.username === username || user.email === email);
     if (existingUser) {
         alert("User already exists! Try a different username or email.");
         return false;
     }
 
     users.push({ fullname, username, email, password });
     localStorage.setItem("users", JSON.stringify(users));
 
     alert("Registration Successful! You can now log in.");
     window.location.href = "login.html"; // Redirect to login page
 }
 