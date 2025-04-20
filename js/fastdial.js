document.addEventListener('DOMContentLoaded', function() {
    // Load custom contacts from localStorage
    loadCustomContacts();
    
    // Add event listeners to call buttons
    document.querySelectorAll('.call-btn').forEach(button => {
        button.addEventListener('click', function() {
            const number = this.closest('.contact-card').dataset.number;
            makePhoneCall(number);
        });
    });
    
    // Add event listener to "Add Contact" button
    document.getElementById('addContact').addEventListener('click', addNewContact);
});

// Function to simulate making a phone call
function makePhoneCall(number) {
    alert(`Calling ${number}...`);
    // In a real application, this would use the Web Telephony API or redirect to tel: protocol
    // window.location.href = `tel:${number}`;
}

// Function to load custom contacts from localStorage
function loadCustomContacts() {
    const customContacts = JSON.parse(localStorage.getItem('customContacts')) || [];
    const customContactsContainer = document.getElementById('customContacts');
    
    customContactsContainer.innerHTML = '';
    
    if (customContacts.length === 0) {
        customContactsContainer.innerHTML = '<p class="no-contacts">No custom contacts added yet</p>';
        return;
    }
    
    customContacts.forEach(contact => {
        const contactCard = createContactCard(contact.name, contact.number);
        customContactsContainer.appendChild(contactCard);
    });
}

// Function to create a contact card element
function createContactCard(name, number) {
    const card = document.createElement('div');
    card.className = 'contact-card custom';
    card.dataset.number = number;
    
    card.innerHTML = `
        <h3>${name}</h3>
        <p class="number">${number}</p>
        <div class="button-group">
            <button class="call-btn">Call</button>
            <button class="delete-btn"><i class="fas fa-trash"></i></button>
        </div>
    `;
    
    // Add event listeners to the buttons
    card.querySelector('.call-btn').addEventListener('click', function() {
        makePhoneCall(number);
    });
    
    card.querySelector('.delete-btn').addEventListener('click', function() {
        deleteContact(name, number);
    });
    
    return card;
}

// Function to add a new contact
function addNewContact() {
    const name = prompt('Enter contact name:');
    if (!name) return;
    
    const number = prompt('Enter phone number:');
    if (!number) return;
    
    // Validate phone number (simple validation)
    if (!/^\d+$/.test(number)) {
        alert('Please enter a valid phone number (digits only)');
        return;
    }
    
    // Save to localStorage
    const customContacts = JSON.parse(localStorage.getItem('customContacts')) || [];
    customContacts.push({ name, number });
    localStorage.setItem('customContacts', JSON.stringify(customContacts));
    
    // Refresh the displayed contacts
    loadCustomContacts();
}

// Function to delete a contact
function deleteContact(name, number) {
    if (confirm(`Are you sure you want to delete ${name}?`)) {
        const customContacts = JSON.parse(localStorage.getItem('customContacts')) || [];
        const updatedContacts = customContacts.filter(
            contact => !(contact.name === name && contact.number === number)
        );
        localStorage.setItem('customContacts', JSON.stringify(updatedContacts));
        
        // Refresh the displayed contacts
        loadCustomContacts();
    }
}
