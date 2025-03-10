const clientId = "4cbcfcd8885c4a7598ebc0523ddb20cf"; // Replace with your Spotify Client ID
const clientSecret = "f438fa91f23542f4af4ff2ee1a01696a"; // Replace with your Spotify Client Secret

async function getAccessToken() {
    const response = await fetch("https://accounts.spotify.com/api/token", {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            "Authorization": "Basic " + btoa(clientId + ":" + clientSecret),
        },
        body: "grant_type=client_credentials"
    });

    const data = await response.json();
    return data.access_token;
}

async function getPodcastCover(podcastName) {
    const token = await getAccessToken();

    const response = await fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(podcastName)}&type=show`, {
        headers: {
            "Authorization": `Bearer ${token}`
        }
    });

    const data = await response.json();

    if (data.shows.items.length > 0) {
        return data.shows.items[0].images[0].url; // Get the first podcast's cover
    } else {
        return null;
    }
}

export async function searchPodcast() {
    //const podcastName = document.getElementById("podcastName").value;
    const coverImage = await getPodcastCover("Derelict");

    if (coverImage) {
        console.log(coverImage);

        /*
        document.getElementById("coverImage").src = coverImage;
        document.getElementById("coverImage").style.display = "block";*/
    } else {
        alert("No podcast cover found.");
    }
}