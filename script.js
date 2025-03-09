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
}

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
    const newWalk = testMap.createNewWalk();
    if (newWalk !== undefined && newWalk.podcastName !== "") {
        console.log(newWalk);

        testMap.saveWalkToLocalStorage(newWalk);
        testMap.showExistingWalks();
    
        console.log("walk!");
    }
    else {
        alert("Bruh!");
    }
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
});

document.addEventListener('click', (event) => {

    console.log(testMap.cursorHoversMap);

    if (!testMap.cursorHoversMap) {

        if (testMap.selectedWalk) {
            testMap.deselectWalk(testMap.selectedWalk, testMap.selectedWalk.podcast.color);
        }
        
    }

});
