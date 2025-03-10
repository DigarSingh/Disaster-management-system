function togglePassword() {
    let passwordField = document.getElementById("password");
    passwordField.type = passwordField.type === "password" ? "text" : "password";
}

function loginUser(event) {
    event.preventDefault();
    
    let username = document.getElementById("username").value;
    let password = document.getElementById("password").value;

    // Dummy Authentication
    if (username === "admin" || "user" && password === "1234") {
        localStorage.setItem("user", username);
        alert("Login Successful!");
        window.location.href = "index.html"; 
    } else {
        alert("Invalid Credentials. Try again!");
    }
}
