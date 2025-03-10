function logoutUser() {
     localStorage.removeItem("user");
     sessionStorage.clear();
     window.location.href = "front-end/logout.html";
 }
 