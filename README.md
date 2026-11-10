# Spotify Now Playing Widget 🎵

A customizable desktop widget built with **Electron, JavaScript, and the Spotify Web API** that displays your currently playing Spotify track in a compact, aesthetic interface.

## Overview

This project is a lightweight desktop application that connects to a user's Spotify account and displays real-time information about the currently playing song.

The widget features a custom frameless window, album artwork, song titles, and artist information, with automatic updates every five seconds.

## Features

- **Spotify Authentication:** Connects to Spotify using the OAuth 2.0 Authorization Code flow.
- **Real-Time Track Updates:** Retrieves the currently playing song every five seconds.
- **Album Artwork:** Displays the album cover of the current track.
- **Track Information:** Shows the song title and artist names.
- **Automatic Token Refresh:** Refreshes Spotify access tokens to maintain the session.
- **Custom Desktop Interface:** Frameless, transparent Electron window with a personalized design.
- **Draggable Window:** Allows the widget to be repositioned on the desktop.
- **Playback Detection:** Displays a message when no song is currently playing.

## Tech Stack

| Technology | Purpose |
|---|---|
| JavaScript | Application logic and DOM manipulation |
| Electron | Desktop application framework |
| Node.js | Local HTTP server and authentication |
| Spotify Web API | Real-time playback information |
| Axios | HTTP requests |
| OAuth 2.0 | Spotify account authentication |
| HTML/CSS | Interface design and styling |
| dotenv | Environment variable configuration |

## How It Works

1. The user clicks **Login with Spotify**.
2. The application opens Spotify's authorization page in the default browser.
3. A temporary local HTTP server receives the OAuth authorization callback.
4. The authorization code is exchanged for access and refresh tokens.
5. The application requests the currently playing track from the Spotify Web API.
6. The widget displays the album artwork, song title, and artist.
7. Track information updates automatically every five seconds.

Access tokens are refreshed periodically to keep the connection active.

## Project Structure

```text
spotify-widget/
├── main.js
├── renderer.js
├── spotifyAuth.js
├── index.html
├── styles.css
├── background_app.jpg
├── package.json
├── .env
└── .gitignore
```

*The background image, package configuration, and environment files are required or recommended supporting files; they were not included in the reviewed source files.*

## Installation

### Prerequisites

- Node.js and npm
- A Spotify account
- A Spotify Developer application

### Setup

**1. Clone the repository**

```bash
git clone https://github.com/assiaelhallaoui/spotify-widget.git
cd spotify-widget
```

Replace the repository URL if your GitHub repository uses a different name.

**2. Install dependencies**

```bash
npm install
```

**3. Configure Spotify credentials**

Create an application through the [Spotify Developer Dashboard](https://developer.spotify.com/dashboard).

Configure the redirect URI as:

```text
http://127.0.0.1:8888/callback
```

Create a `.env` file in the project root:

```env
SPOTIFY_CLIENT_ID=your_client_id
SPOTIFY_CLIENT_SECRET=your_client_secret
REDIRECT_URI=http://127.0.0.1:8888/callback
```

**Never commit your `.env` file or Spotify client secret to GitHub.**

**4. Launch the application**

```bash
npm start
```

This assumes the project's `package.json` includes an Electron start script.

**5. Connect Spotify**

Click **Login with Spotify**, authorize access in your browser, and return to the widget.

Start playing a song on Spotify to see its information displayed.

## Screenshots

Add a screenshot of the desktop widget here.

## What I Learned

This project helped me gain practical experience with:

- Building desktop applications with Electron and Node.js
- Integrating third-party REST APIs
- Implementing OAuth 2.0 authentication
- Handling asynchronous HTTP requests using Axios
- Managing access tokens and token expiration
- Using inter-process communication in Electron
- Designing custom desktop interfaces with HTML and CSS

## Future Improvements

- Add playback controls (play, pause, next, previous)
- Support customizable themes and backgrounds
- Add persistent login sessions
- Improve authentication security and token storage
- Package the widget for distribution

## Disclaimer

This is an independent personal project and is not affiliated with, sponsored by, or endorsed by Spotify.
