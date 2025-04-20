/**
 * Configuration file for API keys and other settings
 * This file should be included before any API-dependent scripts
 */

// Create a global config object
window.appConfig = window.appConfig || {};

// Default configuration
window.appConfig = {
    // API Keys - Make sure we use the proper key format
    apiKeys: {
        openWeatherMap: localStorage.getItem('openWeatherMapKey') || '20f02b6fe5699239388e1afb5ca8e16e',
        // Add other API keys as needed
    },
    
    // Settings
    settings: {
        defaultLocation: 'Dehradun',
        temperatureUnit: 'metric', // metric (Celsius) or imperial (Fahrenheit)
        refreshInterval: 30 * 60 * 1000 // 30 minutes
    },
    
    // Set API key and save to localStorage
    setApiKey: function(service, key) {
        this.apiKeys[service] = key;
        localStorage.setItem(service + 'Key', key);
        
        // Dispatch an event to notify components that the API key has changed
        document.dispatchEvent(new CustomEvent('apiKeyChanged', {
            detail: {
                service: service,
                key: key
            }
        }));
        
        return true;
    }
};

// Add a debug helper to verify API keys are correct
console.log('Weather API Key configured:', window.appConfig.apiKeys.openWeatherMap ? 'Yes' : 'No');
if (window.appConfig.apiKeys.openWeatherMap) {
    // Only log the first few characters for security
    const keyPreview = window.appConfig.apiKeys.openWeatherMap.substring(0, 5) + '...';
    console.log('Weather API Key preview:', keyPreview);
}

// Check if API keys are configured
window.appConfig.isApiConfigured = function(service) {
    return this.apiKeys[service] && this.apiKeys[service].length > 0;
};
