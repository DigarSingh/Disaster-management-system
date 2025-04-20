document.addEventListener('DOMContentLoaded', function() {
    // Initialize the map if the map element exists
    const mapElement = document.getElementById('incidentMap');
    if (mapElement) {
        initMap();
    }
    
    // Setup map control buttons
    const refreshMapBtn = document.getElementById('refreshMap');
    const fullscreenMapBtn = document.getElementById('fullscreenMap');
    
    if (refreshMapBtn) {
        refreshMapBtn.addEventListener('click', function() {
            refreshMap();
        });
    }
    
    if (fullscreenMapBtn) {
        fullscreenMapBtn.addEventListener('click', function() {
            toggleFullscreenMap();
        });
    }
});

// Global map variable
let incidentMap;
let isFullscreen = false;

// Default map center: Dehradun, India coordinates
const DEHRADUN_LAT = 30.3165;
const DEHRADUN_LNG = 78.0322;

function initMap() {
    // Initialize the map centered on Dehradun, India
    incidentMap = L.map('incidentMap').setView([DEHRADUN_LAT, DEHRADUN_LNG], 13);
    
    // Add OpenStreetMap tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(incidentMap);
    
    // Add a marker for Dehradun city center
    L.marker([DEHRADUN_LAT, DEHRADUN_LNG])
        .addTo(incidentMap)
        .bindPopup('<b>Dehradun</b><br>Uttarakhand, India')
        .openPopup();
    
    // Add sample incident markers
    addSampleIncidents();
    
    // Make sure the map renders correctly (sometimes needed when map is initially hidden)
    setTimeout(function() {
        incidentMap.invalidateSize();
    }, 100);
}

function addSampleIncidents() {
    // Sample incident data for Dehradun area
    const incidents = [
        { lat: 30.3254, lng: 78.0413, title: "Flash Flood", type: "flood", severity: "high" },
        { lat: 30.3065, lng: 78.0422, title: "Power Outage", type: "power", severity: "medium" },
        { lat: 30.3265, lng: 78.0222, title: "Fallen Tree", type: "tree", severity: "low" },
        { lat: 30.3361, lng: 78.0193, title: "Building Fire", type: "fire", severity: "high" },
        { lat: 30.3079, lng: 78.0482, title: "Gas Leak", type: "gas", severity: "medium" }
    ];
    
    // Create markers for each incident
    incidents.forEach(incident => {
        // Select marker color based on severity
        let markerColor = 'blue';
        if (incident.severity === 'high') markerColor = 'red';
        if (incident.severity === 'medium') markerColor = 'orange';
        
        // Create marker with popup
        const marker = L.marker([incident.lat, incident.lng], {
            icon: L.divIcon({
                className: `custom-marker ${incident.severity}`,
                html: `<i class="fas fa-exclamation-triangle" style="color: ${markerColor};"></i>`,
                iconSize: [40, 40],
                iconAnchor: [20, 40],
                popupAnchor: [0, -40]
            })
        }).addTo(incidentMap);
        
        // Add popup with incident details
        marker.bindPopup(`
            <div class="incident-popup">
                <h3>${incident.title}</h3>
                <p><strong>Type:</strong> ${incident.type}</p>
                <p><strong>Severity:</strong> ${incident.severity}</p>
                <p><strong>Location:</strong> Dehradun, Uttarakhand</p>
                <button class="btn-small">View Details</button>
            </div>
        `);
    });
}

function refreshMap() {
    // Recenter the map to Dehradun
    incidentMap.setView([DEHRADUN_LAT, DEHRADUN_LNG], 13);
    
    // Show a refresh notification
    showMapNotification('Map data refreshed');
}

function toggleFullscreenMap() {
    const mapContainer = document.querySelector('.map-container');
    const dashboardCard = document.querySelector('.dashboard-card:nth-child(3)');
    
    if (!isFullscreen) {
        // Make map fullscreen
        dashboardCard.style.position = 'fixed';
        dashboardCard.style.top = '0';
        dashboardCard.style.left = '0';
        dashboardCard.style.width = '100%';
        dashboardCard.style.height = '100%';
        dashboardCard.style.zIndex = '9999';
        dashboardCard.style.margin = '0';
        dashboardCard.style.borderRadius = '0';
        mapContainer.style.height = 'calc(100% - 60px)';
        document.getElementById('incidentMap').style.height = '100%';
        document.getElementById('fullscreenMap').innerHTML = '<i class="fas fa-compress"></i>';
        document.body.style.overflow = 'hidden';
    } else {
        // Restore normal view
        dashboardCard.style.position = '';
        dashboardCard.style.top = '';
        dashboardCard.style.left = '';
        dashboardCard.style.width = '';
        dashboardCard.style.height = '';
        dashboardCard.style.zIndex = '';
        dashboardCard.style.margin = '';
        dashboardCard.style.borderRadius = '';
        mapContainer.style.height = '';
        document.getElementById('incidentMap').style.height = '350px';
        document.getElementById('fullscreenMap').innerHTML = '<i class="fas fa-expand"></i>';
        document.body.style.overflow = '';
    }
    
    isFullscreen = !isFullscreen;
    
    // Resize map to fit new container size
    setTimeout(function() {
        incidentMap.invalidateSize();
    }, 100);
}

function showMapNotification(message) {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = 'map-notification';
    notification.textContent = message;
    
    // Add to map container
    document.querySelector('.map-container').appendChild(notification);
    
    // Remove after delay
    setTimeout(function() {
        notification.classList.add('fade-out');
        setTimeout(function() {
            notification.remove();
        }, 500);
    }, 2000);
}
