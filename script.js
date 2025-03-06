// Initialize the map and setup
/*var map = L.map('map').setView([59.3293, 18.0686], 13); // Coordinates of Stockholm, Sweden for example

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

var markers = [];  // Array to store markers
var pathHistory = []; // Array to store the path history
var polylines = []; // Array to store polylines
let isPlacingMarkers = true;  // Initially, marker placement is enabled
*/

const saveWalkButton = document.getElementById('save-walk');
const clearWalksButton = document.getElementById('clear-paths');
const podcastNameInput = document.getElementById('podcast-input');

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

class Walk {
    constructor(podcastName, points, date) {
        this.podcastName = podcastName;
        this.podcastIndex = this.findMatchingPodcastIndex(podcastData);
        this.podcastObject = podcastData[this.podcastIndex];
        this.points = points;
        this.date = date;
    }

    findMatchingPodcastIndex(podcastList) {
        let podcastMatchIndex;
        for (let i = 0; i < podcastList.length; i++) {
            if (podcastList[i].name === this.podcastName) {
                podcastMatchIndex = i;
                break;
            }
        }

        return podcastMatchIndex;
    }
}

class Map {
    constructor() {
        this.map = L.map('map').setView([59.3293, 18.0686], 13); // Coordinates of Stockholm, Sweden for example
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(this.map);

        this.markers = [];

        this.allowMarkerPlacement = true;
        this.isHoveringPolyline = false;
        this.isPolylineSelected = false;
        this.selectedPolyline;
    }

    showExistingWalks() {
        // Retrieve walks from local storage
        const walks = this.retrieveWalksFromLocalStorage();

        // Remove all previous walks from map and list

        // Add all walks to map and list
        walks.forEach(walk => {
            this.showWalkOnMap(walk);
        });
    }

    showWalkInHistoryList(walk) {
        const historyList = document.getElementById('history-list');
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
        var date = new Date(walk.date);
        var formattedDate = date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
    
        // Show podcast name, distance, and date
        newHistoryItem.textContent = `${walk.podcast} | Distance: ${(distance / 1000).toFixed(2)} km | Date: ${formattedDate}`;
    
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

    showWalkOnMap(walk) {
        if (walk.points === undefined) {
            console.log("No points found in walk: ", walk); // Debugging statement
            return;
        }

        //const displayPoints = walk.points.map(point => L.latLng(point.lat, point.lng));
        
        let displayColor; 
        if (this.podcast !== undefined && this.podcast.color !== undefined) {
            displayColor = this.podcast.color;
        }
        else {
            displayColor = '#FFFFFF';
        }

        const polyline = L.polyline(walk.points, { color: displayColor, weight: 4 }).addTo(this.map);

        polyline.on('mouseover', () => {this.allowMarkerPlacement = false;});
        polyline.on('mouseout', () => {this.allowMarkerPlacement = true;});
        
        
        polyline.on('mouseover', () => {
            if (polyline !== this.selectedPolyline) {  // Only highlight if the polyline is not selected
                let tooltipContent;
    
                if (this.podcast !== undefined) {
                    tooltipContent = `
                        <div style="text-align: center; display: flex; flex-direction: column; align-items: center;">
                            <img src="${this.podcast.logoUrl}" alt="${this.podcast.name} Logo" style="max-width: 50px; max-height: 50px; margin-bottom: 10px; object-fit: contain;">
                            <div style="font-weight: bold; color: ${displayColor}; font-size: 14px; text-align: center;">${this.podcast.name}</div>
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


        polyline.on('mouseout', () => {
            polyline.closeTooltip(); // Close the tooltip

            if (polyline !== this.selectedPolyline) {
                polyline.setStyle({
                    color: displayColor,  // Reset to original color
                    weight: 4,     // Reset to original weight
                });
            }
        });

        
        polyline.on('click', () => {
            // Prevent the marker from being added (not using L.marker here)
            // If this polyline is already selected, we unselect it
            if (this.selectedPolyline === polyline) {
                this.selectedPolyline.setStyle({
                    color: displayColor,  // Reset to original color
                    weight: 4,     // Reset to original weight
                });
                this.selectedPolyline = null; // Unselect it
            } else {
                // Deselect the previously selected polyline
                if (this.selectedPolyline) {
                    this.selectedPolyline.setStyle({
                        color: displayColor,  // Set previous selection to blue
                        weight: 4,      // Default weight
                    });
                }

                // Select this polyline
                this.selectedPolyline = polyline;
                polyline.setStyle({
                    color: 'green',  // Set selected polyline to green
                    weight: 6,       // Thicker line for selected
                });

                console.log("Selected polyline:", polyline);
            }
        });
    }

    createNewWalk() {
        //if (podcastNameInput.value.trim() === '') {return;}
        if (this.markers.length <= 0) {return;}

        let points = [];
        this.markers.forEach(marker => {
            points.push(marker.latLng);
        });

        console.log(points);

        const walk = new Walk(podcastNameInput.value, points, new Date().toISOString());

        for (let i = 0; i < this.markers.length; i++) {
            this.map.removeLayer(this.markers[i].marker);
        }

        podcastNameInput.value = '';
        this.markers = [];

        this.saveWalkToLocalStorage(walk);

        return walk;
    }

    retrieveWalksFromLocalStorage() {
        return JSON.parse(localStorage.getItem('walks'));
    }

    saveWalkToLocalStorage(walk) {
        let send = JSON.parse(localStorage.getItem('walks')) || [];
        send.push(walk);
        localStorage.setItem('walks', JSON.stringify(send));
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
}

const testMap = new Map();
testMap.showExistingWalks();


// Handling events

testMap.map.on('mouseover', '.leaflet-interactive', (event) => {
    if (event.target instanceof L.Polyline || event.target instanceof L.Polygon) {
        testMap.isHoveringPolyline = true; // The mouse is over a polyline or polygon
    }
});


testMap.map.on('mouseout', '.leaflet-interactive', (event) => {
    if (event.target instanceof L.Polyline || event.target instanceof L.Polygon) {
        testMap.isHoveringPolyline = false; // The mouse is no longer over a polyline or polygon
    }
});


testMap.map.on('click', (event) => {
    testMap.placeMarker(event);
});

saveWalkButton.addEventListener('click', (event) => {
     // Needs points from markers
    testMap.createNewWalk();
    testMap.showExistingWalks();

    console.log("walk!");
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
function addWalkToMap(path) { // Path är så såntdär objekt
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





/*
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

    if (validPathHistory.length === 0) {
        alert('No valid points to save!');
        return;
    }

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

*/

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



/*
// Undo button functionality
document.getElementById('undo-btn').addEventListener('click', undoLastMarker);

// Keyboard shortcuts for Undo (Ctrl+Z on Windows/Linux, Cmd+Z on Mac)
document.addEventListener('keydown', function(event) {
    if ((event.ctrlKey || event.metaKey) && event.key === 'z') { 
        event.preventDefault(); // Prevents unintended browser shortcuts (e.g., undoing text input)
        undoLastMarker();
    }
});
*/