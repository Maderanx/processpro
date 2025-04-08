# ProcessPro Video Meeting Application

A comprehensive business collaboration platform built with React, TypeScript, and modern web technologies. Features include video conferencing with attention tracking, AI-powered analytics, team chat, and performance management dashboard.

## Core Features

### 1. Video Conferencing
- Real-time peer-to-peer video and audio communication using WebRTC
- Support for multiple STUN servers for NAT traversal
- Automatic connection handling and recovery
- Video and audio muting controls
- Meeting recording and playback
- Innovative attention tracking using WebGazer.js

### 2. AI-Powered Features
- **Meeting Minutes Generation**
  - Automatic transcription of meetings
  - AI-generated summaries and key points
  - Action item extraction
  - Sentiment analysis of discussions

- **Performance Analytics**
  - AI-driven performance insights
  - Productivity trend analysis
  - Team engagement metrics
  - Automated performance reports

- **Smart Notifications**
  - Context-aware notification generation
  - Priority-based alert system
  - AI-curated daily summaries

### 3. Team Chat
- Real-time messaging with typing indicators
- File sharing and media support
- Thread-based discussions
- Message reactions and emoji support
- Chat search and filtering
- Direct messages and group chats
- Message history and archiving

### 4. Manager Dashboard
- **Task Management**
  - Drag-and-drop task board
  - Task assignment and tracking
  - Priority and deadline management
  - Progress visualization

- **Performance Monitoring**
  - Real-time performance metrics
  - Employee productivity tracking
  - Project success rates
  - Workload distribution charts

- **Team Analytics**
  - Attendance tracking
  - Meeting participation metrics
  - Task completion rates
  - Team engagement scores

### 5. Meeting Management
- Create and schedule meetings
- Join via unique room IDs
- View upcoming and ongoing meetings
- Track meeting participants
- Meeting calendar integration

### 6. Attention Tracking
- Real-time eye tracking using WebGazer.js
- Focus detection during meetings
- Visual indicators for attention status
- Automatic notifications for loss of attention
- Privacy-focused implementation

### 7. Recording & Playback
- Record meeting sessions
- Save recordings locally in WebM format
- Pause and resume recording
- Download recorded sessions
- Playback with timeline markers

### 8. User Interface
- Clean, modern design using Tailwind CSS
- Responsive layout for all devices
- Real-time status indicators
- Intuitive meeting controls
- User avatars and presence indicators
- Dark/Light mode support
- Accessibility features

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
  ```typescript
  interface RoomJoinedData {
    roomId: string;
    userId: string;
    username: string;
  }
  ```
- `peer:joined`: Initialize peer connection
  ```typescript
  interface PeerJoinedData {
    peerId: string;
    username: string;
    avatar: string;
  }
  ```
- `peer:offer`: Handle connection offer
  ```typescript
  interface PeerOfferData {
    offer: RTCSessionDescription;
    peerId: string;
  }
  ```
- `peer:answer`: Process connection answer
  ```typescript
  interface PeerAnswerData {
    answer: RTCSessionDescription;
    peerId: string;
  }
  ```
- `peer:ice`: Exchange ICE candidates
  ```typescript
  interface PeerIceData {
    candidate: RTCIceCandidate;
    peerId: string;
  }
  ```
- `peer:left`: Handle participant disconnection
  ```typescript
  interface PeerLeftData {
    peerId: string;
    reason?: string;
  }
  ```

### REST API Endpoints

#### Authentication
```typescript
// POST /api/auth/login
interface LoginRequest {
  email: string;
  password: string;
}

interface LoginResponse {
  token: string;
  user: User;
}

// POST /api/auth/register
interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  role: 'user' | 'admin';
  department: string;
}

// GET /api/auth/me
interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: string;
  department: string;
  avatar: string;
}
```

#### Meetings
```typescript
// GET /api/meetings
interface Meeting {
  id: string;
  title: string;
  description: string;
  startTime: Date;
  endTime: Date;
  participants: User[];
  host: User;
  status: 'scheduled' | 'ongoing' | 'completed';
}

// POST /api/meetings
interface CreateMeetingRequest {
  title: string;
  description: string;
  startTime: Date;
  endTime: Date;
  participantIds: string[];
}

// GET /api/meetings/:id/recordings
interface MeetingRecording {
  id: string;
  meetingId: string;
  url: string;
  duration: number;
  createdAt: Date;
  size: number;
}
```

#### Tasks
```typescript
// GET /api/tasks
interface TaskResponse {
  id: string;
  title: string;
  description: string;
  assignee: User;
  dueDate: Date;
  priority: 'low' | 'medium' | 'high';
  status: 'todo' | 'in-progress' | 'completed';
  createdAt: Date;
  updatedAt: Date;
}

// POST /api/tasks
interface CreateTaskRequest {
  title: string;
  description: string;
  assigneeId: string;
  dueDate: Date;
  priority: 'low' | 'medium' | 'high';
}
```

#### Chat
```typescript
// GET /api/messages
interface MessageResponse {
  id: string;
  content: string;
  sender: User;
  timestamp: Date;
  type: 'text' | 'file' | 'image' | 'video';
  reactions: Reaction[];
  threadId?: string;
}

// POST /api/messages
interface SendMessageRequest {
  content: string;
  type: 'text' | 'file' | 'image' | 'video';
  threadId?: string;
}
```

## Performance Optimization

1. **Resource Management**
   - Automatic cleanup of WebRTC connections on unmount
   - Media stream tracks stopped when not in use
   - Socket connection pooling for efficient real-time communication
   - Efficient memory management for recording chunks
   - Proper disposal of WebGazer resources

2. **UI Optimization**
   - React.memo for expensive components
   - Virtual scrolling for chat messages
   - Lazy loading of meeting recordings
   - Image optimization with next-gen formats
   - Debounced event handlers for performance
   - CSS containment for layout optimization

3. **Network Optimization**
   - WebRTC connection quality monitoring
   - Adaptive video quality based on bandwidth
   - Socket message batching
   - Progressive image loading
   - Caching of static assets
   - Compression of data transfers

## Error Handling

1. **Connection Issues**
   - Automatic reconnection with exponential backoff
   - Fallback to lower video quality
   - Socket connection health monitoring
   - ICE connection state management
   - Clear user feedback on connection status

2. **Media Errors**
   - Graceful fallback to audio-only mode
   - Device change detection and handling
   - Automatic stream recovery
   - Clear permission request prompts
   - Helpful error messages for users

3. **Application Errors**
   - Global error boundary implementation
   - Structured error logging
   - User-friendly error messages
   - Automatic error reporting
   - Recovery mechanisms for critical features

## Future Enhancements

1. **Planned Features**
   - Multi-party screen sharing
   - Live document collaboration
   - Meeting transcription with AI
   - Virtual backgrounds
   - Meeting polls and surveys
   - Breakout rooms
   - Meeting templates
   - Calendar integration

2. **Technical Improvements**
   - WebAssembly optimization for WebGazer
   - Custom TURN server deployment
   - Enhanced security features
   - Mobile application development
   - Offline support
   - End-to-end encryption
   - Advanced analytics dashboard

## Support

For technical support or feature requests:

1. **Documentation**
   - Visit our [documentation portal](https://docs.processpro.com)
   - Check the [FAQ section](https://docs.processpro.com/faq)
   - Review [troubleshooting guides](https://docs.processpro.com/troubleshooting)

2. **Technical Support**
   - Email: support@processpro.com
   - Phone: +1 (555) 123-4567
   - Hours: 24/7 support available

3. **Feature Requests**
   - Submit via [GitHub Issues](https://github.com/processpro/issues)
   - Vote on existing feature requests
   - Join our [community forum](https://community.processpro.com)

## License

Copyright © 2024 ProcessPro. All rights reserved.

This software and associated documentation files (the "Software") are proprietary and confidential. The Software may not be copied, modified, distributed, or used in any manner without explicit written permission from ProcessPro.

---

*Documentation last updated: March 19, 2024* 
