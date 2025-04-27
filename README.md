# Watch2gether

Simple WebRTC based website that allows you to watch youtube together with friend. All synchronized through WebRTC
Peer-to-peer connections.

## Features

- **Synchronized Video Watching**: Watch YouTube videos together with playback synchronized
- **Real-time Chat**: Chat while watching videos together
- **Live Stream**: Go Live while watching videos together
- **Simple Session Sharing**: Create a session with one click and share the ID with friends
- **No Account Required**: Join instantly without registration or login
- **Responsive Design**: Works on desktop and mobile devices

## How It Works

Watch2gether uses WebRTC for direct browser-to-browser communication:

1. The session creator (host) generates a unique session ID
2. Friends join using this session ID
3. Video playback events (play, pause, seek) are synchronized across browsers
4. Chat messages are transmitted directly between participants
5. All media remains synchronized regardless of individual network conditions

## Getting Started

### For Viewers

1. Visit the [Watch2gether website](watch2gether-phi.vercel.app)
2. Enter a session ID shared by a friend or create your own session
3. Start watching and chatting together!

### For Developers

#### Prerequisites

- Modern web browser with WebRTC support
- Node.js and npm (for development)

#### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/almazhecker/watch2gether.git
   cd watch2gether
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the development server:

   ```bash
   npm run dev
   ```

   Go to https://localhost:4321, NOT http (WebRTC requires https)

## Usage Guide

### Creating a Session

1. Click the "Create Session" button
2. Share the generated session ID with friends (automatically copied to clipboard)
3. The session ID remains active for 30 seconds or until someone joins

### Joining a Session

1. Enter the session ID shared by the host
2. Click "Join Session"
3. Start watching together once connected

### Controlling Playback

- Any participant can play, pause, or seek in the video
- All changes are instantly synchronized to other participants
- New videos can be loaded by entering a YouTube URL or video ID

## Technical Implementation

### WebRTC Connection Flow

1. Host creates an offer and session ID
2. Session ID and offer are sent to the signaling server
3. Joining peer retrieves the offer using the session ID
4. Joiner creates an answer and sends it to the signaling server
5. Host retrieves the answer
6. ICE candidates are exchanged through the signaling server
7. Direct peer-to-peer connection is established
