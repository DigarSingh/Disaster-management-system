function logoutUser() {
     localStorage.removeItem("user");
     sessionStorage.clear();
     window.location.href = "logout.html";
 }
 