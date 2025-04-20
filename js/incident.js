// Initialize incidents from localStorage
const incidents = JSON.parse(localStorage.getItem('incidents')) || [];

// Function to display recent incidents on dashboard
function displayRecentIncidents() {
    const recentIncidentsList = document.getElementById('recentIncidents');
    if (!recentIncidentsList) return;
    
    recentIncidentsList.innerHTML = '';
    
    // Sort incidents by date (most recent first)
    const sortedIncidents = [...incidents].sort((a, b) => b.timestamp - a.timestamp);
    
    // Display only the 5 most recent incidents
    const recentIncidents = sortedIncidents.slice(0, 5);
    
    if (recentIncidents.length === 0) {
        recentIncidentsList.innerHTML = '<p>No incidents reported yet.</p>';
        return;
    }
    
    recentIncidents.forEach(incident => {
        const incidentItem = document.createElement('div');
        incidentItem.className = 'incident-item';
        
        // Set border color based on severity
        if (incident.severity === 'critical') {
            incidentItem.style.borderLeftColor = 'red';
        } else if (incident.severity === 'high') {
            incidentItem.style.borderLeftColor = 'orange';
        }
        
        // Format date
        const date = new Date(incident.timestamp);
        const formattedDate = `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
        
        incidentItem.innerHTML = `
            <h4>${incident.type.charAt(0).toUpperCase() + incident.type.slice(1)} at ${incident.location}</h4>
            <p>${incident.description}</p>
            <p><strong>Severity:</strong> ${incident.severity.charAt(0).toUpperCase() + incident.severity.slice(1)}</p>
            <p><strong>Reported:</strong> ${formattedDate}</p>
        `;
        
        recentIncidentsList.appendChild(incidentItem);
    });
}

// Get user's current location
function getCurrentLocation() {
    const locationInput = document.getElementById('location');
    const locationButton = document.getElementById('getLocationBtn');
    
    if (!locationButton) return;
    
    // Show loading state
    const originalBtnText = locationButton.innerHTML;
    locationButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Locating...';
    locationButton.disabled = true;
    
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                // Get coordinates
                const latitude = position.coords.latitude;
                const longitude = position.coords.longitude;
                
                // Set coordinates in the location field
                locationInput.value = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
                
                // Try to get a readable address if possible
                fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`)
                    .then(response => response.json())
                    .then(data => {
                        if (data.display_name) {
                            locationInput.value = data.display_name;
                        }
                    })
                    .catch(error => {
                        console.error("Error getting address:", error);
                    })
                    .finally(() => {
                        // Reset button state
                        locationButton.innerHTML = originalBtnText;
                        locationButton.disabled = false;
                    });
            },
            (error) => {
                // Handle errors
                let errorMessage;
                switch(error.code) {
                    case error.PERMISSION_DENIED:
                        errorMessage = "Location access denied";
                        break;
                    case error.POSITION_UNAVAILABLE:
                        errorMessage = "Location unavailable";
                        break;
                    case error.TIMEOUT:
                        errorMessage = "Location request timed out";
                        break;
                    default:
                        errorMessage = "Unknown location error";
                }
                
                // Show error message
                locationInput.placeholder = errorMessage;
                
                // Reset button state
                locationButton.innerHTML = originalBtnText;
                locationButton.disabled = false;
            }
        );
    } else {
        locationInput.placeholder = "Geolocation not supported by your browser";
        locationButton.innerHTML = originalBtnText;
        locationButton.disabled = false;
    }
}

// Initialize the incident form
function initIncidentForm() {
    const locationField = document.getElementById('location');
    if (!locationField) return;
    
    // Create a wrapper div around the location input for proper layout
    const wrapper = document.createElement('div');
    wrapper.className = 'location-input-wrapper';
    
    // Create the get location button - now bigger and more prominent
    const getLocationBtn = document.createElement('button');
    getLocationBtn.id = 'getLocationBtn';
    getLocationBtn.type = 'button';
    getLocationBtn.className = 'big-location-btn';
    getLocationBtn.innerHTML = '<i class="fas fa-map-marker-alt"></i> Get Location';
    getLocationBtn.title = 'Get my current location';
    getLocationBtn.addEventListener('click', getCurrentLocation);
    
    // Replace the input with the wrapper containing input and button
    locationField.parentNode.insertBefore(wrapper, locationField);
    wrapper.appendChild(locationField);
    wrapper.appendChild(getLocationBtn);
    
    // Add modern styling to the form
    const incidentForm = document.getElementById('incidentForm');
    if (incidentForm) {
        // Check if form is already in a container, if not wrap it
        if (!incidentForm.parentElement.classList.contains('modern-form-container')) {
            // Create a container for the form to enable centering
            const formContainer = document.createElement('div');
            formContainer.className = 'modern-form-container';
            
            // Insert the container before the form and move the form inside
            incidentForm.parentNode.insertBefore(formContainer, incidentForm);
            formContainer.appendChild(incidentForm);
        }
        
        // Add the form styling
        incidentForm.classList.add('modern-form', 'fade-in-up');
        
        // Add a heading if it doesn't exist
        if (!incidentForm.querySelector('h2')) {
            const heading = document.createElement('h2');
            heading.textContent = 'Report an Incident';
            incidentForm.insertBefore(heading, incidentForm.firstChild);
        }
        
        // Add animation to form elements
        const formGroups = incidentForm.querySelectorAll('.form-group');
        formGroups.forEach((group, index) => {
            group.style.animationDelay = `${0.1 * index}s`;
            group.classList.add('fade-in');
        });
    }
}

// Handle incident form submission
const incidentForm = document.getElementById('incidentForm');
if (incidentForm) {
    // Initialize the form with enhanced UI
    initIncidentForm();
    
    incidentForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (!currentUser) {
            // Create a modern alert message
            const alertContainer = document.createElement('div');
            alertContainer.className = 'alert alert-danger fade-in';
            alertContainer.innerHTML = '<i class="fas fa-exclamation-circle"></i> You must be logged in to report an incident.';
            
            // Insert it before the form
            incidentForm.parentNode.insertBefore(alertContainer, incidentForm);
            
            // Remove after 5 seconds
            setTimeout(() => {
                alertContainer.classList.add('fade-out');
                setTimeout(() => alertContainer.remove(), 500);
            }, 5000);
            return;
        }
        
        // Show loading state
        const submitBtn = incidentForm.querySelector('button[type="submit"]');
        const originalBtnText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';
        submitBtn.disabled = true;
        
        const newIncident = {
            id: Date.now().toString(),
            type: document.getElementById('incidentType').value,
            location: document.getElementById('location').value,
            description: document.getElementById('description').value,
            severity: document.getElementById('severity').value,
            reportedBy: currentUser.id,
            timestamp: Date.now()
        };
        
        // Simulate slight delay for better UX
        setTimeout(() => {
            // Add to incidents array
            incidents.push(newIncident);
            
            // Save to localStorage
            localStorage.setItem('incidents', JSON.stringify(incidents));
            
            // Reset form
            incidentForm.reset();
            
            // Reset button state
            submitBtn.innerHTML = originalBtnText;
            submitBtn.disabled = false;
            
            // Update dashboard
            displayRecentIncidents();
            
            // Show success message
            const successMessage = document.createElement('div');
            successMessage.className = 'alert alert-success fade-in';
            successMessage.innerHTML = '<i class="fas fa-check-circle"></i> Incident reported successfully!';
            
            incidentForm.parentNode.insertBefore(successMessage, incidentForm);
            
            // Remove success message after 5 seconds
            setTimeout(() => {
                successMessage.classList.add('fade-out');
                setTimeout(() => successMessage.remove(), 500);
            }, 5000);
            
            // Show dashboard
            document.querySelectorAll('.section').forEach(section => {
                section.classList.remove('active');
            });
            document.getElementById('dashboard').classList.add('active');
            
            // Update nav active state
            document.querySelectorAll('nav ul li').forEach(item => {
                item.classList.remove('active');
            });
            document.querySelector('nav ul li:first-child').classList.add('active');
        }, 1000);
    });
}

// Initialize dashboard if we're on home page
if (document.getElementById('dashboard')) {
    displayRecentIncidents();
}

document.addEventListener('DOMContentLoaded', function() {
    // Initialize map for location selection if available
    if (document.getElementById('locationMap')) {
        initLocationMap();
    }

    // Severity range slider logic
    const severityRange = document.getElementById('severityRange');
    const severitySelect = document.getElementById('severity');
    
    if (severityRange && severitySelect) {
        severityRange.addEventListener('input', function() {
            const value = parseInt(this.value);
            let severityValue;
            
            switch(value) {
                case 1:
                    severityValue = 'low';
                    break;
                case 2:
                    severityValue = 'medium';
                    break;
                case 3:
                    severityValue = 'high';
                    break;
                case 4:
                    severityValue = 'critical';
                    break;
            }
            
            severitySelect.value = severityValue;
        });
    }
    
    // Character count for description
    const descriptionField = document.getElementById('description');
    const charCount = document.getElementById('charCount');
    
    if (descriptionField && charCount) {
        descriptionField.addEventListener('input', function() {
            charCount.textContent = this.value.length;
            
            if (this.value.length > 500) {
                charCount.style.color = '#d9534f';
            } else {
                charCount.style.color = '';
            }
        });
    }
    
    // Injuries checkbox toggle
    const injuriesCheck = document.getElementById('injuriesCheck');
    const injuriesInput = document.getElementById('injuriesInput');
    
    if (injuriesCheck && injuriesInput) {
        injuriesCheck.addEventListener('change', function() {
            if (this.checked) {
                injuriesInput.classList.add('show');
            } else {
                injuriesInput.classList.remove('show');
            }
        });
    }
    
    // Image upload preview
    const photoUpload = document.getElementById('incidentPhotos');
    const uploadedPhotosContainer = document.getElementById('uploadedPhotos');
    
    if (photoUpload && uploadedPhotosContainer) {
        photoUpload.addEventListener('change', function() {
            handleFileUpload(this.files);
        });
        
        // Drag and drop functionality
        const dropZone = document.getElementById('photoUpload');
        
        if (dropZone) {
            ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
                dropZone.addEventListener(eventName, preventDefaults, false);
            });
            
            function preventDefaults(e) {
                e.preventDefault();
                e.stopPropagation();
            }
            
            ['dragenter', 'dragover'].forEach(eventName => {
                dropZone.addEventListener(eventName, highlight, false);
            });
            
            ['dragleave', 'drop'].forEach(eventName => {
                dropZone.addEventListener(eventName, unhighlight, false);
            });
            
            function highlight() {
                dropZone.classList.add('highlight');
            }
            
            function unhighlight() {
                dropZone.classList.remove('highlight');
            }
            
            dropZone.addEventListener('drop', function(e) {
                const dt = e.dataTransfer;
                const files = dt.files;
                handleFileUpload(files);
            }, false);
        }
    }
    
    // Video upload handling
    const videoUpload = document.getElementById('incidentVideos');
    const uploadedVideosContainer = document.getElementById('uploadedVideos');
    
    if (videoUpload && uploadedVideosContainer) {
        videoUpload.addEventListener('change', function() {
            handleVideoUpload(this.files);
        });
        
        // Drag and drop functionality for videos
        const videoDropZone = document.getElementById('videoUpload');
        
        if (videoDropZone) {
            ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
                videoDropZone.addEventListener(eventName, preventDefaults, false);
            });
            
            ['dragenter', 'dragover'].forEach(eventName => {
                videoDropZone.addEventListener(eventName, function() {
                    this.classList.add('highlight');
                }, false);
            });
            
            ['dragleave', 'drop'].forEach(eventName => {
                videoDropZone.addEventListener(eventName, function() {
                    this.classList.remove('highlight');
                }, false);
            });
            
            videoDropZone.addEventListener('drop', function(e) {
                const dt = e.dataTransfer;
                const files = dt.files;
                handleVideoUpload(files);
            }, false);
        }
    }
    
    // Media tabs functionality
    const mediaTabs = document.querySelectorAll('.media-tab');
    if (mediaTabs.length > 0) {
        mediaTabs.forEach(tab => {
            tab.addEventListener('click', function() {
                // Remove active class from all tabs and content
                document.querySelectorAll('.media-tab').forEach(t => t.classList.remove('active'));
                document.querySelectorAll('.media-content').forEach(c => c.classList.remove('active'));
                
                // Add active class to clicked tab
                this.classList.add('active');
                
                // Show corresponding content
                const mediaType = this.getAttribute('data-media');
                document.getElementById(`${mediaType}Content`).classList.add('active');
            });
        });
    }
    
    // Current location button
    const useCurrentLocationBtn = document.getElementById('useCurrentLocation');
    const locationInput = document.getElementById('location');
    
    if (useCurrentLocationBtn && locationInput) {
        useCurrentLocationBtn.addEventListener('click', function() {
            if (navigator.geolocation) {
                useCurrentLocationBtn.classList.add('loading');
                useCurrentLocationBtn.disabled = true;
                
                navigator.geolocation.getCurrentPosition(function(position) {
                    const lat = position.coords.latitude;
                    const lng = position.coords.longitude;
                    
                    // Reverse geocode to get address
                    fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`)
                        .then(response => response.json())
                        .then(data => {
                            locationInput.value = data.display_name || `${lat}, ${lng}`;
                            
                            // Update map marker if map is initialized
                            if (window.incidentMap) {
                                window.incidentMap.setView([lat, lng], 15);
                                if (window.incidentMarker) {
                                    window.incidentMarker.setLatLng([lat, lng]);
                                } else {
                                    window.incidentMarker = L.marker([lat, lng]).addTo(window.incidentMap);
                                }
                            }
                            
                            useCurrentLocationBtn.classList.remove('loading');
                            useCurrentLocationBtn.disabled = false;
                        })
                        .catch(error => {
                            console.error('Error getting address:', error);
                            locationInput.value = `${lat}, ${lng}`;
                            useCurrentLocationBtn.classList.remove('loading');
                            useCurrentLocationBtn.disabled = false;
                        });
                }, function(error) {
                    console.error('Error getting location:', error);
                    alert('Unable to retrieve your location. Please enter it manually.');
                    useCurrentLocationBtn.classList.remove('loading');
                    useCurrentLocationBtn.disabled = false;
                });
            } else {
                alert('Geolocation is not supported by this browser.');
            }
        });
    }
    
    // Form submission
    const incidentForm = document.getElementById('incidentForm');
    
    if (incidentForm) {
        incidentForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const submitBtn = this.querySelector('.submit-report');
            submitBtn.classList.add('loading');
            submitBtn.disabled = true;
            
            // Gather form data
            const formData = {
                incidentType: document.getElementById('incidentType').value,
                description: document.getElementById('description').value,
                location: document.getElementById('location').value,
                severity: document.getElementById('severity').value,
                date: document.getElementById('incidentDate')?.value || new Date().toISOString(),
                damageLevel: document.querySelector('input[name="damageLvl"]:checked')?.value || 'none',
                reporter: document.getElementById('anonymous')?.checked ? 'anonymous' : document.getElementById('reporterName')?.value || 'anonymous',
                contactPhone: document.getElementById('anonymous')?.checked ? '' : document.getElementById('reporterPhone')?.value || '',
                onScene: document.getElementById('onScene')?.checked || false,
                injuries: document.getElementById('injuriesCheck')?.checked ? document.getElementById('injuriesCount')?.value : 0
            };
            
            // Simulate API call with timeout
            setTimeout(() => {
                console.log('Incident report submitted:', formData);
                
                // Show success message
                showNotification('Incident reported successfully!', 'success');
                
                // Reset form
                incidentForm.reset();
                if (uploadedPhotosContainer) {
                    uploadedPhotosContainer.innerHTML = '';
                }
                
                // Reset button state
                submitBtn.classList.remove('loading');
                submitBtn.disabled = false;
                
                // Navigate back to dashboard
                document.querySelectorAll('section.section').forEach(section => {
                    section.classList.remove('active');
                });
                document.getElementById('dashboard').classList.add('active');
                
                // Update navigation
                document.querySelectorAll('nav ul li').forEach(item => {
                    item.classList.remove('active');
                });
                document.querySelector('nav ul li:first-child').classList.add('active');
                
            }, 1500);
        });
    }
    
    // Helper functions
    function handleFileUpload(files) {
        if (!files || !uploadedPhotosContainer) return;
        
        for (let i = 0; i < files.length; i++) {
            if (i >= 5) break; // Limit to 5 files
            
            const file = files[i];
            if (!file.type.match('image.*')) continue;
            
            const reader = new FileReader();
            
            reader.onload = function(e) {
                const photoDiv = document.createElement('div');
                photoDiv.className = 'uploaded-photo';
                
                const img = document.createElement('img');
                img.src = e.target.result;
                
                const removeBtn = document.createElement('div');
                removeBtn.className = 'remove-photo';
                removeBtn.innerHTML = '<i class="fas fa-times"></i>';
                removeBtn.addEventListener('click', function() {
                    photoDiv.remove();
                });
                
                photoDiv.appendChild(img);
                photoDiv.appendChild(removeBtn);
                uploadedPhotosContainer.appendChild(photoDiv);
            };
            
            reader.readAsDataURL(file);
        }
    }
    
    function handleVideoUpload(files) {
        if (!files || !uploadedVideosContainer) return;
        
        for (let i = 0; i < files.length; i++) {
            if (i >= 3) {
                showNotification('Maximum 3 videos allowed', 'warning');
                break; // Limit to 3 videos
            }
            
            const file = files[i];
            if (!file.type.match('video.*')) {
                showNotification('Only video files are allowed', 'error');
                continue;
            }
            
            // Check file size (50MB max)
            if (file.size > 50 * 1024 * 1024) {
                showNotification(`Video ${file.name} exceeds 50MB limit`, 'warning');
                continue;
            }
            
            const videoDiv = document.createElement('div');
            videoDiv.className = 'uploaded-video';
            
            const thumbnailDiv = document.createElement('div');
            thumbnailDiv.className = 'video-thumbnail';
            
            // Create video element for preview
            const video = document.createElement('video');
            video.src = URL.createObjectURL(file);
            video.muted = true;
            
            // Add play icon overlay
            const playIcon = document.createElement('div');
            playIcon.className = 'play-icon';
            playIcon.innerHTML = '<i class="fas fa-play"></i>';
            playIcon.addEventListener('click', function() {
                if (video.paused) {
                    video.play();
                    playIcon.innerHTML = '<i class="fas fa-pause"></i>';
                } else {
                    video.pause();
                    playIcon.innerHTML = '<i class="fas fa-play"></i>';
                }
            });
            
            // Create video info section
            const infoDiv = document.createElement('div');
            infoDiv.className = 'video-info';
            
            const nameSpan = document.createElement('div');
            nameSpan.className = 'video-name';
            nameSpan.textContent = file.name;
            
            const sizeSpan = document.createElement('div');
            sizeSpan.className = 'video-size';
            sizeSpan.textContent = formatFileSize(file.size);
            
            // Add progress bar
            const progressDiv = document.createElement('div');
            progressDiv.className = 'upload-progress';
            const progressBar = document.createElement('div');
            progressBar.className = 'progress-bar';
            progressDiv.appendChild(progressBar);
            
            // Add remove button
            const removeBtn = document.createElement('div');
            removeBtn.className = 'remove-video';
            removeBtn.innerHTML = '<i class="fas fa-times"></i>';
            removeBtn.addEventListener('click', function() {
                videoDiv.remove();
            });
            
            // Assemble the components
            thumbnailDiv.appendChild(video);
            thumbnailDiv.appendChild(playIcon);
            infoDiv.appendChild(nameSpan);
            infoDiv.appendChild(sizeSpan);
            infoDiv.appendChild(progressDiv);
            videoDiv.appendChild(thumbnailDiv);
            videoDiv.appendChild(infoDiv);
            videoDiv.appendChild(removeBtn);
            uploadedVideosContainer.appendChild(videoDiv);
            
            // Simulate upload progress (in a real app, this would be actual upload progress)
            simulateUploadProgress(progressBar);
        }
    }
    
    function formatFileSize(bytes) {
        if (bytes < 1024) return bytes + ' bytes';
        else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
        else return (bytes / 1048576).toFixed(1) + ' MB';
    }
    
    function simulateUploadProgress(progressBar) {
        let width = 0;
        const interval = setInterval(function() {
            if (width >= 100) {
                clearInterval(interval);
            } else {
                width += 5;
                progressBar.style.width = width + '%';
            }
        }, 100);
    }
    
    function initLocationMap() {
        // Initialize the map
        window.incidentMap = L.map('locationMap').setView([20.5937, 78.9629], 5); // Default to India
        
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(window.incidentMap);
        
        // Add click handler to the map
        window.incidentMap.on('click', function(e) {
            const lat = e.latlng.lat;
            const lng = e.latlng.lng;
            
            // Add marker at clicked location
            if (window.incidentMarker) {
                window.incidentMarker.setLatLng([lat, lng]);
            } else {
                window.incidentMarker = L.marker([lat, lng]).addTo(window.incidentMap);
            }
            
            // Update location input with coordinates
            if (document.getElementById('location')) {
                document.getElementById('location').value = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
                
                // Optionally reverse geocode to get address
                fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`)
                    .then(response => response.json())
                    .then(data => {
                        document.getElementById('location').value = data.display_name || `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
                    })
                    .catch(error => {
                        console.error('Error getting address:', error);
                    });
            }
        });
    }
    
    function showNotification(message, type = 'info') {
        // Create notification element if it doesn't exist
        let notification = document.getElementById('notification');
        if (!notification) {
            notification = document.createElement('div');
            notification.id = 'notification';
            document.body.appendChild(notification);
        }
        
        // Set notification content and style
        notification.textContent = message;
        notification.className = `notification ${type}`;
        
        // Show notification
        notification.classList.add('show');
        
        // Hide after 3 seconds
        setTimeout(() => {
            notification.classList.remove('show');
        }, 3000);
    }
});

// Add CSS for notifications
const style = document.createElement('style');
style.textContent = `
    .notification {
        position: fixed;
        bottom: 30px;
        right: 30px;
        padding: 15px 25px;
        border-radius: 8px;
        color: white;
        font-weight: 500;
        z-index: 1000;
        box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        transform: translateY(100px);
        opacity: 0;
        transition: all 0.3s cubic-bezier(0.68, -0.55, 0.27, 1.55);
    }
    
    .notification.show {
        transform: translateY(0);
        opacity: 1;
    }
    
    .notification.success {
        background-color: #10b981;
    }
    
    .notification.info {
        background-color: #3b82f6;
    }
    
    .notification.warning {
        background-color: #f59e0b;
    }
    
    .notification.error {
        background-color: #ef4444;
    }
    
    .file-upload-container.highlight {
        border-color: var(--primary-color);
        background-color: var(--primary-light);
    }
`;
document.head.appendChild(style);

// Report Emergency button functionality
document.addEventListener('DOMContentLoaded', function() {
    // If reportEmergencyBtn exists, add the event listener
    const reportEmergencyBtn = document.getElementById('reportEmergencyBtn');
    
    if (reportEmergencyBtn) {
        reportEmergencyBtn.addEventListener('click', function() {
            // Hide all sections
            const allSections = document.querySelectorAll('section.section');
            allSections.forEach(section => {
                section.classList.remove('active');
            });
            
            // Show report section
            document.getElementById('report').classList.add('active');
            
            // Update navigation active state
            const navItems = document.querySelectorAll('nav ul li');
            navItems.forEach(item => {
                item.classList.remove('active');
            });
            
            // Find and activate the Report Incident nav item
            const reportNavItem = document.querySelector('nav ul li a[href="#report"]').parentNode;
            reportNavItem.classList.add('active');
            
            // Scroll to the report section
            document.getElementById('report').scrollIntoView({behavior: 'smooth'});
        });
    }
});
