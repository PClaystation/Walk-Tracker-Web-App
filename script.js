const saveWalkButton = document.getElementById('save-walk');
const clearWalksButton = document.getElementById('clear-paths');
const undoButton = document.getElementById('undo-btn');
const saveGPSWalkButton = document.getElementById('save-gps-walk');
const guestButton = document.getElementById('guest-button');
const podcastNameInput = document.getElementById('podcast-input');

import { podcastData } from "./data.js";
import { Map } from "./map.js";
import { searchPodcast } from "./spotifyfetch.js";
import { LocalStorageHandler } from "./storageHandler.js";

const socket = new WebSocket("wss://mpmc.ddns.net:5000");
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
        if (document.activeElement === podcastNameInput) {
            testMap.createSaveShowWalk();
        }
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
            radius: 20
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
// UI stuff
// *******


// *******
// Login/Registration Events
// *******
guestButton.onclick = function () {
    overlay.style.display = "none"; // Hide the overlay
    authPopup.style.display = "none"; // Hide the popup
}

document.addEventListener("DOMContentLoaded", () => {
    const authForm = document.getElementById("authForm");
    const authTitle = document.getElementById("authTitle");
    const switchToRegisterLink = document.getElementById("switchToRegister");
    const switchToLoginLink = document.getElementById("switchToLogin");
    const overlay = document.getElementById("overlay");
    const authPopup = document.getElementById("authPopup");
    const darkModeToggle = document.getElementById("dark-mode-toggle");

    // Apply dark mode if previously set
    if (localStorage.getItem("theme") === "dark") {
        document.body.classList.add("dark-mode");
    }

    // Function to toggle dark mode
    function toggleDarkMode() {
        document.body.classList.toggle("dark-mode");
        if (document.body.classList.contains("dark-mode")) {
            localStorage.setItem("theme", "dark");
        } else {
            localStorage.setItem("theme", "light");
        }
    }

    // Dark mode toggle listener
    if (darkModeToggle) {
        darkModeToggle.addEventListener("click", toggleDarkMode);
    }

    // Show login popup
    overlay.style.display = "block";
    authPopup.style.display = "block";

    let isSignup = false;

    // Switch to register view
    switchToRegisterLink.addEventListener("click", (e) => {
        e.preventDefault();
        isSignup = true;
        authTitle.textContent = "Sign Up";
        document.getElementById("authSubmit").textContent = "Sign Up";
        //document.getElementById("registerForm").style.display = "block";
        //document.getElementById("loginForm").style.display = "none";
    });

    // Switch to login view
    switchToLoginLink.addEventListener("click", (e) => {
        e.preventDefault();
        isSignup = false;
        authTitle.textContent = "Login";
        document.getElementById("authSubmit").textContent = "Login";
        //document.getElementById("registerForm").style.display = "none";
        //document.getElementById("loginForm").style.display = "block";
    });

    // Form submission logic
    authForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const email = document.getElementById("authEmail").value;
        const password = document.getElementById("authPassword").value;

        const endpoint = isSignup ? '/api/auth/register' : '/api/auth/login';
        
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
            localStorage.setItem("authToken", data.token); // Save auth token
            overlay.style.display = "none";
            authPopup.style.display = "none";
            checkAuth(); // Check auth status after successful login/signup
        })
        .catch((error) => {
            console.error(error);
            alert(`${isSignup ? 'Sign-up' : 'Login'} failed. Please check your credentials.`);
        });
    });

    // Check login status on page load
    checkAuth();
});

// Function to check if user is logged in
function checkAuth() {
    const authToken = localStorage.getItem('authToken');
    const overlay = document.getElementById('overlay');
    const authPopup = document.getElementById('authPopup');
    const logoutButton = document.getElementById('logoutButton');

    if (authToken) {
        overlay.style.display = "none";
        authPopup.style.display = "none";
        logoutButton.style.display = "block";  // Show logout button
    } else {
        overlay.style.display = "block";
        authPopup.style.display = "block";
        logoutButton.style.display = "none";  // Hide logout button
    }
}
