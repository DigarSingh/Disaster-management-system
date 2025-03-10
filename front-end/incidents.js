document.addEventListener("DOMContentLoaded", function () {
     // Set current date and time
     const dateTimeField = document.getElementById("dateTime");
     const now = new Date();
     dateTimeField.value = now.toLocaleString();
 });

 function incidents() {
     Swal.fire({
         title: "SOS Alert Sent!",
         text: "Your emergency request has been reported.",
         icon: "success",
         confirmButtonText: "OK"
     }).then(() => {
         window.location.href = "front-end/index.html";  // Redirect to home page after sending SOS
     });
 }

 // Function to fetch user location
 function getLocation() {
     if (navigator.geolocation) {
         navigator.geolocation.getCurrentPosition(
             (position) => {
                 const latitude = position.coords.latitude;
                 const longitude = position.coords.longitude;
                 document.getElementById("location").value = `Lat: ${latitude}, Lng: ${longitude}`;
             },
             (error) => {
                 alert("Error fetching location: " + error.message);
             }
         );
     } else {
         alert("Geolocation is not supported by this browser.");
     }
 }
 
 // Incident submission handler
 document.getElementById("incidentForm").addEventListener("submit", function(event) {
     event.preventDefault(); // Prevent form submission
 
     // Get form values
     const type = document.getElementById("incidentType").value;
     const location = document.getElementById("location").value;
     const dateTime = document.getElementById("dateTime").value;
     const description = document.getElementById("description").value;
     const imageInput = document.getElementById("imageUpload");
     
     // Validate input
     if (location.trim() === "" || description.trim() === "") {
         Swal.fire({
             title: "Error!",
             text: "Please fill in all fields.",
             icon: "error",
             confirmButtonText: "OK"
          }).then(() => {
               window.location.href = "front-end/index.html";  // Redirect to home page after sending SOS
           });
         return;
     }
 
     // Read uploaded image
     let imageUrl = "";
     if (imageInput.files.length > 0) {
         const reader = new FileReader();
         reader.onload = function (e) {
             imageUrl = e.target.result;
 
             // Add incident to the list
             addIncidentToList(type, location, dateTime, description, imageUrl);
         };
         reader.readAsDataURL(imageInput.files[0]);
     } else {
         addIncidentToList(type, location, dateTime, description, ""); // No image uploaded
     }
 
     // Clear form fields
     document.getElementById("incidentForm").reset();
 });
 
 // Function to add reported incidents to the list
 function addIncidentToList(type, location, dateTime, description, imageUrl) {
     const incidentList = document.getElementById("incidentList");
     const li = document.createElement("li");
     li.innerHTML = `
         <strong>${type}</strong> - ${location} <br>
         <small>${dateTime}</small> <br>
         ${description} <br>
         ${imageUrl ? `<img src="${imageUrl}" alt="Incident Image" style="max-width: 100%; margin-top: 10px;">` : ""}
     `;
     incidentList.appendChild(li);
 
     Swal.fire({
         title: "Incident Reported!",
         text: "Your report has been submitted successfully.",
         icon: "success",
         confirmButtonText: "OK"
     });
 }
 