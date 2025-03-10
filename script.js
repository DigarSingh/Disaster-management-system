const track = document.querySelector('.slider-track');
const prev = document.getElementById('prev');
const next = document.getElementById('next');

let index = 1;  // Start at the first real image
const images = document.querySelectorAll('.slider-track img');
const totalImages = images.length;
const imgWidth = images[0].clientWidth + 20;  // Image width + margin

// Set initial position (start from 1st image, skipping duplicated ones)
track.style.transform = `translateX(${-index * imgWidth}px)`;

// Move Slider
function moveSlider(direction) {
    index += direction;
    
    track.style.transition = 'transform 0.5s ease-in-out';
    track.style.transform = `translateX(${-index * imgWidth}px)`;

    // Looping effect - Reset to the beginning without animation
    setTimeout(() => {
        if (index >= totalImages - 1) {
            index = 1;
            track.style.transition = 'none';
            track.style.transform = `translateX(${-index * imgWidth}px)`;
        } else if (index <= 0) {
            index = totalImages - 2;
            track.style.transition = 'none';
            track.style.transform = `translateX(${-index * imgWidth}px)`;
        }
    }, 500);
}

// Auto Slide every 3 seconds
setInterval(() => moveSlider(1), 3000);

prev.addEventListener('click', () => moveSlider(-1));
next.addEventListener('click', () => moveSlider(1));


function prevSlide() {
    if (index <= 0) {
        setTimeout(() => {
            slider.style.transition = "none";
            index = totalSlides - 1;
            slider.style.transform = `translateX(${-index * 100}vw)`;
        }, 500);
    }
    index--;
    slider.style.transition = "transform 0.5s ease-in-out";
    slider.style.transform = `translateX(${-index * 100}vw)`;
}

// Auto-slide every 3 seconds
setInterval(nextSlide, 3000);

document.getElementById("incidentForm").addEventListener("submit", function(event) {
     event.preventDefault();
     
     let incidentType = document.getElementById("incidentType").value;
     let date = document.getElementById("date").value;
     let time = document.getElementById("time").value;
     let location = document.getElementById("location").value;
     let description = document.getElementById("description").value;
 
     if (!incidentType || !date || !time || !location || !description) {
         alert("❗ Please fill all fields!");
         return;
     }
 
     let report = {
         type: incidentType,
         date: date,
         time: time,
         location: location,
         description: description
     };
 
     console.log("Incident Reported:", report);
     alert("✅ Incident reported successfully!");
 });
 
 function getLocation() {
     if (navigator.geolocation) {
         navigator.geolocation.getCurrentPosition(function(position) {
             document.getElementById("location").value = `https://www.google.com/maps?q=${position.coords.latitude},${position.coords.longitude}`;
         }, function(error) {
             alert("⚠️ Error getting location: " + error.message);
         });
     } else {
         alert("⚠️ Geolocation is not supported by this browser.");
     }
 }
 
 document.addEventListener("DOMContentLoaded", function () {
     const sosForm = document.getElementById("sosForm");
 
     if (sosForm) {
         sosForm.addEventListener("submit", function (event) {
             event.preventDefault(); // Prevent default form submission
 
             // Show a pop-up with a confirmation message
             Swal.fire({
                 icon: 'success',
                 title: '🚨 SOS Reported!',
                 text: 'Help is on the way.',
                 confirmButtonText: 'OK'
             }).then(() => {
                 // Redirect to main page after user clicks OK
                 window.location.href = "index.html";
             });
         });
     }
 });


