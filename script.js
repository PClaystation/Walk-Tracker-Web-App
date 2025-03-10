const saveWalkButton = document.getElementById('save-walk');
const clearWalksButton = document.getElementById('clear-paths');
const undoButton = document.getElementById('undo-btn');
const saveGPSWalkButton = document.getElementById('save-gps-walk');

import { podcastData } from "./data.js";
import { Map } from "./map.js";
import { searchPodcast } from "./spotifyfetch.js";
import { LocalStorageHandler } from "./storageHandler.js";

const socket = new WebSocket("wss://mpmc.ddns.net:3000");
const localStorageHandler = new LocalStorageHandler();
const testMap = new Map(localStorageHandler, podcastData);

console.log(localStorageHandler.retrieveWalksFromLocalStorage());
testMap.showExistingWalks();


searchPodcast();




// *******
// Handling map events
// ******

testMap.map.on('mouseover', (event) => {
    testMap.cursorHoversMap = true;

    if (event.target instanceof L.Polyline || event.target instanceof L.Polygon) {
        testMap.isHoveringPolyline = true; // The mouse is over a polyline or polygon
    }
});

testMap.map.on('mouseout', (event) => {
    testMap.cursorHoversMap = false;

    if (event.target instanceof L.Polyline || event.target instanceof L.Polygon) {
        testMap.isHoveringPolyline = false; // The mouse is no longer over a polyline or polygon
    }
});

testMap.map.on('click', (event) => {
    testMap.cursorHoversMap = true;
    testMap.placeMarker(event);
});




// *******
// Handling walk events
// *******

saveWalkButton.addEventListener('click', (event) => {
    console.log("");
    console.log("");
    console.log("");
    console.log("");

    testMap.createSaveShowWalk();
});

clearWalksButton.addEventListener('click', (event) => {
    localStorageHandler.clearLocalStorage();
    testMap.showExistingWalks();
});

undoButton.addEventListener('click', () => {
    testMap.undo();
});



// *******
// Handling key events
// *******

document.addEventListener('keydown', (event) => {
    if ((event.ctrlKey || event.metaKey) && event.key === 'z') { 
        event.preventDefault(); // Prevents unintended browser shortcuts (e.g., undoing text input)
        testMap.undo();
    }

    if (event.key === 'Backspace' || event.key === 'Delete') { // Should only be selected
        if (testMap.selectedWalk !== null) {
            localStorageHandler.removeWalkFromLocalStorage(testMap.selectedWalk);
            testMap.showExistingWalks();
        }
    }

    if (event.key === 'Enter') {
        testMap.createSaveShowWalk();
    }
});

document.addEventListener('click', (event) => {
    console.log(testMap.cursorHoversMap);

    if (!testMap.cursorHoversMap) {
        if (testMap.selectedWalk) {
            testMap.deselectWalk(testMap.selectedWalk, testMap.selectedWalk.podcast.color);
        }
    }
});





// *******
// GPS Events
// *******

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
        }).addTo(testMap.map);
    } else {
        userMarker.setLatLng([latlng.lat, latlng.lng]); // Update the marker location
    }
};

// Get the user's initial position for setting the marker and centering the map
navigator.geolocation.getCurrentPosition(position => {
    let latlng = { lat: position.coords.latitude, lng: position.coords.longitude };
    createUserMarker(latlng); // Create the marker initially
    testMap.map.setView(latlng, 15); // Optionally, adjust the map view to the user's location
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
            testMap.map.removeLayer(gpsPolyline); // Remove the previous polyline
        }
        gpsPolyline = L.polyline([], { color: 'blue' }).addTo(testMap.map);

        watchID = navigator.geolocation.watchPosition(position => {
            let latlng = { lat: position.coords.latitude, lng: position.coords.longitude };
            gpsPath.push({ latLng: latlng });
            gpsPolyline.addLatLng(latlng);
            testMap.map.setView(latlng, 15); // Optionally update map view

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
saveGPSWalkButton.addEventListener('click', function() {    
    // Ensure path only contains valid points
    let validPathHistory = gpsPath.filter(function(path) {
        return path.latLng && typeof path.latLng.lat === 'number' && typeof path.latLng.lng === 'number';
    });


    testMap.createSaveShowWalk(validPathHistory.map(path => path.latLng));

    /*
    // Match podcast name with list (you need to implement podcastData)
    let podcastMatchIndex = podcastData.findIndex(p => p.name === podcastName);
    */

    /*
    // Save walk data
    var savedWalk = {
        podcastIndex: podcastMatchIndex,
        podcast: podcastName,
        points: validPathHistory.map(path => path.latLng),
        date: new Date().toISOString()
    };*/

    /*
    // Store in localStorage
    var storedHistory = JSON.parse(localStorage.getItem('walkHistory')) || [];
    storedHistory.push(savedWalk);
    localStorage.setItem('walkHistory', JSON.stringify(storedHistory));
    */ 

    // Reset everything for the next walk
    gpsPath = [];
    document.getElementById('podcast-input').value = ''; 

    /*
    // Update UI (implement these functions)
    addHistoryItem(savedWalk);         // Detta kommer inte längre att fungera
    addWalkToMap(savedWalk);
    */
    console.log("Walk saved and cleared.");
});

// Attach event to tracking button
document.getElementById('toggleTracking').addEventListener('click', toggleTracking);





// *******
// Login/Registration Events
// *******

document.addEventListener("DOMContentLoaded", () => {
    const authForm = document.getElementById("authForm");
    const authTitle = document.getElementById("authTitle");
    const switchToRegisterLink = document.getElementById("switchToRegister");
    const switchToLoginLink = document.getElementById("switchToLogin");
    const overlay = document.getElementById("overlay");
    const authPopup = document.getElementById("authPopup");

    let isSignup = false; // Track whether the user is on the sign-up form or login form

    // Show the login/signup modal on page load
    overlay.style.display = "block"; // Show the overlay
    authPopup.style.display = "block"; // Show the authPopup modal

    // Toggle between login and sign-up
    switchToRegisterLink.addEventListener("click", (e) => {
        e.preventDefault();
        isSignup = true;
        authTitle.textContent = "Sign Up";
        document.getElementById("authSubmit").textContent = "Sign Up";
        document.getElementById("registerForm").style.display = "block";
        document.getElementById("loginForm").style.display = "none";
    });

    switchToLoginLink.addEventListener("click", (e) => {
        e.preventDefault();
        isSignup = false;
        authTitle.textContent = "Login";
        document.getElementById("authSubmit").textContent = "Login";
        document.getElementById("registerForm").style.display = "none";
        document.getElementById("loginForm").style.display = "block";
    });

    // Form submission logic
    authForm.addEventListener("submit", (e) => {
        e.preventDefault(); // Prevent default form submission
        
        const email = document.getElementById("authEmail").value;
        const password = document.getElementById("authPassword").value;

        console.log(`📝 Submitting ${isSignup ? 'sign-up' : 'login'} form...`);
        console.log(`Login data: ${email} ${password}`);
        
        const endpoint = isSignup ? '/api/auth/register' : '/api/auth/login'; // API endpoint changes based on action
        
        console.log(`📡 Sending request to ${endpoint}`);
        
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
            if (response.ok) {
                return response.json();
            } else {
                throw new Error(`${isSignup ? 'Sign-up' : 'Login'} failed`);
            }
        })
        .then((data) => {
            console.log(`${isSignup ? 'Sign-up' : 'Login'} success:`, data);
            // Hide the auth popup when the user successfully logs in or signs up
            overlay.style.display = "none"; // Hide the overlay
            authPopup.style.display = "none"; // Hide the popup
            // You can redirect the user or show a success message here
        })
        .catch((error) => {
            console.error(error);
            alert(`${isSignup ? 'Sign-up' : 'Login'} failed. Please check your credentials.`);
        });
    });
});

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

    /*
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
    */

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