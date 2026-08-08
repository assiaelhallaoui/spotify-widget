const path = require("path");
const fs = require("fs");

// On vérifie si le .env existe à côté du fichier source (cas dev / npm start).
// C'est plus fiable que de tester process.defaultApp, qui peut varier
// selon la version d'Electron ou comment le process est lancé.
const devEnvPath = path.join(__dirname, ".env");

// process.resourcesPath n'existe que dans une app packagée (.dmg/.exe).
// Le "|| \"\"" évite un crash si resourcesPath est undefined en dev.
const packagedEnvPath = path.join(process.resourcesPath || "", ".env");

// Si le fichier dev existe, on l'utilise. Sinon on tombe sur le chemin packagé.
const envPath = fs.existsSync(devEnvPath) ? devEnvPath : packagedEnvPath;

require("dotenv").config({ path: envPath });

// Logs temporaires pour vérifier que tout se charge bien —
// à retirer une fois que le login fonctionne
console.log("Chemin .env utilisé:", envPath);
console.log("REDIRECT_URI:", process.env.REDIRECT_URI);

const axios = require("axios");         // used to make http requests to spotify api
const { shell } = require("electron");  // open the url in the user default browser
const http = require("http");           // built-in node module, to spin up a tiny local server

const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const REDIRECT_URI = process.env.REDIRECT_URI; // the url spotify sends the user to after they approve the login

const SCOPES = [ // what we're asking spotify to grant us access to
  "user-read-currently-playing",
  "user-read-playback-state"
];

// login() does 3 things:
// 1. opens the spotify login page in the user's browser
// 2. spins up a temporary local server to catch spotify's redirect
// 3. exchanges the authorization code for an access token + refresh token
function login() {
  // Promise represents the eventual completion (or failure) of this async flow,
  // so renderer.js can "await login()" and get the tokens back once ready
  return new Promise((resolve, reject) => {
    const server = http.createServer(async (req, res) => {
      const url = new URL(req.url, "http://127.0.0.1:8888");

      // only handle requests to /callback, ignore anything else hitting the server
      if (url.pathname === "/callback") {
        const code = url.searchParams.get("code"); // the authorization code spotify gave us

        try {
          // exchange the code for real tokens — must be POSTed as form-urlencoded
          const response = await axios.post(
            "https://accounts.spotify.com/api/token",
            new URLSearchParams({
              grant_type: "authorization_code",
              code: code,
              redirect_uri: REDIRECT_URI, // must match exactly what was used in the auth request
              client_id: CLIENT_ID,
              client_secret: process.env.SPOTIFY_CLIENT_SECRET,
            }),
            { headers: { "content-type": "application/x-www-form-urlencoded" } }
          );

          // shows a success message in the browser tab spotify redirected to
          res.writeHead(200, { "Content-Type": "text/html" });
          res.end("<h2>login successful! you can close this window.</h2>");
          server.close(); // don't need the local server anymore

          // resolve the outer promise so renderer.js can continue with the tokens
          resolve({
            accessToken: response.data.access_token,
            refreshToken: response.data.refresh_token, // used later to get new access tokens without re-login
            expiresIn: response.data.expires_in,        // usually 3600 seconds (1 hour)
          });
        } catch (err) {
          res.writeHead(500);
          res.end("login failed. try again.");
          server.close();
          reject(err.response?.data || err.message);
        }
      }
    });

    // start listening on port 8888 — must match the port in REDIRECT_URI
    server.listen(8888, () => {
      // build spotify's authorization URL
      const url =
        "https://accounts.spotify.com/authorize?" +
        new URLSearchParams({
          client_id: CLIENT_ID,
          response_type: "code",       // we want an authorization code, not a token directly
          redirect_uri: REDIRECT_URI,  // where spotify sends the user back after approval
          scope: SCOPES.join(" "),     // space-separated list of permissions
        });

      // open the login page in the user's actual browser (spotify blocks
      // login attempts inside embedded/electron webviews)
      shell.openExternal(url);
    });
  });
}

// access tokens expire after 1 hour — use the refresh token (doesn't expire)
// to silently get a new one without making the user log in again
async function refreshAccessToken(refreshToken) {
  const response = await axios.post(
    "https://accounts.spotify.com/api/token",
    new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
      client_id: CLIENT_ID,
      client_secret: process.env.SPOTIFY_CLIENT_SECRET,
    }),
    { headers: { "content-type": "application/x-www-form-urlencoded" } }
  );
  return response.data.access_token; // just the new access token, refresh_token stays valid
}

// asks spotify what's currently playing, returns a simplified object or null
async function getCurrentlyPlaying(accessToken) {
  try {
    const res = await axios.get(
      "https://api.spotify.com/v1/me/player/currently-playing",
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );

    // spotify can return 200 with an empty body when nothing is playing
    if (!res.data || !res.data.item) return null;

    return {
      title: res.data.item.name,
      artist: res.data.item.artists.map(a => a.name).join(", "), // handles multiple artists
      albumArt: res.data.item.album.images[0]?.url, // largest album image, if it exists
      isPlaying: res.data.is_playing,
    };
  } catch (err) {
    // spotify sometimes actually responds with an HTTP 204 (No Content) instead
    if (err.response?.status === 204) return null;
    throw err; // re-throw anything else (expired token, network error, etc.)
  }
}

module.exports = { login, refreshAccessToken, getCurrentlyPlaying };