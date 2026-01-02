# Moodiify – AI-Powered Music Recommendation Web App

AI-Powered Music Recommendation Web App that lets users generate songs - voice, recognize song, location point or text input. Integrated OpenAI for understanding user intent, YouTube Data API for song recommendations, and Spotify API for categorized playlists by genre.

## Features

- <mark> audio recording:</mark> Using **MediaRecorder** for easily handling record media and sending it as **Blob()** file to the server + using **ACRCloud API** for music recognition and generate the recognized song.
- <mark> Voice Intent:</mark> Using **Web Speech API** for voice speech and sending transcript to the server, **OpenAI API** handling the transcript and generate the songs based on transcript.
- <mark> Google Maps API:</mark> **Using Google API** maps for user interaction to get exact location based on user pin point on the map to get personalized music based on location
- <mark> Spotify API:</mark> display music categories
- <mark> YouTube Data API: </mark> using YouTube API to retrieve playlists + songs
- <mark>Authentication: </mark> Secure user login and registration powered by OAuth with firebase and JWT (JSON Web Tokens)
- <mark> Databases + Cache: </mark> MongoDB + Firebase for storing users, playlists and songs and all history songs in firebase and using Redis for caching songs
- <mark> Frontend: </mark> responsive UI built with React.js + Vite , using components libraries for UI and Module.CSS for every component
- <mark> Backend API: </mark> Node.js + Express handles AI generation, authentication, and data management.

## Tech Stack

- Language: JavaScript.
- Backend: Node.js + Express.js.
- Frontend: Vite + React.js.
- Database & Auth & Cache: MongoDB + Firebase (Database, Storage, Authentication), Redis (Caching).
- API Service: OpenAI API, Spotify, Google Maps, YouTube Data, ACRCloud, Web Speech.
- HTTP Client: Axios/Fetch API.

## Quick Start

Follow these steps to get a local copy of Moodiify up and running.

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- MongoDB (Local or Atlas connection string)
- Redis (Local instance or cloud URL)
- Firebase Account (For authentication keys)
- Spotify Developer Account (For Client ID & Secret & ACCESS_TOKEN)
- OpenAI API (for API_KEY)
- Google Services (For YouTube API Keys and Google Maps API)
- ACR Cloud Account (For access + secret keys & Host)

Installations

<ol>


<li>Clone the repository</li>

```
git clone https://github.com/Dolevs1997/moodiify.git
cd moodiify
```

<li>Install Dependencies (Root)</li>

```
npm install
```

<li>Install Client & Server Dependencies</li>

```
cd client && npm install
cd ../server && npm install
```

<li>Start Development Servers</li>
In terminal 1 (Server):

```
cd server
npm run dev
```

In terminal 2 (Client):

```
cd client
npm run dev
```

<li>Environment setup</li>

```
cp  server/.env
```

Update .env for server with the following configuration:

- PORT
- SPOTIFY_CLIENT_ID
- SPOTIFY_CLIENT_SECRET
- SPOTIFY_ACCESS_TOKEN
- OPENAI_API_KEY
- YOUTUBE_API_KEY
- YOUTUBE_CLIENT_ID
- DATABASE_URL
- DATABASE_NAME
- REFRESH AND ACCESS TOKENS
- ACR Cloud (Tokens & Host)
- Firebase (API key, Domain, Project-id, Storage_bucket, Messaging sender id, App id, MeasureMent Id)
- Redis URL

```
cp  client/.env
```

Update .env for client with the following configuration:

- Server URL
- OpenAI API Key
- Google Maps API Key
- Map Id

<li>Development: </li>

```
# Run backend
cd server && npm run dev

# Run frontend
cd server && npm run dev
```

</ol>

### Repository Structure

```
moodiify/
├── client/                 # React Frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components (Song, SearchBar,NavBar,...)
│   │   ├── pages/          # Page views (Home, CaregoriesPlaylists, Login)
│   │   ├── context/        # React Context for User, Search
│   │   ├── services/       # API service functions (OpenAI, YouTube)
│   │   └── utils/          # helper functions (playlist, recording, voice search .. )
│   └── public/
├── server/                 # Node.js Backend
│   ├── src/
│   │   ├── config/         # Firebase and ACR cloud configuration
│   │   ├── controllers/    # Logic for handling requests
│   │   ├── models/         # Firebase Business Logic layer (User, Playlist)
│   │   ├── routes/         # API route definitions
│   │   ├── middleware/     # Auth and error handling middleware
│   │   ├── schemas/        # Database Schemas ( Song, User)
|   |   ├── services/       # handling external APIs ( OpenAI, YouTube )
|   |   ├── uploads/        # uploading all files with song recognition
│   └── app.js              # Entry point
|
└── README.md
```

## Moodiify Architecture

<img width="1000" height="603" alt="image" src="https://github.com/user-attachments/assets/bfc92017-e86e-408a-8359-7feba10e5084" />

<img width="1087" height="188" alt="image" src="https://github.com/user-attachments/assets/9570754d-160f-41a9-a85b-75803f8d50c6" />
