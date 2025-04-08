# ProcessPro Video Meeting Application

A modern, feature-rich video conferencing application built with React, WebRTC, and Socket.IO, featuring real-time attention tracking using WebGazer.js.

## Features

### 1. Video Conferencing
- Real-time peer-to-peer video and audio communication using WebRTC
- Support for multiple STUN servers for NAT traversal
- Automatic connection handling and recovery
- Video and audio muting controls

### 2. Meeting Management
- Create and schedule meetings with titles, descriptions, and time slots
- Join existing meetings via unique room IDs
- View list of upcoming and ongoing meetings
- Track meeting participants

### 3. Attention Tracking
- Real-time eye tracking using WebGazer.js
- Focus detection during meetings
- Visual indicators for attention status
- Automatic notifications for loss of attention
- Privacy-focused implementation with minimal UI overlay

### 4. Recording Capabilities
- Record meeting sessions
- Save recordings locally in WebM format
- Pause and resume recording functionality
- Download recorded sessions

### 5. User Interface
- Clean, modern design using Tailwind CSS
- Responsive layout
- Real-time status indicators
- Intuitive meeting controls
- User avatars and presence indicators

## Technical Architecture

### Core Technologies
- **Frontend**: React, TypeScript
- **Video/Audio**: WebRTC
- **Real-time Communication**: Socket.IO
- **Eye Tracking**: WebGazer.js
- **Styling**: Tailwind CSS
- **State Management**: Custom stores (Meeting Store, Auth Store)

### Key Components

#### 1. Meetings Component (`src/pages/Meetings.tsx`)
Main component handling video conferencing functionality:
- WebRTC peer connection management
- Media stream handling
- Meeting UI and controls
- Recording functionality
- Eye tracking integration

#### 2. WebGazer Integration (`src/components/WebGazerInit.tsx`)
Handles eye tracking functionality:
- WebGazer.js initialization
- Focus detection
- Attention monitoring
- UI feedback

#### 3. Dashboard Layout (`src/components/Layout/DashboardLayout.tsx`)
Provides the application shell:
- Navigation
- User interface structure
- Responsive layout

## Setup and Installation

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Modern web browser with WebRTC support (Chrome, Firefox, Edge)
- Webcam and microphone
- SSL certificate for local development (required for WebRTC and WebGazer)

### Installation Steps

1. **Clone the Repository**
   ```bash
   git clone https://github.com/yourusername/processpro.git
   cd processpro
   ```

2. **Install Dependencies**
   ```bash
   npm install
   # or using yarn
   yarn install
   ```

3. **Environment Configuration**
   Create a `.env` file in the root directory:
   ```env
   VITE_SOCKET_URL=your_socket_server_url
   VITE_API_URL=your_api_server_url
   VITE_GROQ_API_KEY=your_groq_api_key
   ```

4. **SSL Setup for Local Development**
   Create a self-signed certificate for HTTPS:
   ```bash
   # Using mkcert (recommended)
   mkcert -install
   mkcert localhost
   ```
   
   Update vite.config.ts:
   ```typescript
   import { defineConfig } from 'vite';
   import fs from 'fs';

   export default defineConfig({
     server: {
       https: {
         key: fs.readFileSync('localhost-key.pem'),
         cert: fs.readFileSync('localhost.pem'),
       },
     },
   });
   ```

5. **Start Development Server**
   ```bash
   npm run dev
   # or using yarn
   yarn dev
   ```
   Access the application at `https://localhost:5173`

### Docker Deployment

1. **Build Docker Image**
   ```bash
   docker build -t processpro .
   ```

2. **Run Container**
   ```bash
   docker run -p 3000:3000 processpro
   ```

### Production Deployment

1. **Build Application**
   ```bash
   npm run build
   # or using yarn
   yarn build
   ```

2. **Serve Production Build**
   ```bash
   npm run serve
   # or using yarn
   yarn serve
   ```

### Configuration Options

#### WebRTC Configuration
Customize STUN/TURN servers in `src/config/webrtc.ts`:
```typescript
export const webrtcConfig = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    {
      urls: 'turn:your-turn-server.com',
      username: 'username',
      credential: 'password',
    },
  ],
};
```

#### WebGazer Configuration
Adjust eye tracking settings in `src/config/webgazer.ts`:
```typescript
export const webgazerConfig = {
  showVideo: false,
  showFaceOverlay: false,
  showFaceFeedbackBox: false,
  showVideoPreview: false,
  trackingThreshold: 5000, // ms before triggering unfocused state
};
```

### System Requirements

#### Minimum Requirements
- CPU: Dual-core processor (2.0 GHz or higher)
- RAM: 4GB
- Network: Stable broadband connection (1 Mbps up/down)
- Camera: 720p webcam
- Browser: Latest version of Chrome, Firefox, or Edge

#### Recommended Requirements
- CPU: Quad-core processor (2.5 GHz or higher)
- RAM: 8GB
- Network: High-speed connection (5+ Mbps up/down)
- Camera: 1080p webcam
- Browser: Chrome (latest version) for optimal WebGazer performance

### Troubleshooting Installation

1. **SSL Certificate Issues**
   - Ensure mkcert is properly installed
   - Trust the local certificate authority
   - Clear browser cache and restart

2. **WebGazer Installation**
   - Check browser compatibility
   - Verify camera permissions
   - Ensure proper lighting conditions

3. **Dependencies Issues**
   ```bash
   # Clear npm cache
   npm cache clean --force
   
   # Remove node_modules and reinstall
   rm -rf node_modules
   npm install
   ```

## Implementation Details

### WebRTC Connection Flow
1. User joins a meeting room
2. Socket.IO establishes initial connection
3. WebRTC peer connection is created
4. ICE candidates are exchanged
5. Media streams are connected
6. Video/audio communication begins

### Eye Tracking Implementation
1. WebGazer.js is initialized when enabled
2. Tracks user's gaze position
3. Monitors focus on the remote video area
4. Triggers notifications for attention loss
5. Updates UI to reflect attention status

### Recording Process
1. MediaRecorder API captures local stream
2. Data is stored in chunks
3. On stop, chunks are combined into a Blob
4. Blob is converted to downloadable format
5. User can save recording locally

## Usage Guide

### Creating a Meeting
1. Click "New Meeting" button
2. Fill in meeting details:
   - Title
   - Description
   - Start time
   - End time
3. Submit to create meeting

### Joining a Meeting
1. Select meeting from the list
2. Grant camera/microphone permissions
3. Wait for connection to establish
4. Begin video conference

### Using Attention Tracking
1. Click the eye icon to enable tracking
2. Green indicator shows focused state
3. Red indicator shows unfocused state
4. Notifications appear when attention is lost
5. Click eye icon again to disable tracking

### Recording a Meeting
1. Click record button (circle icon)
2. Recording begins with red indicator
3. Click stop button to end recording
4. Click save button to download recording

## API Integration

### Socket.IO Events
- `room:joined`: Handle new participant joining
- `peer:joined`: Initialize peer connection
- `peer:offer`: Handle connection offer
- `peer:answer`: Process connection answer
- `peer:ice`: Exchange ICE candidates
- `peer:left`: Handle participant disconnection

### WebRTC Configuration
```javascript
const configuration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
  ],
};
```

## Security Considerations

1. **Media Access**
   - Explicit user permission required for camera/microphone
   - Streams are secured through WebRTC encryption

2. **Eye Tracking Privacy**
   - No video/images stored from eye tracking
   - Processing done locally in browser
   - Tracking can be disabled at any time

3. **Meeting Security**
   - Unique room IDs for each meeting
   - Participant authentication required
   - Secure WebRTC peer connections

## Performance Optimization

1. **Resource Management**
   - Proper cleanup of media streams
   - Automatic connection state management
   - Memory leak prevention

2. **UI Optimization**
   - Efficient re-rendering with React
   - Lazy loading of components
   - Optimized video/audio handling

## Error Handling

1. **Connection Issues**
   - Automatic reconnection attempts
   - Clear error messages
   - Fallback mechanisms

2. **Media Errors**
   - Permission denial handling
   - Device unavailability handling
   - Stream error recovery

## Future Enhancements

1. **Planned Features**
   - Screen sharing
   - Chat functionality
   - Meeting analytics
   - Enhanced recording options

2. **Potential Improvements**
   - Multiple participant support
   - Custom TURN server integration
   - Advanced attention analytics
   - Meeting scheduling integration

## Troubleshooting

### Common Issues

1. **Video Not Showing**
   - Check camera permissions
   - Verify device selection
   - Check network connectivity

2. **Eye Tracking Issues**
   - Ensure good lighting
   - Position face clearly
   - Check browser compatibility

3. **Connection Problems**
   - Verify network connection
   - Check firewall settings
   - Ensure WebRTC compatibility

## Support

For technical support or feature requests, please:
1. Check existing documentation
2. Review troubleshooting guide
3. Contact system administrator

## License

This project is proprietary and confidential. All rights reserved.

---

*Documentation last updated: [Current Date]* 