document.addEventListener("DOMContentLoaded", function () {
     loadPosts();
 });
 
 function submitPost() {
     let postInput = document.getElementById("postInput").value.trim();
     
     if (postInput === "") {
         Swal.fire({
             icon: 'error',
             title: 'Oops...',
             text: 'Please write something before posting!',
         });
         return;
     }
 
     let postData = {
         text: postInput,
         timestamp: new Date().toLocaleString()
     };
 
     let posts = JSON.parse(localStorage.getItem("communityPosts")) || [];
     posts.unshift(postData);
     localStorage.setItem("communityPosts", JSON.stringify(posts));
 
     document.getElementById("postInput").value = ""; // Clear input
     loadPosts(); // Refresh posts
 
     Swal.fire({
         icon: 'success',
         title: 'Post Shared!',
         text: 'Your update has been posted successfully.',
     });
 }
 
 function loadPosts() {
     let postsContainer = document.getElementById("postsContainer");
     postsContainer.innerHTML = "";
 
     let posts = JSON.parse(localStorage.getItem("communityPosts")) || [];
 
     posts.forEach(post => {
         let postDiv = document.createElement("div");
         postDiv.classList.add("post");
         postDiv.innerHTML = `<p>${post.text}</p><small>${post.timestamp}</small>`;
         postsContainer.appendChild(postDiv);
     });
 }
 