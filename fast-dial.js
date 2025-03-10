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
 