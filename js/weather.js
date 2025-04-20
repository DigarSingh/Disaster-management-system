// Weather API functionality
let WEATHER_API_KEY = '';
const DEFAULT_LOCATION = window.appConfig?.settings?.defaultLocation || 'Dehradun'; // Default location
let userLocation = DEFAULT_LOCATION;

// DOM Elements
const currentWeatherEl = document.querySelector('.current-weather');
const weatherAlertsEl = document.querySelector('.weather-alerts-list');
const forecastEl = document.querySelector('.forecast-container');
// Add reference to dashboard recent alerts
const dashboardAlertsEl = document.querySelector('.dashboard-card .alerts-list');

// Initialize weather data on page load
document.addEventListener('DOMContentLoaded', () => {
    // Get API key from config
    if (window.appConfig && window.appConfig.apiKeys) {
        WEATHER_API_KEY = window.appConfig.apiKeys.openWeatherMap;
    }
    
    initializeWeather();
    
    // Set up refresh button if it exists
    const refreshWeatherBtn = document.getElementById('refreshWeatherBtn');
    if (refreshWeatherBtn) {
        refreshWeatherBtn.addEventListener('click', initializeWeather);
    }
    
    // Set up refresh button for dashboard alerts
    const refreshDashboardAlertsBtn = document.querySelector('.dashboard-card .card-actions button');
    if (refreshDashboardAlertsBtn) {
        refreshDashboardAlertsBtn.addEventListener('click', () => {
            fetchWeatherAlerts(userLocation)
                .then(data => {
                    updateDashboardAlertsUI(data);
                })
                .catch(error => {
                    console.error('Error refreshing dashboard alerts:', error);
                });
        });
    }
    
    // Listen for API key changes
    document.addEventListener('apiKeyChanged', (event) => {
        if (event.detail.service === 'openWeatherMap') {
            WEATHER_API_KEY = event.detail.key;
            initializeWeather(); // Refresh weather data with new API key
        }
    });
    
    // Auto refresh weather data every 30 minutes
    setInterval(initializeWeather, window.appConfig?.settings?.refreshInterval || 30 * 60 * 1000);
});

// Main function to initialize weather data
async function initializeWeather() {
    // Check if API key is configured
    if (!WEATHER_API_KEY || WEATHER_API_KEY === '') {
        showApiKeyError();
        return;
    }
    
    try {
        // Try to get user's location
        getUserLocation()
            .then(location => {
                userLocation = location;
                updateWeatherUI();
            })
            .catch(() => {
                // If location access denied, use default
                userLocation = DEFAULT_LOCATION;
                updateWeatherUI();
            });
    } catch (error) {
        console.error("Weather initialization error:", error);
        showWeatherError();
    }
}

// Get user location using browser API
function getUserLocation() {
    return new Promise((resolve, reject) => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                position => {
                    const { latitude, longitude } = position.coords;
                    getLocationNameFromCoords(latitude, longitude)
                        .then(locationName => resolve(locationName))
                        .catch(() => resolve(DEFAULT_LOCATION));
                },
                () => reject("Location access denied")
            );
        } else {
            reject("Geolocation not supported");
        }
    });
}

// Get location name from coordinates using reverse geocoding
async function getLocationNameFromCoords(lat, lon) {
    try {
        const response = await fetch(`https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${WEATHER_API_KEY}`);
        const data = await response.json();
        return data[0].name;
    } catch (error) {
        console.error("Error getting location name:", error);
        return DEFAULT_LOCATION;
    }
}

// Update all weather UI components
async function updateWeatherUI() {
    showLoadingState();
    
    try {
        // Get current weather, alerts and forecast
        const [currentWeather, weatherAlerts, forecast] = await Promise.all([
            fetchCurrentWeather(userLocation),
            fetchWeatherAlerts(userLocation),
            fetchWeatherForecast(userLocation)
        ]);
        
        // Update UI with fetched data
        updateCurrentWeatherUI(currentWeather);
        updateWeatherAlertsUI(weatherAlerts);
        updateForecastUI(forecast);
        
        // Also update dashboard alerts with the same data
        updateDashboardAlertsUI(weatherAlerts);
        
        hideLoadingState();
    } catch (error) {
        console.error("Error updating weather UI:", error);
        showWeatherError(error.message || "Unable to load weather data. Please try again later.");
    }
}

// Fetch current weather data
async function fetchCurrentWeather(location) {
    try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${location}&units=metric&appid=${WEATHER_API_KEY}`);
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Weather API error: ${errorData.message || response.statusText}`);
        }
        return await response.json();
    } catch (error) {
        console.error("Current weather fetch error:", error);
        throw error;
    }
}

// Fetch weather alerts using OneCall API
async function fetchWeatherAlerts(location) {
    try {
        // First get coordinates for the location - Fix http to https
        const geoResponse = await fetch(`https://api.openweathermap.org/geo/1.0/direct?q=${location}&limit=1&appid=${WEATHER_API_KEY}`);
        
        if (!geoResponse.ok) {
            const errorData = await geoResponse.json();
            throw new Error(`Geocoding error: ${errorData.message || geoResponse.statusText}`);
        }
        
        const geoData = await geoResponse.json();
        
        if (geoData.length === 0) throw new Error("Location not found in geocoding API");
        
        const { lat, lon } = geoData[0];
        console.log(`Got coordinates for ${location}: lat=${lat}, lon=${lon}`);
        
        // Try OneCall API 2.5 directly as 3.0 might require subscription
        try {
            const alertsResponse = await fetch(`https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&exclude=minutely,hourly&units=metric&appid=${WEATHER_API_KEY}`);
            
            if (!alertsResponse.ok) {
                const errorData = await alertsResponse.json();
                throw new Error(`OneCall API error: ${errorData.message || alertsResponse.statusText}`);
            }
            
            return await alertsResponse.json();
            
        } catch (oneCallError) {
            console.error("OneCall API error:", oneCallError);
            // Return empty alerts if OneCall API fails
            return { alerts: [] };
        }
    } catch (error) {
        console.error("Weather alerts fetch error:", error);
        // Return empty alerts rather than failing the whole UI
        return { alerts: [] };
    }
}

// Fetch 5-day weather forecast
async function fetchWeatherForecast(location) {
    try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${location}&units=metric&appid=${WEATHER_API_KEY}`);
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Forecast API error: ${errorData.message || response.statusText}`);
        }
        return await response.json();
    } catch (error) {
        console.error("Forecast fetch error:", error);
        throw error;
    }
}

// Update current weather section with API data
function updateCurrentWeatherUI(data) {
    if (!data) return;
    
    const weatherIcon = getWeatherIcon(data.weather[0].icon);
    const temperature = Math.round(data.main.temp);
    const conditions = data.weather[0].description;
    const windSpeed = Math.round(data.wind.speed * 3.6); // Convert m/s to km/h
    const humidity = data.main.humidity;
    const visibility = (data.visibility / 1000).toFixed(1); // Convert m to km
    
    // Update DOM elements
    currentWeatherEl.querySelector('.weather-icon i').className = weatherIcon;
    currentWeatherEl.querySelector('.temperature').textContent = `${temperature}°C`;
    currentWeatherEl.querySelector('.location').innerHTML = `<i class="fas fa-map-marker-alt"></i> ${data.name}`;
    currentWeatherEl.querySelector('.conditions').textContent = capitalizeFirstLetter(conditions);
    
    // Update metrics
    const metrics = currentWeatherEl.querySelectorAll('.metric');
    metrics[0].querySelector('span').textContent = `${windSpeed} km/h`;
    metrics[1].querySelector('span').textContent = `${humidity}%`;
    metrics[2].querySelector('span').textContent = `${visibility} km`;
    
    // Add last updated timestamp
    const lastUpdatedEl = document.createElement('div');
    lastUpdatedEl.className = 'last-updated';
    lastUpdatedEl.innerHTML = `<i class="fas fa-sync"></i> Updated: ${new Date().toLocaleTimeString()}`;
    
    // Replace existing timestamp or append new one
    const existingTimestamp = currentWeatherEl.querySelector('.last-updated');
    if (existingTimestamp) {
        currentWeatherEl.replaceChild(lastUpdatedEl, existingTimestamp);
    } else {
        currentWeatherEl.appendChild(lastUpdatedEl);
    }
}

// Update weather alerts section with API data
function updateWeatherAlertsUI(data) {
    // Clear existing alerts except the title
    const alertsTitle = weatherAlertsEl.querySelector('h3');
    weatherAlertsEl.innerHTML = '';
    weatherAlertsEl.appendChild(alertsTitle);
    
    // Check if we have alerts
    const alerts = data.alerts || [];
    
    if (alerts.length === 0) {
        // Add a "no alerts" message if no alerts
        const noAlertsDiv = document.createElement('div');
        noAlertsDiv.className = 'weather-alert info';
        noAlertsDiv.innerHTML = `
            <div class="alert-icon">
                <i class="fas fa-check-circle"></i>
            </div>
            <div class="alert-details">
                <h4>No Active Alerts</h4>
                <p>There are currently no weather alerts for your area.</p>
                <div class="alert-meta">
                    <span><i class="fas fa-clock"></i> Last checked: ${new Date().toLocaleTimeString()}</span>
                </div>
            </div>
        `;
        weatherAlertsEl.appendChild(noAlertsDiv);
    } else {
        // Add each alert to the DOM
        alerts.forEach(alert => {
            const severity = getSeverityClass(alert.event);
            const alertDiv = document.createElement('div');
            alertDiv.className = `weather-alert ${severity}`;
            
            // Format start and end times
            const startTime = new Date(alert.start * 1000).toLocaleString();
            const endTime = new Date(alert.end * 1000).toLocaleString();
            
            alertDiv.innerHTML = `
                <div class="alert-icon">
                    <i class="${getSeverityIcon(severity)}"></i>
                </div>
                <div class="alert-details">
                    <h4>${alert.event}</h4>
                    <p>${alert.description}</p>
                    <div class="alert-meta">
                        <span><i class="fas fa-clock"></i> Issued: ${startTime}</span>
                        <span><i class="fas fa-hourglass-half"></i> Expires: ${endTime}</span>
                        <span><i class="fas fa-map-marked-alt"></i> Source: ${alert.sender_name}</span>
                    </div>
                </div>
            `;
            weatherAlertsEl.appendChild(alertDiv);
        });
    }
}

// Update 5-day forecast with API data
function updateForecastUI(data) {
    if (!data || !data.list) return;
    
    // Clear existing forecast
    forecastEl.innerHTML = '';
    
    // Get one forecast per day (noon time)
    const dailyForecasts = [];
    const processedDays = new Set();
    
    data.list.forEach(item => {
        const date = new Date(item.dt * 1000);
        const day = date.getDate();
        
        // If we haven't processed this day yet and it's around noon (11am-2pm)
        if (!processedDays.has(day) && date.getHours() >= 11 && date.getHours() <= 14) {
            processedDays.add(day);
            dailyForecasts.push(item);
        }
    });
    
    // Limit to 5 days
    dailyForecasts.slice(0, 5).forEach(forecast => {
        const date = new Date(forecast.dt * 1000);
        const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
        const icon = getWeatherIcon(forecast.weather[0].icon);
        const temp = Math.round(forecast.main.temp);
        
        const forecastDay = document.createElement('div');
        forecastDay.className = 'forecast-day';
        forecastDay.innerHTML = `
            <div class="day-name">${dayName}</div>
            <i class="${icon}"></i>
            <div class="day-temp">${temp}°C</div>
        `;
        
        forecastEl.appendChild(forecastDay);
    });
}

// Add new function to update dashboard alerts with weather data
function updateDashboardAlertsUI(data) {
    // Only proceed if dashboard alerts element exists
    if (!dashboardAlertsEl) return;
    
    // Clear existing dashboard alerts
    dashboardAlertsEl.innerHTML = '';
    
    // Check if we have alerts
    const alerts = data.alerts || [];
    
    if (alerts.length === 0) {
        // Add a "no alerts" message if no alerts
        const noAlertsDiv = document.createElement('div');
        noAlertsDiv.className = 'alert-item info';
        noAlertsDiv.innerHTML = `
            <i class="fas fa-info-circle"></i>
            <div class="alert-content">
                <h4>No Active Alerts</h4>
                <p>There are currently no weather alerts for your area.</p>
                <span class="alert-time">Last checked: ${new Date().toLocaleTimeString()}</span>
            </div>
        `;
        dashboardAlertsEl.appendChild(noAlertsDiv);
    } else {
        // Add all alerts to the dashboard
        alerts.forEach(alert => {
            const severity = getSeverityClass(alert.event);
            const alertDiv = document.createElement('div');
            alertDiv.className = `alert-item ${severity}`;
            
            // Format time as relative (e.g., "1 hour ago")
            const startTime = new Date(alert.start * 1000);
            const timeDisplay = formatRelativeTime(startTime);
            
            // Use matching icon based on severity
            const iconClass = getSeverityIcon(severity);
            
            // Format alert for dashboard style
            alertDiv.innerHTML = `
                <i class="${iconClass}"></i>
                <div class="alert-content">
                    <h4>${alert.event}</h4>
                    <p>${truncateText(alert.description, 100)}</p>
                    <span class="alert-time">${timeDisplay}</span>
                </div>
            `;
            dashboardAlertsEl.appendChild(alertDiv);
        });
    }
    
    // Update "View all alerts" link to go to weather alerts section
    const viewAllLink = document.querySelector('.dashboard-card .view-all-link a');
    if (viewAllLink) {
        viewAllLink.setAttribute('href', '#weather-alerts');
        // Add click handler to navigate to weather alerts section
        viewAllLink.onclick = function() {
            // Switch to weather alerts section
            document.querySelectorAll('section.section').forEach(section => {
                section.classList.remove('active');
            });
            document.getElementById('weather-alerts').classList.add('active');
            
            // Update navigation active state
            document.querySelectorAll('nav ul li').forEach(item => {
                item.classList.remove('active');
            });
            document.querySelector('nav ul li a[href="#weather-alerts"]').parentNode.classList.add('active');
            return true;
        };
    }
}

// Helper function to map weather codes to FontAwesome icons
function getWeatherIcon(iconCode) {
    const iconMap = {
        '01d': 'fas fa-sun', // clear sky day
        '01n': 'fas fa-moon', // clear sky night
        '02d': 'fas fa-cloud-sun', // few clouds day
        '02n': 'fas fa-cloud-moon', // few clouds night
        '03d': 'fas fa-cloud', // scattered clouds
        '03n': 'fas fa-cloud',
        '04d': 'fas fa-cloud', // broken clouds
        '04n': 'fas fa-cloud',
        '09d': 'fas fa-cloud-rain', // shower rain
        '09n': 'fas fa-cloud-rain',
        '10d': 'fas fa-cloud-showers-heavy', // rain day
        '10n': 'fas fa-cloud-showers-heavy', // rain night
        '11d': 'fas fa-bolt', // thunderstorm
        '11n': 'fas fa-bolt',
        '13d': 'fas fa-snowflake', // snow
        '13n': 'fas fa-snowflake',
        '50d': 'fas fa-smog', // mist
        '50n': 'fas fa-smog'
    };
    
    return iconMap[iconCode] || 'fas fa-cloud';
}

// Determine alert severity class based on event type
function getSeverityClass(eventType) {
    const eventLower = eventType.toLowerCase();
    
    if (eventLower.includes('warning') || 
        eventLower.includes('severe') || 
        eventLower.includes('extreme') || 
        eventLower.includes('emergency')) {
        return 'critical';
    } else if (eventLower.includes('watch') || 
               eventLower.includes('advisory')) {
        return 'warning';
    } else {
        return 'info';
    }
}

// Get icon based on severity class
function getSeverityIcon(severityClass) {
    switch (severityClass) {
        case 'critical':
            return 'fas fa-exclamation-triangle';
        case 'warning':
            return 'fas fa-exclamation-circle';
        default:
            return 'fas fa-info-circle';
    }
}

// Helper function to format relative time
function formatRelativeTime(date) {
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHrs = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHrs / 24);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHrs < 24) return `${diffHrs} hour${diffHrs > 1 ? 's' : ''} ago`;
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
}

// Helper function to truncate text with ellipsis
function truncateText(text, maxLength) {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
}

// Show loading state while fetching data
function showLoadingState() {
    const sections = [currentWeatherEl, weatherAlertsEl, forecastEl];
    
    sections.forEach(section => {
        // Add loading overlay if doesn't exist
        if (!section.querySelector('.loading-overlay')) {
            const loader = document.createElement('div');
            loader.className = 'loading-overlay';
            loader.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i><span>Updating weather data...</span>';
            section.style.position = 'relative';
            section.appendChild(loader);
        }
    });
}

// Hide loading state
function hideLoadingState() {
    document.querySelectorAll('.loading-overlay').forEach(loader => {
        loader.remove();
    });
}

// Show error state with more detailed error messages
function showWeatherError(message = "Unable to load weather data. Please try again later.") {
    hideLoadingState();
    
    const sections = [currentWeatherEl, weatherAlertsEl, forecastEl];
    sections.forEach(section => {
        // Remove any existing errors
        section.querySelectorAll('.weather-error').forEach(el => el.remove());
        
        // Add error message
        const errorDiv = document.createElement('div');
        errorDiv.className = 'weather-error';
        errorDiv.innerHTML = `
            <i class="fas fa-exclamation-circle"></i>
            <p>${message}</p>
            <button class="btn-small retry-btn">Retry</button>
            <div class="error-details">
                <small>If this error persists, please check your API key configuration or try again later.</small>
            </div>
        `;
        section.appendChild(errorDiv);
        
        // Add retry button event listener
        errorDiv.querySelector('.retry-btn').addEventListener('click', () => {
            initializeWeather();
        });
    });
}

// Show API key configuration error
function showApiKeyError() {
    hideLoadingState();
    
    const sections = [currentWeatherEl, weatherAlertsEl, forecastEl];
    sections.forEach(section => {
        // Remove any existing errors
        section.querySelectorAll('.weather-error').forEach(el => el.remove());
        
        // Add API key error message
        const errorDiv = document.createElement('div');
        errorDiv.className = 'weather-error';
        errorDiv.innerHTML = `
            <i class="fas fa-key"></i>
            <p>OpenWeatherMap API key not configured.</p>
            <button class="btn-small configure-api-btn">Configure API Key</button>
        `;
        section.appendChild(errorDiv);
        
        // Add configure button event listener
        errorDiv.querySelector('.configure-api-btn').addEventListener('click', () => {
            showApiKeyConfigModal();
        });
    });
}

// Show API key configuration modal with the current key pre-filled
function showApiKeyConfigModal() {
    // Create modal if it doesn't exist
    let modal = document.getElementById('apiConfigModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'apiConfigModal';
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2><i class="fas fa-cog"></i> Configure Weather API</h2>
                    <span class="close-modal">&times;</span>
                </div>
                <div class="modal-body">
                    <p>Your API key is already configured, but you can update it if needed.</p>
                    <div class="form-group">
                        <label for="apiKeyInput">OpenWeatherMap API Key:</label>
                        <input type="text" id="apiKeyInput" placeholder="Enter your API key" 
                               value="${WEATHER_API_KEY}">
                    </div>
                    <div class="api-key-message" id="apiKeyMessage"></div>
                    <div class="api-key-status success-message">
                        <i class="fas fa-check-circle"></i> API key configured and ready to use.
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary close-btn">Close</button>
                    <button class="btn btn-primary save-api-btn">Update Key</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        
        // Add event listeners to modal
        modal.querySelector('.close-modal').addEventListener('click', () => {
            modal.style.display = 'none';
        });
        
        modal.querySelector('.close-btn').addEventListener('click', () => {
            modal.style.display = 'none';
        });
        
        modal.querySelector('.save-api-btn').addEventListener('click', () => {
            const apiKey = document.getElementById('apiKeyInput').value.trim();
            if (apiKey) {
                // Save to config
                if (window.appConfig) {
                    window.appConfig.setApiKey('openWeatherMap', apiKey);
                    WEATHER_API_KEY = apiKey;
                    modal.style.display = 'none';
                    initializeWeather(); // Refresh weather with new API key
                }
            } else {
                // Show error
                const messageEl = document.getElementById('apiKeyMessage');
                messageEl.textContent = 'Please enter a valid API key';
                messageEl.className = 'error-message';
            }
        });
        
        // Close modal when clicking outside
        window.addEventListener('click', (event) => {
            if (event.target === modal) {
                modal.style.display = 'none';
            }
        });
    }
    
    // Update the input field with the current API key
    modal.querySelector('#apiKeyInput').value = WEATHER_API_KEY;
    
    // Show the modal
    modal.style.display = 'block';
}

// Helper function to capitalize first letter
function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}
