// import our custom functions from spotifyAuth.js
const { login, refreshAccessToken, getCurrentlyPlaying } = require("./spotifyAuth");

// these live in memory -> so have to login everytime i open the app
let accessToken = null;
let refreshToken = null;

// grabs the info 
const titleEl = document.getElementById("songTitle");
const artistEl = document.getElementById("songArtist");
const artEl = document.getElementById("albumArt");

// event for when the login button is clicked 
document.getElementById("loginButton").addEventListener("click", async () => {
  try {
    const tokens = await login();
    accessToken = tokens.accessToken;
    refreshToken = tokens.refreshToken;

    // hides the login button now that we're logged in
    document.getElementById("loginButton").style.display = "none";

    updateNowPlaying(); // premier fetch immédiat
    setInterval(updateNowPlaying, 5000); // puis toutes les 5 sec (scrutation)

    // refresh le token un peu avant qu'il expire
    setInterval(async () => {
      accessToken = await refreshAccessToken(refreshToken);
    }, 50 * 60 * 1000); 

  } catch (err) {
    console.error("Login failed:", err);
  }
});


async function updateNowPlaying() {
  if (!accessToken) return;

  try {
    const song = await getCurrentlyPlaying(accessToken);

    if (!song) {
      titleEl.textContent = "nothing currently playing :( ";
      artistEl.textContent = "put something on !";
      artEl.style.display = "none"; // add a :( face mdr
      return;
    }

    titleEl.textContent = song.title;
    artistEl.textContent = song.artist;

    if (song.albumArt) {
      artEl.src = song.albumArt;
      artEl.style.display = "block";
    }

  } catch (err) {
    console.error("Erreur récupération chanson:", err.response?.data || err.message);
  }
}

const {ipcRenderer} = require("electron"); // for the close button
document.getElementById("closeButton").addEventListener("click", () => {
    ipcRenderer.send("close-app");
});