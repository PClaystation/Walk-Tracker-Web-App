// Initialize the map and setup
var map = L.map('map').setView([59.3293, 18.0686], 13); // Coordinates of Stockholm, Sweden for example

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

var markers = [];  // Array to store markers
var pathHistory = []; // Array to store the path history
var polylines = []; // Array to store polylines

const podcastData = [
    {
        name: 'Midnight burger',
        color: '#FF5733',
        logoUrl: 'Images/Midnight_burger.jpeg',  // Replace with the actual logo URL
        path: [[51.5, -0.09], [51.6, -0.1]]
    },
    {
        name: 'Derelict',
        color: '#33FF57',
        logoUrl: 'Images/Derelict.jpeg',  // Replace with the actual logo URL
        path: [[51.4, -0.12], [51.7, -0.14]]
    },
    {
        name: 'The White Vault',
        color: '#33FF57',
        logoUrl: 'Images/White_vault.jpeg',  // Replace with the actual logo URL
        path: [[51.4, -0.12], [51.7, -0.14]]
    },
    {
        name: 'Paralyzed',
        color: '#33FF57',
        logoUrl: 'Images/Paralyzed.jpeg',  // Replace with the actual logo URL
        path: [[51.4, -0.12], [51.7, -0.14]]
    },
    {
        name: 'Tower 4',
        color: '#33FF57',
        logoUrl: 'Images/Tower_4.jpeg',  // Replace with the actual logo URL
        path: [[51.4, -0.12], [51.7, -0.14]]
    },
    {
        name: 'Station 151',
        color: '#33FF57',
        logoUrl: 'Images/Station_151.jpeg',  // Replace with the actual logo URL
        path: [[51.4, -0.12], [51.7, -0.14]]
    },
    {
        name: 'Red Valley',
        color: '#33FF57',
        logoUrl: 'Images/Red_valley.jpeg',  // Replace with the actual logo URL
        path: [[51.4, -0.12], [51.7, -0.14]]
    },
    {
        name: 'OZ 9',
        color: '#33FF57',
        logoUrl: 'Images/Oz_9.jpeg',  // Replace with the actual logo URL
        path: [[51.4, -0.12], [51.7, -0.14]]
    },
    {
        name: 'End Of All Hope',
        color: '#33FF57',
        logoUrl: 'Images/EOAH.jpeg',  // Replace with the actual logo URL
        path: [[51.4, -0.12], [51.7, -0.14]]
    },
    {
        name: 'Desert Skies',
        color: '#33FF57',
        logoUrl: 'Images/Desert_skies.jpeg',  // Replace with the actual logo URL
        path: [[51.4, -0.12], [51.7, -0.14]]
    },
    {
        name: 'Crystal Blues',
        color: '#33FF57',
        logoUrl: 'Images/Crystal_blues.jpeg',  // Replace with the actual logo URL
        path: [[51.4, -0.12], [51.7, -0.14]]
    },
    {
        name: 'Ars Paradoxica',
        color: '#33FF57',
        logoUrl: 'Images/Ars_paradoxica.jpeg',  // Replace with the actual logo URL
        path: [[51.4, -0.12], [51.7, -0.14]]
    },

];

podcastData.forEach(podcast => {
    console.log("Adding polyline for podcast: ", podcast.name); // Debugging statement

    const line = L.polyline(podcast.path, {
        color: podcast.color,  // Use the podcast-specific color
        weight: 5
    }).addTo(map);

    console.log("Created polyline with path: ", podcast.path); // Debugging statement
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

    var polyline = L.polyline(points, { color: color, weight: 4 }).addTo(map);

    console.log(path.podcast);

    // Bind tooltip with the podcast name and show it when hovering
    /*
    polyline.bindTooltip(path.podcast, {
        permanent: false,  // Only shows on hover
        direction: "top",  // Appears above the line
        offset: [0, -5]    // Small offset for better visibility
        
    });
    */

    const podcastFromTheList = podcastData[path.podcastIndex];

    // Add the logo and name tooltip when the user hovers over the polyline
    polyline.on('mouseover', function () {
        let tooltipContent;

        if (podcastFromTheList !== undefined) {
            tooltipContent = `
                <div style="text-align: center; display: flex; flex-direction: column; align-items: center;">
                    <img src="${podcastFromTheList.logoUrl}" alt="${podcastFromTheList.name} Logo" style="max-width: 50px; max-height: 50px; margin-bottom: 10px; object-fit: contain;">
                    <div style="font-weight: bold; color: ${podcastFromTheList.color}; font-size: 14px; text-align: center;">${podcastFromTheList.name}</div>
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
    });
    

    polyline.on('mouseout', function () {
        //console.log("Mouseout from line: ", podcastFromTheList.name); // Debugging statement
        polyline.closeTooltip();
    });

    polylines.push(polyline);
}



// Load saved walks from localStorage and update history list
function loadSavedWalks() {
    console.log("Loading saved walks from localStorage..."); // Debugging statement

    if (localStorage.getItem('walkHistory')) {
        console.log("Found walk history in localStorage."); // Debugging statement

        pathHistory = JSON.parse(localStorage.getItem('walkHistory'));
        pathHistory.forEach(function(path) {
            console.log("Loading path: ", path); // Debugging statement

            if (path.points && path.points.length > 0) {
                // Filtering the points to ensure only valid lat/lng are included
                const filteredPoints = path.points.filter(function(point) {
                    return point && typeof point.lat === 'number' && typeof point.lng === 'number'; // Only keep valid points
                });

                console.log("Filtered points: ", filteredPoints); // Debugging statement

                if (filteredPoints.length > 0) {
                    // Create the polyline or any other map-related processing here
                    addWalkToMap(path); // Assuming this function uses the filtered points internally
                } else {
                    console.log("No valid points in path:", path); // Debugging statement
                }

                addHistoryItem(path); // Assuming you want to still log history even if points are invalid
            } else {
                console.log("No points found in path:", path); // Debugging statement
            }
        });
    } else {
        console.log("No walk history found in localStorage."); // Debugging statement
    }
}




// Initial load of saved walks
loadSavedWalks();

// Function to add walk to history list
function addHistoryItem(path) {
    var historyList = document.getElementById('history-list');
    var newHistoryItem = document.createElement('li');
    
    // Calculate distance if there are multiple points
    var distance = 0;
    if (path.points && path.points.length > 1) {
        for (let i = 0; i < path.points.length - 1; i++) {
            var pointA = path.points[i];
            var pointB = path.points[i + 1];

            // Ensure the points are valid before calculating the distance
            if (pointA && pointB && pointA.latLng && pointB.latLng) {
                distance += pointA.latLng.distanceTo(pointB.latLng);
            }
            else {
                console.log("didn't find valid points");
            }
        }
    }

    // Format the date nicely
    var date = new Date(path.date);
    var formattedDate = date.toLocaleDateString() + ' ' + date.toLocaleTimeString();

    // Show podcast name, distance, and date
    newHistoryItem.textContent = `${path.podcast} | Distance: ${(distance / 1000).toFixed(2)} km | Date: ${formattedDate}`;
    historyList.appendChild(newHistoryItem);

    console.log(distance);
    return distance;
}

// Add a marker on click to log the walk's path
map.on('click', function(e) {
    var latLng = e.latlng;
    var marker = L.marker(latLng).addTo(map);
    
    // Push marker and latLng into pathHistory
    if (latLng && latLng.lat && latLng.lng) {
        markers.push(marker);
        pathHistory.push({ latLng: latLng, podcast: null }); // Keep track of the walk's path (without podcast name initially)
    } else {
        console.warn('Invalid latLng encountered:', latLng); // Debugging invalid latLng
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
