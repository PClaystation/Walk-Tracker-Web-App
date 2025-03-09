const saveWalkButton = document.getElementById('save-walk');
const clearWalksButton = document.getElementById('clear-paths');
const podcastNameInput = document.getElementById('podcast-input');
const historyList = document.getElementById('history-list');
const undoButton = document.getElementById('undo-btn');

const podcastData = [
    {
        name: 'Midnight Burger',
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

class Map {
    constructor(podcastList) {
        this.mapTypes = {
            open: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
            light: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
            dark: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
            satelite: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
            topographic: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}',
        }

        this.map = L.map('map').setView([59.3293, 18.0686], 10); // Coordinates of Stockholm, Sweden for example
        L.tileLayer(this.mapTypes.topographic).addTo(this.map);

        this.markers = [];

        this.allowMarkerPlacement = true;
        this.isHoveringPolyline = false;
        this.isPolylineSelected = false;
        this.selectedPolyline;
        this.selectedWalk;
        this.visibleWalks = [];
        this.cursorHoversMap = false;

        this.podcastList = podcastList;
    }

    findMatchingPodcastIndex(podcastName) {
        for (let i = 0; i < this.podcastList.length; i++) {
            if (this.podcastList[i].name === podcastName) {
                return i;
            }
        }
    }

    showExistingWalks() {
        // Retrieve walks from local storage
        const walks = this.retrieveWalksFromLocalStorage();

        // Remove all previous walks from map and list
        historyList.innerHTML = '';

        this.visibleWalks.forEach(walk => { 
            this.removeWalkFromMap(walk);            
        });

        // Add all walks to map and list
        if (walks.length > 0) {
            walks.forEach(walk => {
                this.showWalkOnMap(walk);
                this.showWalkInHistoryList(walk);
            });
        }
    }

    showWalkInHistoryList(walk) {
        const newHistoryItem = document.createElement('li');
        
        // Calculate distance if there are multiple points
        let distance = 0;
        if (walk.points && walk.points.length > 1) {
            for (let i = 0; i < walk.points.length - 1; i++) {
                const pointA = L.latLng(walk.points[i].lat, walk.points[i].lng);
                const pointB = L.latLng(walk.points[i + 1].lat, walk.points[i + 1].lng);
    
                // Calculate the distance between pointA and pointB
                distance += pointA.distanceTo(pointB);  // This gives the distance in meters
            }
        }
    
        // Format the date nicely
        const date = new Date(walk.date);
        const formattedDate = date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
    
        // Show podcast name, distance, and date
        newHistoryItem.textContent = `${walk.podcastName} | Distance: ${(distance / 1000).toFixed(2)} km | Date: ${formattedDate}`;
    
        // Create the delete button
        const deleteButton = document.createElement('button');
        deleteButton.textContent = '🗑️';
        deleteButton.classList.add('deleteBtn');
        
        // Add delete functionality
        deleteButton.onclick = () => {
            this.removeWalkFromLocalStorage(walk);
            this.showExistingWalks();
        };
    
        // Append the delete button to the history item
        newHistoryItem.appendChild(deleteButton);
    
        // Add the new history item to the list
        historyList.appendChild(newHistoryItem);
    
        return distance;
    }

    showTooltip(walk, color) {
        let tooltipContent;
    
        if (walk.podcast !== undefined) {
            tooltipContent = `
                <div style="text-align: center; display: flex; flex-direction: column; align-items: center;">
                    <img src="${walk.podcast.logoUrl}" alt="${walk.podcast.name} Logo" style="max-width: 50px; max-height: 50px; margin-bottom: 10px; object-fit: contain;">
                    <div style="font-weight: bold; color: ${color}; font-size: 14px; text-align: center;">${walk.podcast.name}</div>
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

        walk.polyline.bindTooltip(tooltipContent, { permanent: false, sticky: true }).openTooltip();
    }

    showWalkOnMap(walk) {
        if ("points" in walk) {
            if (walk.points === undefined) {
                console.log("No points found in walk: ", walk); // Debugging statement
                return;
            }
        }


        //const displayPoints = walk.points.this(point => L.latLng(point.lat, point.lng));
        
        let displayColor; 
        if (walk.podcast !== undefined && walk.podcast.color !== undefined) {
            displayColor = walk.podcast.color;
        }
        else {
            displayColor = '#FFFFFF';
        }

        walk.polyline = L.polyline(walk.points, { color: displayColor, weight: 4 }).addTo(this.map);
        this.visibleWalks.push(walk); // Clear this maybe?

        walk.polyline.on('mouseover', () => {this.allowMarkerPlacement = false;});
        walk.polyline.on('mouseout', () => {this.allowMarkerPlacement = true;});
        
        walk.polyline.on('mouseover', () => {
            if (walk !== this.selectedWalk) {  // Only highlight if the polyline is not selected

                this.showTooltip(walk, displayColor);
                
    
                // Highlight the polyline (Change color to red on hover)
                walk.polyline.setStyle({
                    color: 'red',  // Change color to red on hover
                    weight: 6,     // Thicker line
                });
            }
        });


        walk.polyline.on('mouseout', () => {
            walk.polyline.closeTooltip(); // Close the tooltip

            if (walk !== this.selectedWalk) {
                walk.polyline.setStyle({
                    color: displayColor,  // Reset to original color
                    weight: 4,     // Reset to original weight
                });
            }
        });

        
        walk.polyline.on('click', () => {
            // Prevent the marker from being added (not using L.marker here)
            // If this polyline is already selected, we unselect it
            if (this.selectedWalk === walk) {
                this.deselectWalk(walk, displayColor);
            } else {
                // Deselect the previously selected polyline
                if (this.selectedWalk) {
                    this.deselectWalk(this.selectedWalk, this.selectedWalk.podcast.color);
                }

                this.selectWalk(walk);

                console.log("Selected walk:", walk);
            }
        });
    }

    removeWalkFromMap(walk) {
        this.map.removeLayer(walk.polyline);
    }

    createNewWalk() {
        //if (podcastNameInput.value.trim() === '') {return;}
        if (this.markers.length <= 0) {return;}

        let points = [];
        this.markers.forEach(marker => {
            points.push(marker.latLng);
        });

        //const walk = new Walk(this, podcastNameInput.value, points, new Date().toISOString());

        const walkObj = {
            id: Math.random(),
            podcastName: podcastNameInput.value,
            podcastIndex: this.findMatchingPodcastIndex(podcastNameInput.value),
            podcast: this.podcastList[this.findMatchingPodcastIndex(podcastNameInput.value)],
            points: points,
            date: new Date().toISOString(),
            polyline: null
        };

        for (let i = 0; i < this.markers.length; i++) {
            this.map.removeLayer(this.markers[i].marker);
        }

        podcastNameInput.value = '';
        this.markers = [];

        return walkObj;
    }

    retrieveWalksFromLocalStorage() {
        return JSON.parse(localStorage.getItem('walks'));
    }

    clearAll() {
        localStorage.setItem('walks', JSON.stringify([]));

        this.showExistingWalks();
    }

    saveWalkToLocalStorage(walk) {
        let send = JSON.parse(localStorage.getItem('walks')) || [];
        send.push(walk);
        localStorage.setItem('walks', JSON.stringify(send));
    }

    removeWalkFromLocalStorage(walk) {
        let walks = JSON.parse(localStorage.getItem('walks')) || [];
        walks = walks.filter(obj => obj.id !== walk.id);
        localStorage.setItem('walks', JSON.stringify(walks));
    }

    placeMarker(event) {
        if (this.allowMarkerPlacement && !this.isHoveringPolyline && !this.isPolylineSelected) {
            const latLng = event.latlng;
            const marker = L.marker(latLng).addTo(this.map);
            
            
            this.markers.push({marker: marker, latLng: latLng});
            //pathHistory.push({ latLng: latLng, podcast: null });

            console.log(event.latlng);
        }
    }

    undo() {
        if (this.markers.length > 0) {
            let lastMarker = this.markers.pop(); // Remove last marker from array
            this.map.removeLayer(lastMarker.marker); // Remove marker from map
        }
        else {
            const walks = this.retrieveWalksFromLocalStorage();
            walks.pop();
            localStorage.setItem('walks', JSON.stringify(walks));

            this.showExistingWalks();
        }
    }

    selectWalk(walk) {
        // Select this polyline
        walk.polyline.setStyle({
            color: 'green',  // Set selected polyline to green
            weight: 6,       // Thicker line for selected
        });
        this.selectedWalk = walk;
    }

    deselectWalk(walk, color) {
        walk.polyline.setStyle({
            color: color,  // Reset to original color
            weight: 4,     // Reset to original weight
        });
        this.selectedWalk = null; // Unselect it
    }

    createSaveShowWalk() {
        const newWalk = this.createNewWalk();
        if (newWalk !== undefined && newWalk.podcastName !== "") {
            console.log(newWalk);
    
            this.saveWalkToLocalStorage(newWalk);
            this.showExistingWalks();
        
            console.log("walk!");
        }
        else {
            alert("Bruh!");
        }
    }
}


const socket = new WebSocket("wss://mpmc.ddns.net:3000");
const testMap = new Map(podcastData);

testMap.showExistingWalks();

// Handling events

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




saveWalkButton.addEventListener('click', (event) => {
    testMap.createSaveShowWalk();
});

clearWalksButton.addEventListener('click', (event) => {
    testMap.clearAll();
});

undoButton.addEventListener('click', () => {
    testMap.undo();
});




document.addEventListener('keydown', (event) => {
    if ((event.ctrlKey || event.metaKey) && event.key === 'z') { 
        event.preventDefault(); // Prevents unintended browser shortcuts (e.g., undoing text input)
        testMap.undo();
    }

    if (event.key === 'Backspace' || event.key === 'Delete') { // Should only be selected
        if (testMap.selectedWalk !== null) {
            testMap.removeWalkFromLocalStorage(testMap.selectedWalk);
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







// Login/Registration Events

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