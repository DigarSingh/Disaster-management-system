function sendSOS() {
     Swal.fire({
         title: "SOS Alert Sent!",
         text: "Your emergency request has been reported.",
         icon: "success",
         confirmButtonText: "OK"
     }).then(() => {
         window.location.href = "front-end/index.html";  // Redirect to home page after sending SOS
     });
 }
 
 function callEmergency(number) {
     Swal.fire({
         title: "Calling Emergency Number",
         text: `Dialing ${number}...`,
         icon: "info",
         confirmButtonText: "OK"
     });
 
     setTimeout(() => {
         window.location.href = `tel:${number}`;
     }, 2000);
 }
 