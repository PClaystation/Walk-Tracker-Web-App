// Initialize the map and setup
const map = L.map('map').setView([59.3293, 18.0686], 13); // Coordinates of Stockholm, Sweden for example

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

var markers = [];  // Array to store markers
var pathHistory = []; // Array to store the path history
var polylines = []; // Array to store polylines
let isPlacingMarkers = true;  // Initially, marker placement is enabled


const podcastData = [
    {
        name: 'Midnight burger',
        color: '#FF5733',
        logoUrl: 'Images/Midnight_burger.jpeg',  // Replace with the actual logo URL
        path: []
    },
    {
        name: 'Derelict',
        color: '#0a00d7',
        logoUrl: 'Images/Derelict.jpeg',  // Replace with the actual logo URL
        path: []
    },
    {
        name: 'The White Vault',
        color: '#00f0ff',
        logoUrl: 'Images/White_vault.jpeg',  // Replace with the actual logo URL
        path: []
    },
    {
        name: 'Paralyzed',
        color: '#d80000',
        logoUrl: 'Images/Paralyzed.jpeg',  // Replace with the actual logo URL
        path: []
    },
    {
        name: 'Tower 4',
        color: '#9700ff',
        logoUrl: 'Images/Tower_4.jpeg',  // Replace with the actual logo URL
        path: []
    },
    {
        name: 'Station 151',
        color: '#088fff',
        logoUrl: 'Images/Station_151.jpeg',  // Replace with the actual logo URL
        path: []
    },
    {
        name: 'Red Valley',
        color: '#ff0000',
        logoUrl: 'Images/Red_valley.jpeg',  // Replace with the actual logo URL
        path: []
    },
    {
        name: 'OZ 9',
        color: '#026057',
        logoUrl: 'Images/Oz_9.jpeg',  // Replace with the actual logo URL
        path: []
    },
    {
        name: 'End Of All Hope',
        color: '#33FF57',
        logoUrl: 'Images/EOAH.jpeg',  // Replace with the actual logo URL
        path: []
    },
    {
        name: 'Desert Skies',
        color: '#6f00b2',
        logoUrl: 'Images/Desert_skies.jpeg',  // Replace with the actual logo URL
        path: []
    },
    {
        name: 'Crystal Blues',
        color: '#1400d7',
        logoUrl: 'Images/Crystal_blues.jpeg',  // Replace with the actual logo URL
        path: []
    },
    {
        name: 'Ars Paradoxica',
        color: '#0000b2',
        logoUrl: 'Images/Ars_paradoxica.jpeg',  // Replace with the actual logo URL
        path: []
    },

];

document.addEventListener("DOMContentLoaded", () => {
    const authForm = document.getElementById("authForm");
    const authTitle = document.getElementById("authTitle");
    const switchToRegisterLink = document.getElementById("switchToRegister");
    const switchToLoginLink = document.getElementById("switchToLogin");
    const authSubmit = document.getElementById("authSubmit");
    const emailInput = document.getElementById("authEmail");
    const passwordInput = document.getElementById("authPassword");
    
    let isSignup = false; // Track whether the user is on the sign-up form or login form

    // Toggle between login and sign-up
    switchToRegisterLink.addEventListener("click", (e) => {
        e.preventDefault();
        isSignup = true;
        authTitle.textContent = "Sign Up";
        authSubmit.textContent = "Sign Up";
        clearForm(); // Clear form fields when switching
    });

    switchToLoginLink.addEventListener("click", (e) => {
        e.preventDefault();
        isSignup = false;
        authTitle.textContent = "Login";
        authSubmit.textContent = "Login";
        clearForm(); // Clear form fields when switching
    });

    // Form submission logic
    authForm.addEventListener("submit", (e) => {
        e.preventDefault(); // Prevent default form submission

        const email = emailInput.value.trim();
        const password = passwordInput.value.trim();

        // Validate form fields (basic check)
        if (!email || !password) {
            alert("Please fill in both email and password.");
            return;
        }

        console.log(`📝 Submitting ${isSignup ? 'sign-up' : 'login'} form...`);
        console.log(`Login data: ${email} ${password}`);
        
        const endpoint = isSignup ? '/api/auth/signup' : '/api/auth/login'; // API endpoint changes based on action
        
        console.log(`📡 Sending request to ${endpoint}`);

        // Disable the submit button to prevent multiple submissions
        authSubmit.disabled = true;
        authSubmit.textContent = "Submitting...";

        // Sending the request
        fetch(`https://mpmc.ddns.net:5000${endpoint}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: email,
                password: password,
            }),
        })
        .then((response) => {
            authSubmit.disabled = false;
            authSubmit.textContent = isSignup ? "Sign Up" : "Login";

            if (!response.ok) {
                throw new Error(`${isSignup ? 'Sign-up' : 'Login'} failed`);
            }

            return response.json();
        })
        .then((data) => {
            console.log(`${isSignup ? 'Sign-up' : 'Login'} success:`, data);
            
            // Clear form fields
            clearForm();
            
            // Handle success (e.g., show a success message or redirect)
            alert(`${isSignup ? 'Sign-up' : 'Login'} successful!`);
            
            // Optionally, redirect or hide the authentication form
            document.getElementById("authPopup").style.display = "none";
            document.getElementById("overlay").style.display = "none";
        })
        .catch((error) => {
            console.error(error);
            alert(`${isSignup ? 'Sign-up' : 'Login'} failed. Please check your credentials.`);
        });
    });

    // Function to clear the form fields
    function clearForm() {
        emailInput.value = '';
        passwordInput.value = '';
    }
});





// Function to generate a color based on podcast name
function getColorForPodcast(podcastName) {
    let hash = 0;
    for (let i = 0; i < podcastName.length; i++) {
        hash = podcastName.charCodeAt(i) + ((hash << 5) - hash);
    }
    let color = `hsl(${hash % 360}, 80%, 50%)`; // Generates a unique color
    return color;
}

// Function to add a walk to the map with tooltip and color

function addWalkToMap(path) {
    console.log("Adding walk to map: ", path); // Debugging statement

    if (!path.points || path.points.length === 0) {
        console.log("No points found in path: ", path); // Debugging statement
        return;
    }

    var points = path.points.map(point => L.latLng(point.lat, point.lng));
    console.log("Converted points: ", points); // Debugging statement

    var color = getColorForPodcast(path.podcast);
    console.log("Color for podcast: ", color); // Debugging statement

    const podcastFromTheList = podcastData[path.podcastIndex];
    if (podcastFromTheList.color !== "") {
        color = podcastFromTheList.color;
    } 

    var polyline = L.polyline(points, { color: color, weight: 4 }).addTo(map);

    // Mouse hover over the polyline - Disable marker placement
    polyline.on('mouseover', function () {
        isPlacingMarkers = false;  // Disable marker placement
        console.log("Marker placement disabled due to hover on path");
    });

    // Mouse out from the polyline - Enable marker placement again
    polyline.on('mouseout', function () {
        isPlacingMarkers = true;  // Enable marker placement
        console.log("Marker placement enabled after leaving path");
    });

    console.log(path.podcast);

    // Add the logo and name tooltip when the user hovers over the polyline
    polyline.on('mouseover', function () {
        if (polyline !== selectedPolyline) {  // Only highlight if the polyline is not selected
            let tooltipContent;

            if (podcastFromTheList !== undefined) {
                tooltipContent = `
                    <div style="text-align: center; display: flex; flex-direction: column; align-items: center;">
                        <img src="${podcastFromTheList.logoUrl}" alt="${podcastFromTheList.name} Logo" style="max-width: 50px; max-height: 50px; margin-bottom: 10px; object-fit: contain;">
                        <div style="font-weight: bold; color: ${color}; font-size: 14px; text-align: center;">${podcastFromTheList.name}</div>
                    </div>
                `;
            }
            else {
                tooltipContent = `
                    <div style="text-align: center; display: flex; flex-direction: column; align-items: center;">
                        <img src="" alt="Failed To Load" style="max-width: 50px; max-height: 50px; margin-bottom: 10px; object-fit: contain;">
                        <div style="font-weight: bold; color: 000000; font-size: 14px; text-align: center;">Failed</div>
                    </div>
                `;
            }

            polyline.bindTooltip(tooltipContent, { permanent: false, sticky: true }).openTooltip();

            // Highlight the polyline (Change color to red on hover)
            polyline.setStyle({
                color: 'red',  // Change color to red on hover
                weight: 6,     // Thicker line
            });
        }
    });

    // Reset the style when the mouse leaves the polyline
    polyline.on('mouseout', function () {
        polyline.closeTooltip(); // Close the tooltip

        if (polyline !== selectedPolyline) {
            polyline.setStyle({
                color: color,  // Reset to original color
                weight: 4,     // Reset to original weight
            });
        }
    });

    // Click to select the polyline
    polyline.on('click', function () {
        // Prevent the marker from being added (not using L.marker here)
        // If this polyline is already selected, we unselect it
        if (selectedPolyline === polyline) {
            selectedPolyline.setStyle({
                color: color,  // Reset to original color
                weight: 4,     // Reset to original weight
            });
            selectedPolyline = null; // Unselect it
        } else {
            // Deselect the previously selected polyline
            if (selectedPolyline) {
                selectedPolyline.setStyle({
                    color: color,  // Set previous selection to blue
                    weight: 4,      // Default weight
                });
            }

            // Select this polyline
            selectedPolyline = polyline;
            polyline.setStyle({
                color: 'green',  // Set selected polyline to green
                weight: 6,       // Thicker line for selected
            });

            console.log("Selected polyline:", polyline);
        }
    });

    polylines.push(polyline); // Add polyline to the list
}


function removeSavedWalk(walk) {
    map.removeLayer();

    // 1. Remove from the history list visually (before updating localStorage)
    historyList.removeChild(newHistoryItem);

    // 2. Now, remove the walk from the localStorage
    removeWalkFromLocalStorage(walk);

    // 3. After removing, re-render the history list
    renderHistoryList();
}


// Function to add walk to history list
function addHistoryItem(path) {
    var historyList = document.getElementById('history-list');
    var newHistoryItem = document.createElement('li');
    
    // Calculate distance if there are multiple points
    var distance = 0;
    if (path.points && path.points.length > 1) {
        for (let i = 0; i < path.points.length - 1; i++) {
            var pointA = L.latLng(path.points[i].lat, path.points[i].lng);
            var pointB = L.latLng(path.points[i + 1].lat, path.points[i + 1].lng);

            // Calculate the distance between pointA and pointB
            distance += pointA.distanceTo(pointB);  // This gives the distance in meters
        }
    }

    // Format the date nicely
    var date = new Date(path.date);
    var formattedDate = date.toLocaleDateString() + ' ' + date.toLocaleTimeString();

    // Show podcast name, distance, and date
    newHistoryItem.textContent = `${path.podcast} | Distance: ${(distance / 1000).toFixed(2)} km | Date: ${formattedDate}`;

    // Create the delete button
    var deleteButton = document.createElement('button');
    deleteButton.textContent = '🗑️';
    deleteButton.classList.add('deleteBtn');
    
    // Add delete functionality
    deleteButton.onclick = function() {
    };

    // Append the delete button to the history item
    newHistoryItem.appendChild(deleteButton);

    // Add the new history item to the list
    historyList.appendChild(newHistoryItem);

    console.log(distance);
    return distance;
}

// Function to remove a walk from localStorage
function removeWalkFromLocalStorage(path) {
    // Retrieve the walk history from localStorage
    var storedHistory = JSON.parse(localStorage.getItem('walkHistory')) || [];

    // Filter out the walk we want to remove based on its unique properties (e.g., podcast name and date)
    var updatedHistory = storedHistory.filter(function(storedPath) {
        return storedPath.podcast !== path.podcast || storedPath.date !== path.date;
    });

    // Save the updated history back to localStorage
    localStorage.setItem('walkHistory', JSON.stringify(updatedHistory));

    console.log("Walk removed from localStorage:", path);
}

// Function to load and render all saved walks
function renderHistoryList() {
    var historyList = document.getElementById('history-list');
    historyList.innerHTML = ''; // Clear the list before re-rendering

    // Retrieve the walk history from localStorage
    var storedHistory = JSON.parse(localStorage.getItem('walkHistory')) || [];

    // For each stored walk, add it to the list
    storedHistory.forEach(function(path) {
        addHistoryItem(path);  // Add walk item to the list
    });
}

// Function to load saved walks from localStorage on page load
function loadSavedWalks() {
    console.log("Loading saved walks from localStorage...");

    if (localStorage.getItem('walkHistory')) {
        console.log("Found walk history in localStorage.");

        pathHistory = JSON.parse(localStorage.getItem('walkHistory'));
        pathHistory.forEach(function(path) {
            console.log("Loading path: ", path);

            if (path.points && path.points.length > 0) {
                // Filtering the points to ensure only valid lat/lng are included
                const filteredPoints = path.points.filter(function(point) {
                    return point && typeof point.lat === 'number' && typeof point.lng === 'number';
                });

                console.log("Filtered points: ", filteredPoints);

                if (filteredPoints.length > 0) {
                    // Create the polyline or any other map-related processing here
                    addWalkToMap(path);
                } else {
                    console.log("No valid points in path:", path);
                }

                addHistoryItem(path); // Add the history item to the list
            } else {
                console.log("No points found in path:", path);
            }
        });
    } else {
        console.log("No walk history found in localStorage.");
    }
}

// Initial load of saved walks
loadSavedWalks();






let isHoveringPolyline = false; // Tracks hover state over polylines
let isPolylineSelected = false; // Tracks polyline selection state
let selectedPolyline = null; // To keep track of the selected polyline

// Handle hovering over polylines
map.on('mouseover', '.leaflet-interactive', function(event) {
    if (event.target instanceof L.Polyline || event.target instanceof L.Polygon) {
        isHoveringPolyline = true; // The mouse is over a polyline or polygon
    }
});

// Handle mouseout over polylines
map.on('mouseout', '.leaflet-interactive', function(event) {
    if (event.target instanceof L.Polyline || event.target instanceof L.Polygon) {
        isHoveringPolyline = false; // The mouse is no longer over a polyline or polygon
    }
});

// Function to select a polyline
function selectPolyline(polyline) {
    isPolylineSelected = true; // Set flag that polyline is selected
    selectedPolyline = polyline;
    selectedPolyline.setStyle({ color: 'red' }); // Example: Change color to indicate selection
}

// Function to deselect polyline
function deselectPolyline() {
    if (selectedPolyline) {
        selectedPolyline.setStyle({ color: 'blue' }); // Reset color or whatever style change you want
        selectedPolyline = null;
    }
    isPolylineSelected = false; // Reset the selection flag
}

// Add marker only if not hovering or selecting a polyline
map.on('click', function(event) {
    // Check if marker placement is enabled and we are not hovering over or selecting a polyline
    if (isPlacingMarkers && !isHoveringPolyline && !isPolylineSelected) {
        var latLng = event.latlng;
        var marker = L.marker(latLng).addTo(map);

        // Optionally store the marker info
        markers.push(marker);
        // Track walk path if needed (this is just an example)
        pathHistory.push({ latLng: latLng, podcast: null });

        console.log("Marker placed at:", latLng);
    }
});




// Function to save the walk with podcast name and date
document.getElementById('save-walk').addEventListener('click', function() {
    var podcastName = document.getElementById('podcast-input').value;
    
    if (podcastName.trim() === '') {
        alert('Please enter a podcast name!');
        return;
    }
    
    if (pathHistory.length === 0) {
        alert('Please walk and click on the map to create a path!');
        return;
    }

    // Ensure pathHistory only contains valid points
    var validPathHistory = pathHistory.filter(function(path) {
        return path.latLng && typeof path.latLng.lat === 'number' && typeof path.latLng.lng === 'number';
    });


    // Se om namnet på podcastName matchar med en podcast från listan
    let podcastMatchIndex;
    for (let i = 0; i < podcastData.length; i++) {
        if (podcastData[i].name === podcastName) {
            podcastMatchIndex = i;
            break;
        }
    }

    // Save the walk data to localStorage
    var savedWalk = {
        podcastIndex: podcastMatchIndex,
        podcast: podcastName,
        points: validPathHistory.map(function(path) {
            return { lat: path.latLng.lat, lng: path.latLng.lng };
        }),
        date: new Date().toISOString() // Store the current date and time
    };

    // Get existing walks and add the new one
    var storedHistory = JSON.parse(localStorage.getItem('walkHistory')) || [];
    storedHistory.push(savedWalk);
    localStorage.setItem('walkHistory', JSON.stringify(storedHistory));

    // Reset pathHistory and markers for next walk
    for(i = 0; i<markers.length; i++) {
        var current = markers[i];

        map.removeLayer(markers[i])
    }
    markers = [];
    pathHistory = [];
    document.getElementById('podcast-input').value = ''; // Clear podcast input field

    // Update the history list and add the new walk to the map
    addHistoryItem(savedWalk);
    addWalkToMap(savedWalk);

    console.log("Walk saved and cleared.");
});

// Function to clear paths and markers
document.getElementById('clear-paths').addEventListener('click', function() {
    markers.forEach(function(marker) {
        map.removeLayer(marker);
    });
    markers = [];
    

    polylines.forEach(function(polyline) {
        map.removeLayer(polyline);
    });
    polylines = [];
    

    // Clear all saved walk data from localStorage
    localStorage.removeItem('walkHistory');

    // Reset pathHistory
    pathHistory = [];

    // Clear history list
    document.getElementById('history-list').innerHTML = '';

    console.log("Paths, markers, and history cleared.");
});

function undoLastMarker() {
    if (markers.length > 0) {
        let lastMarker = markers.pop(); // Remove last marker from array
        map.removeLayer(lastMarker); // Remove marker from map

        if (pathHistory.length > 0) {
            pathHistory.pop(); // Remove the last recorded position
        }

        // Remove the old polyline
        if (currentPolyline) {
            map.removeLayer(currentPolyline);
        }

        // Re-draw the updated polyline from pathHistory
        if (pathHistory.length > 1) {
            currentPolyline = L.polyline(pathHistory.map(p => p.latLng), { color: 'blue' }).addTo(map);
        }

        console.log("Marker and path history updated");
    } else {
        console.log("No markers left to remove");
    }
}




// Undo button functionality
document.getElementById('undo-btn').addEventListener('click', undoLastMarker);

// Keyboard shortcuts for Undo (Ctrl+Z on Windows/Linux, Cmd+Z on Mac)
document.addEventListener('keydown', function(event) {
    if ((event.ctrlKey || event.metaKey) && event.key === 'z') { 
        event.preventDefault(); // Prevents unintended browser shortcuts (e.g., undoing text input)
        undoLastMarker();
    }
});

let tracking = false;
let watchID = null;
let gpsPath = []; // Temporary GPS path storage
let gpsPolyline = null;
let userMarker; // Store the user's location marker

// Function to create or update the user marker
const createUserMarker = (latlng) => {
    if (!userMarker) {
        userMarker = L.circle([latlng.lat, latlng.lng], {
            color: 'blue',
            fillColor: '#3388ff',
            fillOpacity: 0.6,
            radius: 10
        }).addTo(map);
    } else {
        userMarker.setLatLng([latlng.lat, latlng.lng]); // Update the marker location
    }
};

// Get the user's initial position for setting the marker and centering the map
navigator.geolocation.getCurrentPosition(position => {
    let latlng = { lat: position.coords.latitude, lng: position.coords.longitude };
    createUserMarker(latlng); // Create the marker initially
    map.setView(latlng, 15); // Optionally, adjust the map view to the user's location
}, error => {
    console.error("Error getting initial location:", error);
});

// Function to start/stop tracking
const toggleTracking = () => {
    if (tracking) {
        // Stop tracking
        if (watchID !== null) {
            navigator.geolocation.clearWatch(watchID);
        }
        document.getElementById('toggleTracking').innerText = "Start Tracking";
        alert("Tracking stopped. Now enter the podcast name and save your walk.");
    } else {
        // Start tracking
        gpsPath = []; // Clear previous path
        if (gpsPolyline) {
            map.removeLayer(gpsPolyline); // Remove the previous polyline
        }
        gpsPolyline = L.polyline([], { color: 'blue' }).addTo(map);

        watchID = navigator.geolocation.watchPosition(position => {
            let latlng = { lat: position.coords.latitude, lng: position.coords.longitude };
            gpsPath.push({ latLng: latlng });
            gpsPolyline.addLatLng(latlng);
            map.setView(latlng, 15); // Optionally update map view

            // Update the marker location
            createUserMarker(latlng);
        }, error => {
            console.error("Error getting location:", error);
        }, { enableHighAccuracy: true });

        document.getElementById('toggleTracking').innerText = "Stop Tracking";
    }

    tracking = !tracking;
};

// Save walk data when the user clicks the "Save Walk" button
document.getElementById('save-walk').addEventListener('click', function() {    
    // Ensure path only contains valid points
    var validPathHistory = gpsPath.filter(function(path) {
        return path.latLng && typeof path.latLng.lat === 'number' && typeof path.latLng.lng === 'number';
    });

    // Match podcast name with list (you need to implement podcastData)
    let podcastMatchIndex = podcastData.findIndex(p => p.name === podcastName);

    // Save walk data
    var savedWalk = {
        podcastIndex: podcastMatchIndex,
        podcast: podcastName,
        points: validPathHistory.map(path => path.latLng),
        date: new Date().toISOString()
    };

    // Store in localStorage
    var storedHistory = JSON.parse(localStorage.getItem('walkHistory')) || [];
    storedHistory.push(savedWalk);
    localStorage.setItem('walkHistory', JSON.stringify(storedHistory));

    // Reset everything for the next walk
    gpsPath = [];
    document.getElementById('podcast-input').value = ''; 

    // Update UI (implement these functions)
    addHistoryItem(savedWalk);
    addWalkToMap(savedWalk);

    console.log("Walk saved and cleared.");
});

// Attach event to tracking button
document.getElementById('toggleTracking').addEventListener('click', toggleTracking);

// WebSocket connection and handling
var socket = new WebSocket("wss://mpmc.ddns.net:3000");

socket.onopen = function() {
    console.log("Connected to WebSocket server");
};

socket.onmessage = function(event) {
    try {
        let data = JSON.parse(event.data);
        if (data.lat && data.lng) {
            console.log("Received location:", data);

            // Update marker position
            marker.setLatLng([data.lat, data.lng]);

            // Center map on new location
            map.setView([data.lat, data.lng], 13);
        }
    } catch (error) {
        console.error("Error parsing WebSocket message:", error);
    }
};

socket.onerror = function(error) {
    console.error("WebSocket error:", error);
};

window.addEventListener('load', () => {
    console.log("🔥 Window loaded and script running!");

    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const overlay = document.getElementById('overlay');
    const authPopup = document.getElementById('authPopup');
    const logoutButton = document.getElementById('logoutButton');
    const showRegister = document.getElementById('showRegister');
    const showLogin = document.getElementById('showLogin');

    if (!loginForm || !registerForm || !overlay || !authPopup || !logoutButton) {
        console.error("❌ One or more elements are missing!");
        return;
    }

    console.log("✅ Elements found successfully!");

    // Check if the user is logged in
    function checkAuth() {
        console.log('🔍 Checking auth status...');
        const authToken = localStorage.getItem('authToken');  // Check if there's an authToken in localStorage

        if (authToken) {
            console.log("✅ User is logged in");
            authPopup.style.display = 'none';  // Hide login/register popup
            overlay.style.display = 'none';    // Hide overlay
            logoutButton.style.display = 'block';  // Show logout button
        } else {
            console.log("🔒 User is not logged in");
            authPopup.style.display = 'block';  // Show login/register popup
            overlay.style.display = 'block';    // Show overlay
            logoutButton.style.display = 'none'; // Hide logout button
        }
    }

    // Handle login form submission
    loginForm.addEventListener('submit', async function (event) {
        event.preventDefault();  // Prevent the default form submission (reload)

        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;

        console.log("📝 Submitting login form...");

        // Add more logging to check if form data is being captured
        console.log("Login data: ", email, password);

        try {
            console.log('📡 Sending login request to the server...');
            const response = await fetch('https://mpmc.ddns.net:5000/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            console.log('🧐 Response received from server:', response);

            if (!response.ok) {
                const errorText = await response.text();
                console.error('❌ Login failed. Server responded with:', errorText);
                return;
            }

            const data = await response.json();
            console.log('📥 Received data:', data);

            if (data.token) {
                localStorage.setItem('authToken', data.token);
                console.log('✅ Login successful!');
                checkAuth();  // Run the check to update UI
            } else {
                console.error('❌ Token not received:', data.message);
            }
        } catch (error) {
            console.error('⚠️ Error logging in:', error);
        }
    });

    // Handle registration form submission
    registerForm.addEventListener('submit', async function (event) {
        event.preventDefault();  // Prevent the default form submission (reload)

        const email = document.getElementById('registerEmail').value;
        const password = document.getElementById('registerPassword').value;

        console.log("📝 Submitting register form...");

        // Add more logging to check if form data is being captured
        console.log("Register data: ", email, password);

        try {
            console.log('📡 Sending registration request to the server...');
            const response = await fetch('https://mpmc.ddns.net:5000/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            console.log('🧐 Response received from server:', response);

            if (!response.ok) {
                const errorText = await response.text();
                console.error('❌ Registration failed. Server responded with:', errorText);
                return;
            }

            const data = await response.json();
            console.log('📥 Received data:', data);

            if (data.token) {
                localStorage.setItem('authToken', data.token);
                console.log('✅ Registration successful!');
                checkAuth();  // Run the check to update UI
            } else {
                console.error('❌ Token not received:', data.message);
            }
        } catch (error) {
            console.error('⚠️ Error registering:', error);
        }
    });

    // Logout functionality
    logoutButton.addEventListener('click', () => {
        console.log('🔐 Logging out...');
        localStorage.removeItem('authToken');
        console.log('🚪 Logged out!');
        checkAuth();  // Run the check to update UI
    });

    // Switch between login and register forms
    showRegister.addEventListener('click', () => {
        console.log('📲 Switching to register form...');
        loginForm.style.display = 'none';
        registerForm.style.display = 'block';
        console.log('Showing register form');
    });

    showLogin.addEventListener('click', () => {
        console.log('📲 Switching to login form...');
        registerForm.style.display = 'none';
        loginForm.style.display = 'block';
        console.log('Showing login form');
    });

    // Initial check for auth status
    checkAuth();
});
