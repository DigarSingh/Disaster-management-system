// Simulate real-time chat with stored messages
const messages = JSON.parse(localStorage.getItem('messages')) || [];

// Function to display messages
function displayMessages() {
    const chatMessages = document.getElementById('chatMessages');
    if (!chatMessages) return;
    
    chatMessages.innerHTML = '';
    
    if (messages.length === 0) {
        chatMessages.innerHTML = '<p class="text-center">No messages yet. Be the first to write!</p>';
        return;
    }
    
    messages.forEach(message => {
        const messageElement = document.createElement('div');
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        
        // Determine if message is sent by current user
        const isSent = currentUser && message.userId === currentUser.id;
        messageElement.className = `message ${isSent ? 'sent' : 'received'}`;
        
        // Format date
        const date = new Date(message.timestamp);
        const formattedTime = `${date.toLocaleDateString()} ${date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`;
        
        messageElement.innerHTML = `
            <div class="sender">${message.userName}</div>
            <div class="content">${message.content}</div>
            <div class="time">${formattedTime}</div>
        `;
        
        chatMessages.appendChild(messageElement);
    });
    
    // Scroll to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Handle sending messages
const sendMessageBtn = document.getElementById('sendMessage');
const messageInput = document.getElementById('messageInput');

if (sendMessageBtn && messageInput) {
    sendMessageBtn.addEventListener('click', sendMessage);
    messageInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });
}

function sendMessage() {
    if (!messageInput.value.trim()) return;
    
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) {
        alert('You must be logged in to send messages.');
        return;
    }
    
    const newMessage = {
        id: Date.now().toString(),
        userId: currentUser.id,
        userName: currentUser.fullname,
        content: messageInput.value.trim(),
        timestamp: Date.now()
    };
    
    messages.push(newMessage);
    localStorage.setItem('messages', JSON.stringify(messages));
    
    messageInput.value = '';
    displayMessages();
    
    // Simulate receiving a response (for demo purposes)
    simulateResponse();
}

// Simulate responses
function simulateResponse() {
    // Only simulate responses sometimes
    if (Math.random() < 0.7) {
        const responses = [
            "Thank you for the update!",
            "I'm heading to the location now.",
            "Has anyone contacted emergency services?",
            "Stay safe everyone!",
            "How can I help with this situation?",
            "Are there any updates on this?",
            "I'm nearby and can offer assistance.",
            "Please provide more details if possible."
        ];
        
        const botUsers = [
            {id: 'bot1', fullname: 'Emergency Responder'},
            {id: 'bot2', fullname: 'Community Volunteer'},
            {id: 'bot3', fullname: 'Local Authority'}
        ];
        
        // Random delay between 1-3 seconds
        const delay = 1000 + Math.random() * 2000;
        
        setTimeout(() => {
            const botUser = botUsers[Math.floor(Math.random() * botUsers.length)];
            const responseText = responses[Math.floor(Math.random() * responses.length)];
            
            const botMessage = {
                id: Date.now().toString(),
                userId: botUser.id,
                userName: botUser.fullname,
                content: responseText,
                timestamp: Date.now()
            };
            
            messages.push(botMessage);
            localStorage.setItem('messages', JSON.stringify(messages));
            displayMessages();
        }, delay);
    }
}

// Initialize messages if we're on home page
if (document.getElementById('chatMessages')) {
    displayMessages();
    
    // If no messages yet, add a welcome message
    if (messages.length === 0) {
        const welcomeMessage = {
            id: 'welcome',
            userId: 'system',
            userName: 'Disaster Management System',
            content: 'Welcome to the community chat! This is a space for sharing information and coordinating during emergencies. Please be respectful and helpful.',
            timestamp: Date.now()
        };
        
        messages.push(welcomeMessage);
        localStorage.setItem('messages', JSON.stringify(messages));
        displayMessages();
    }
}

document.addEventListener('DOMContentLoaded', function() {
    // Chat room selection
    const chatRooms = document.querySelectorAll('.chat-room');
    
    chatRooms.forEach(room => {
        room.addEventListener('click', function() {
            // Remove active class from all rooms
            chatRooms.forEach(r => r.classList.remove('active'));
            
            // Add active class to clicked room
            this.classList.add('active');
            
            // Update chat header with room info
            const roomIcon = this.querySelector('.room-icon').cloneNode(true);
            const roomName = this.querySelector('.room-name').textContent;
            
            const chatRoomInfo = document.querySelector('.chat-room-info');
            if (chatRoomInfo) {
                chatRoomInfo.querySelector('.room-icon').className = roomIcon.className;
                chatRoomInfo.querySelector('.room-icon i').className = roomIcon.querySelector('i').className;
                chatRoomInfo.querySelector('h3').textContent = roomName;
                
                // Clear the unread count
                const unreadBadge = this.querySelector('.unread-count');
                if (unreadBadge) {
                    unreadBadge.remove();
                }
            }
            
            // Simulate loading messages (in a real app, fetch messages from server)
            simulateMessageLoading();
        });
    });
    
    // Send message functionality
    const messageInput = document.getElementById('messageInput');
    const sendButton = document.getElementById('sendMessage');
    
    function sendMessage() {
        if (messageInput.value.trim() === '') return;
        
        const messageText = messageInput.value;
        const messagesContainer = document.getElementById('chatMessages');
        
        // Create message element
        const messageEl = document.createElement('div');
        messageEl.className = 'message sent';
        
        const now = new Date();
        const timeString = `${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}`;
        
        messageEl.innerHTML = `
            <div class="message-content-wrapper">
                <div class="message-content">
                    <p>${messageText}</p>
                </div>
                <div class="message-meta">
                    <span class="message-time">${timeString}</span>
                    <span class="message-status"><i class="fas fa-check"></i></span>
                </div>
            </div>
        `;
        
        // Add message to chat
        messagesContainer.appendChild(messageEl);
        
        // Scroll to bottom
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
        
        // Clear input
        messageInput.value = '';
        
        // Focus input for next message
        messageInput.focus();
        
        // Simulate message being seen after a delay
        setTimeout(() => {
            const statusIcon = messageEl.querySelector('.message-status i');
            statusIcon.className = 'fas fa-check-double';
        }, 2000);
        
        // Simulate reply after a delay
        setTimeout(() => {
            showTypingIndicator();
            
            setTimeout(() => {
                hideTypingIndicator();
                simulateReply();
            }, 3000);
        }, 1500);
    }
    
    // Add event listeners for sending messages
    if (sendButton) {
        sendButton.addEventListener('click', sendMessage);
    }
    
    if (messageInput) {
        messageInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
            }
        });
    }
    
    // Simulate message loading
    function simulateMessageLoading() {
        const messagesContainer = document.getElementById('chatMessages');
        
        // Show loading state
        messagesContainer.innerHTML = `
            <div class="message-loading">
                <div class="loading-spinner"></div>
                <p>Loading messages...</p>
            </div>
        `;
        
        // Simulate delay
        setTimeout(() => {
            // The messages will be replaced with actual chat history
            messagesContainer.innerHTML = `
                <div class="message-date-divider">
                    <span>Today</span>
                </div>
                
                <div class="message received">
                    <div class="message-avatar">
                        <img src="https://i.pravatar.cc/100?img=7" alt="User">
                    </div>
                    <div class="message-content-wrapper">
                        <div class="message-sender">John Smith <span class="sender-badge emergency">Emergency Response</span></div>
                        <div class="message-content">
                            <p>Welcome to the chat room! Feel free to ask any questions.</p>
                        </div>
                        <div class="message-meta">
                            <span class="message-time">10:24 AM</span>
                        </div>
                    </div>
                </div>
            `;
        }, 1000);
    }
    
    // Show typing indicator
    function showTypingIndicator() {
        const messagesContainer = document.getElementById('chatMessages');
        const typingIndicator = document.createElement('div');
        typingIndicator.className = 'typing-indicator';
        typingIndicator.id = 'typingIndicator';
        
        typingIndicator.innerHTML = `
            <div class="typing-avatar">
                <img src="https://i.pravatar.cc/100?img=8" alt="User">
            </div>
            <div class="typing-bubbles">
                <span></span>
                <span></span>
                <span></span>
            </div>
        `;
        
        messagesContainer.appendChild(typingIndicator);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
    
    // Hide typing indicator
    function hideTypingIndicator() {
        const typingIndicator = document.getElementById('typingIndicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }
    
    // Simulate reply
    function simulateReply() {
        const messagesContainer = document.getElementById('chatMessages');
        const messageEl = document.createElement('div');
        messageEl.className = 'message received';
        
        const now = new Date();
        const timeString = `${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}`;
        
        const responses = [
            "Thanks for sharing that information!",
            "I'll make a note of this for our records.",
            "This will be helpful for our community members.",
            "Good to know! I'll share this with the team.",
            "Is there anything else we should be aware of?"
        ];
        
        const randomResponse = responses[Math.floor(Math.random() * responses.length)];
        
        messageEl.innerHTML = `
            <div class="message-avatar">
                <img src="https://i.pravatar.cc/100?img=8" alt="User">
            </div>
            <div class="message-content-wrapper">
                <div class="message-sender">Emily Johnson <span class="sender-badge coordinator">Coordinator</span></div>
                <div class="message-content">
                    <p>${randomResponse}</p>
                </div>
                <div class="message-meta">
                    <span class="message-time">${timeString}</span>
                </div>
            </div>
        `;
        
        // Add animation class
        messageEl.style.animation = 'slideInUp 0.3s ease-out';
        
        // Add message to chat
        messagesContainer.appendChild(messageEl);
        
        // Scroll to bottom
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
    
    // Initialize by showing first chat room messages
    simulateMessageLoading();
});

// Function to initialize message expiration system
function initMessageExpirationSystem() {
    // Set interval to check for expired messages every minute
    setInterval(clearExpiredMessages, 60000);
    
    // Add expiration timestamp to existing messages
    addTimestampsToExistingMessages();
    
    // Add event listener to send button
    const sendButton = document.getElementById('sendMessage');
    if (sendButton) {
        sendButton.addEventListener('click', function() {
            sendMessageWithExpiration();
        });
    }
    
    // Add event listener for Enter key in message input
    const messageInput = document.getElementById('messageInput');
    if (messageInput) {
        messageInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                sendMessageWithExpiration();
            }
        });
    }
    
    // Add notice about message expiration
    addExpirationNotice();
}

// Function to add timestamps to existing messages
function addTimestampsToExistingMessages() {
    const chatMessages = document.getElementById('chatMessages');
    if (!chatMessages) return;
    
    const messages = chatMessages.querySelectorAll('.message');
    const currentTime = new Date().getTime();
    
    messages.forEach(message => {
        if (!message.dataset.timestamp) {
            // Add random timestamp within the last 30 minutes for demo purposes
            const randomMinutes = Math.floor(Math.random() * 30);
            const timestamp = currentTime - (randomMinutes * 60 * 1000);
            message.dataset.timestamp = timestamp;
            
            // Add expiration indicator
            const messageContent = message.querySelector('.message-content-wrapper, .message-content');
            if (messageContent) {
                const timeMeta = messageContent.querySelector('.message-meta');
                if (timeMeta) {
                    const expirationSpan = document.createElement('span');
                    expirationSpan.className = 'message-expiration';
                    expirationSpan.innerHTML = '<i class="fas fa-clock"></i> Expires in ' + (60 - randomMinutes) + ' min';
                    timeMeta.appendChild(expirationSpan);
                }
            }
        }
    });
}

// Function to send a new message with expiration timestamp
function sendMessageWithExpiration() {
    const messageInput = document.getElementById('messageInput');
    const chatMessages = document.getElementById('chatMessages');
    
    if (!messageInput || !chatMessages || !messageInput.value.trim()) return;
    
    const messageText = messageInput.value.trim();
    const currentTime = new Date().getTime();
    const formattedTime = formatTime(new Date());
    
    // Create new message element
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message sent';
    messageDiv.dataset.timestamp = currentTime;
    
    messageDiv.innerHTML = `
        <div class="message-content-wrapper">
            <div class="message-content">
                <p>${messageText}</p>
            </div>
            <div class="message-meta">
                <span class="message-time">${formattedTime}</span>
                <span class="message-expiration"><i class="fas fa-clock"></i> Expires in 60 min</span>
                <span class="message-status"><i class="fas fa-check-double"></i></span>
            </div>
        </div>
    `;
    
    // Add message to chat
    chatMessages.appendChild(messageDiv);
    
    // Scroll to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    // Clear input
    messageInput.value = '';
    
    // Update expiration counters
    updateExpirationCounters();
}

// Function to clear messages older than 1 hour
function clearExpiredMessages() {
    const chatMessages = document.getElementById('chatMessages');
    if (!chatMessages) return;
    
    const messages = chatMessages.querySelectorAll('.message');
    const currentTime = new Date().getTime();
    const oneHourInMs = 60 * 60 * 1000;
    
    messages.forEach(message => {
        const timestamp = parseInt(message.dataset.timestamp);
        if (timestamp && (currentTime - timestamp > oneHourInMs)) {
            // Add fade-out animation
            message.classList.add('message-expired');
            
            // Remove after animation completes
            setTimeout(() => {
                message.remove();
            }, 500);
        }
    });
    
    // Update expiration counters for remaining messages
    updateExpirationCounters();
}

// Function to update expiration counters for all messages
function updateExpirationCounters() {
    const chatMessages = document.getElementById('chatMessages');
    if (!chatMessages) return;
    
    const messages = chatMessages.querySelectorAll('.message');
    const currentTime = new Date().getTime();
    const oneHourInMs = 60 * 60 * 1000;
    
    messages.forEach(message => {
        const timestamp = parseInt(message.dataset.timestamp);
        if (timestamp) {
            const elapsedMs = currentTime - timestamp;
            const remainingMs = oneHourInMs - elapsedMs;
            
            if (remainingMs > 0) {
                const remainingMinutes = Math.ceil(remainingMs / (60 * 1000));
                
                const expirationSpan = message.querySelector('.message-expiration');
                if (expirationSpan) {
                    expirationSpan.innerHTML = `<i class="fas fa-clock"></i> Expires in ${remainingMinutes} min`;
                    
                    // Add warning color when less than 10 minutes remaining
                    if (remainingMinutes <= 10) {
                        expirationSpan.classList.add('expiring-soon');
                    }
                }
            }
        }
    });
}

// Helper function to format time as HH:MM AM/PM
function formatTime(date) {
    let hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    
    hours = hours % 12;
    hours = hours ? hours : 12; // Hour '0' should be '12'
    const minutesStr = minutes < 10 ? '0' + minutes : minutes;
    
    return hours + ':' + minutesStr + ' ' + ampm;
}

// Function to add expiration notice to chat header
function addExpirationNotice() {
    const chatHeader = document.querySelector('.chat-header');
    if (!chatHeader) return;
    
    const noticeDiv = document.createElement('div');
    noticeDiv.className = 'chat-expiration-notice';
    noticeDiv.innerHTML = '<i class="fas fa-info-circle"></i> Messages are automatically cleared after 1 hour';
    
    chatHeader.appendChild(noticeDiv);
}

// Initialize when document is loaded
document.addEventListener('DOMContentLoaded', function() {
    initMessageExpirationSystem();
    
    // Set up interval to update expiration counters every minute
    setInterval(updateExpirationCounters, 60000);
});

document.addEventListener('DOMContentLoaded', function() {
    // Initialize community features
    initCommunityFeatures();
});

function initCommunityFeatures() {
    // Add clear chat button to the chat header
    addClearChatButton();
    
    // Initialize send message functionality
    initSendMessage();
}

function addClearChatButton() {
    const chatHeader = document.querySelector('.chat-header');
    if (!chatHeader) return;
    
    // Create clear chat button
    const clearButton = document.createElement('button');
    clearButton.className = 'btn-icon clear-chat-btn';
    clearButton.innerHTML = '<i class="fas fa-trash"></i> Clear Chat';
    clearButton.title = 'Clear all messages';
    
    // Add button to chat room info container
    const roomInfo = chatHeader.querySelector('.chat-room-info');
    if (roomInfo) {
        roomInfo.appendChild(clearButton);
    } else {
        // If no room info container, add directly to header with some styling
        clearButton.style.marginLeft = 'auto';
        chatHeader.appendChild(clearButton);
    }
    
    // Add click event to clear messages
    clearButton.addEventListener('click', clearAllMessages);
}

function clearAllMessages() {
    // Show confirmation dialog
    if (confirm('Are you sure you want to clear all messages?')) {
        const chatMessages = document.getElementById('chatMessages');
        
        if (chatMessages) {
            // Add fade-out animation to all messages
            const messages = chatMessages.querySelectorAll('.message');
            
            if (messages.length === 0) {
                alert('No messages to clear.');
                return;
            }
            
            messages.forEach(message => {
                message.classList.add('message-expired');
            });
            
            // Remove messages after animation completes
            setTimeout(() => {
                while (chatMessages.firstChild) {
                    chatMessages.removeChild(chatMessages.firstChild);
                }
                
                // Add a system message indicating chat was cleared
                const systemMessage = document.createElement('div');
                systemMessage.className = 'message-date-divider';
                systemMessage.innerHTML = '<span>Chat cleared</span>';
                chatMessages.appendChild(systemMessage);
            }, 500);
        }
    }
}

function initSendMessage() {
    // Add event listener to send button
    const sendButton = document.getElementById('sendMessage');
    if (sendButton) {
        sendButton.addEventListener('click', sendNewMessage);
    }
    
    // Add event listener for Enter key in message input
    const messageInput = document.getElementById('messageInput');
    if (messageInput) {
        messageInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                sendNewMessage();
            }
        });
    }
}

function sendNewMessage() {
    const messageInput = document.getElementById('messageInput');
    const chatMessages = document.getElementById('chatMessages');
    
    if (!messageInput || !chatMessages || !messageInput.value.trim()) return;
    
    const messageText = messageInput.value.trim();
    const currentTime = new Date();
    const formattedTime = formatTime(currentTime);
    
    // Create new message element
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message sent';
    
    messageDiv.innerHTML = `
        <div class="message-content-wrapper">
            <div class="message-content">
                <p>${messageText}</p>
            </div>
            <div class="message-meta">
                <span class="message-time">${formattedTime}</span>
                <span class="message-status"><i class="fas fa-check-double"></i></span>
            </div>
        </div>
    `;
    
    // Add message to chat
    chatMessages.appendChild(messageDiv);
    
    // Scroll to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    // Clear input
    messageInput.value = '';
}

function formatTime(date) {
    let hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    
    hours = hours % 12;
    hours = hours ? hours : 12; // Hour '0' should be '12'
    const minutesStr = minutes < 10 ? '0' + minutes : minutes;
    
    return hours + ':' + minutesStr + ' ' + ampm;
}
