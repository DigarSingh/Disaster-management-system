document.addEventListener('DOMContentLoaded', function() {
    const chatbotDialog = document.getElementById('chatbotDialog');
    const openChatbot = document.getElementById('openChatbot');
    const closeChatbot = document.getElementById('closeChatbot');
    const minimizeChatbot = document.getElementById('minimizeChatbot');
    const chatbotMessages = document.getElementById('chatbotMessages');
    const chatbotInput = document.getElementById('chatbotInput');
    const sendChatbot = document.getElementById('sendChatbot');
    
    let isMinimized = false;
    // Set initial height for the dialog
    const initialHeight = '450px';
    let dialogHeight = initialHeight;
    
    // Open chatbot dialog
    openChatbot.addEventListener('click', function() {
        chatbotDialog.classList.add('active');
        // Stop pulse animation when opened
        openChatbot.style.animation = 'none';
    });
    
    // Close chatbot dialog
    closeChatbot.addEventListener('click', function() {
        chatbotDialog.classList.remove('active');
        // Resume pulse animation when closed
        openChatbot.style.animation = 'pulse 2s infinite';
    });
    
    // Minimize/Maximize chatbot dialog
    minimizeChatbot.addEventListener('click', function() {
        if (isMinimized) {
            chatbotDialog.style.height = dialogHeight;
            chatbotMessages.style.display = 'flex';
            chatbotInput.style.display = 'flex';
            minimizeChatbot.textContent = '—';
            isMinimized = false;
        } else {
            dialogHeight = chatbotDialog.style.height || initialHeight;
            chatbotDialog.style.height = '60px';
            chatbotMessages.style.display = 'none';
            chatbotInput.style.display = 'none';
            minimizeChatbot.textContent = '□';
            isMinimized = true;
        }
    });
    
    // Send message
    function sendMessage() {
        const message = chatbotInput.value.trim();
        if (message) {
            // Add user message
            addMessage(message, 'user');
            chatbotInput.value = '';
            
            // Show typing indicator
            showTypingIndicator();
            
            // Simulate bot response after delay
            setTimeout(() => {
                hideTypingIndicator();
                botResponse(message);
            }, 1500);
        }
    }
    
    // Send on button click
    sendChatbot.addEventListener('click', sendMessage);
    
    // Send on Enter key
    chatbotInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });
    
    // Handle quick reply buttons
    chatbotMessages.addEventListener('click', function(e) {
        if (e.target.classList.contains('quick-reply-btn')) {
            const replyText = e.target.textContent;
            addMessage(replyText, 'user');
            
            // Show typing indicator
            showTypingIndicator();
            
            // Simulate bot response after delay
            setTimeout(() => {
                hideTypingIndicator();
                botResponse(replyText);
            }, 1500);
        }
    });
    
    // Add message to chat
    function addMessage(text, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message');
        messageDiv.classList.add(sender + '-message');
        
        // Add avatar based on sender
        if (sender === 'bot') {
            const avatar = document.createElement('div');
            avatar.classList.add('bot-avatar');
            avatar.textContent = '🤖';
            messageDiv.appendChild(avatar);
        } else {
            const avatar = document.createElement('div');
            avatar.classList.add('user-avatar');
            avatar.textContent = '👤';
            messageDiv.appendChild(avatar);
        }
        
        // Add message text
        const textDiv = document.createElement('div');
        textDiv.textContent = text;
        messageDiv.appendChild(textDiv);
        
        // Add timestamp
        const timeDiv = document.createElement('div');
        timeDiv.classList.add('message-time');
        timeDiv.textContent = 'Just now';
        messageDiv.appendChild(timeDiv);
        
        chatbotMessages.appendChild(messageDiv);
        
        // Scroll to bottom
        chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
    }
    
    // Show typing indicator
    function showTypingIndicator() {
        const typingDiv = document.createElement('div');
        typingDiv.classList.add('typing-indicator');
        typingDiv.id = 'typingIndicator';
        
        // Add the three dots
        for (let i = 0; i < 3; i++) {
            const dot = document.createElement('span');
            typingDiv.appendChild(dot);
        }
        
        chatbotMessages.appendChild(typingDiv);
        chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
    }
    
    // Hide typing indicator
    function hideTypingIndicator() {
        const typingIndicator = document.getElementById('typingIndicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }
    
    // Bot response based on user input
    function botResponse(userMessage) {
        let response;
        let quickReplies = [];
        
        // Convert to lowercase for easier matching
        const message = userMessage.toLowerCase();
        
        if (message.includes('emergency') || message.includes('help') || message.includes('report emergency')) {
            response = "If this is a life-threatening emergency, please call 911 immediately. Would you like to report an incident through our system?";
            quickReplies = ['Yes, report incident', 'No, just gathering info', 'Show emergency contacts'];
        } else if (message.includes('first aid') || message.includes('medical help')) {
            response = "Here are some basic first aid tips. Remember, these don't replace professional medical help:";
            quickReplies = ['CPR instructions', 'Bleeding control', 'Burn treatment'];
        } else if (message.includes('emergency contacts') || message.includes('phone') || message.includes('call')) {
            response = "Here are important emergency contacts:\n• Emergency Services: 911\n• Poison Control: 1-800-222-1222\n• Disaster Hotline: 1-800-123-4567";
            quickReplies = ['Show more contacts', 'Save contacts', 'Call emergency services'];
        } else {
            response = "I'm here to help with emergency information. What would you like to know about?";
            quickReplies = ['Emergency procedures', 'First Aid Tips', 'Report an incident'];
        }
        
        // Add bot response
        addMessage(response, 'bot');
        
        // Add quick replies if available
        if (quickReplies.length > 0) {
            addQuickReplies(quickReplies);
        }
    }
    
    // Add quick reply buttons
    function addQuickReplies(replies) {
        const quickRepliesDiv = document.createElement('div');
        quickRepliesDiv.classList.add('quick-replies');
        
        replies.forEach(reply => {
            const button = document.createElement('button');
            button.classList.add('quick-reply-btn');
            button.textContent = reply;
            quickRepliesDiv.appendChild(button);
        });
        
        // Append to the last bot message
        const messages = chatbotMessages.querySelectorAll('.bot-message');
        const lastBotMessage = messages[messages.length - 1];
        if (lastBotMessage) {
            lastBotMessage.appendChild(quickRepliesDiv);
        }
        
        // Scroll to bottom again after adding quick replies
        chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
    }
});
