import React, { useState, useEffect, useRef } from 'react';
import { Calendar as CalendarIcon, Plus, Video, Users, Mic, MicOff, VideoOff, Phone, Circle, StopCircle, Save, User, Eye } from 'lucide-react';
import DashboardLayout from '../components/Layout/DashboardLayout';
import { useMeetingStore } from '../store/meetings';
import { useAuthStore } from '../store/auth';
import { format } from 'date-fns';
import { Meeting } from '../types';
import { Manager } from 'socket.io-client';
import WebGazerInit from '../components/WebGazerInit';
import { toast } from 'react-hot-toast';

interface RoomJoinedData {
  roomId: string;
  isFirst: boolean;
}

interface PeerOfferData {
  offer: RTCSessionDescriptionInit;
  from: string;
}

interface PeerAnswerData {
  answer: RTCSessionDescriptionInit;
  from: string;
}

interface PeerIceData {
  candidate: RTCIceCandidateInit;
  from: string;
}

interface RemoteUserData {
  id: string;
  name: string;
  avatar: string;
}

interface GazeData {
  x: number;
  y: number;
  confidence: number;
}

const socket = new Manager('http://localhost:3000').socket('/');

const configuration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
  ],
};

export default function Meetings() {
  const [isCreating, setIsCreating] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedChunks, setRecordedChunks] = useState<Blob[]>([]);
  const [recordedVideoUrl, setRecordedVideoUrl] = useState<string | null>(null);
  const [remoteUser, setRemoteUser] = useState<RemoteUserData | null>(null);
  const [isEyeTrackingEnabled, setIsEyeTrackingEnabled] = useState(false);
  const [gazeData, setGazeData] = useState<GazeData | null>(null);
  const [isFocused, setIsFocused] = useState(true);
  
  const { user } = useAuthStore();
  const { meetings, addMeeting, getMeetingsByUser } = useMeetingStore();
  
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const gazeOverlayRef = useRef<HTMLDivElement>(null);
  const videoContainerRef = useRef<HTMLDivElement>(null);
  
  const userMeetings = user ? getMeetingsByUser(user.id) : [];

  const [newMeeting, setNewMeeting] = useState({
    title: '',
    description: '',
    startTime: '',
    endTime: '',
    roomId: '',
  });

  useEffect(() => {
    // Socket event handlers for WebRTC signaling
    socket.on('room:joined', async ({ roomId, isFirst }: RoomJoinedData) => {
      if (!isFirst && peerConnectionRef.current?.connectionState !== 'closed') {
        try {
          const offer = await peerConnectionRef.current?.createOffer();
          if (offer) {
            await peerConnectionRef.current?.setLocalDescription(offer);
            socket.emit('peer:offer', { offer, to: roomId });
          }
        } catch (error) {
          console.error('Error creating offer:', error);
        }
      }
    });

    socket.on('peer:joined', async (peerId: string) => {
      // Get remote user data from auth store
      const allUsers = Object.values(useAuthStore.getState())
        .filter((item): item is { id: string; name: string; avatar: string } => 
          typeof item === 'object' && 
          item !== null && 
          'id' in item && 
          'name' in item &&
          'avatar' in item
        );
      
      const remoteUserData = allUsers.find(u => u.id === peerId);
      if (remoteUserData) {
        setRemoteUser({
          id: remoteUserData.id,
          name: remoteUserData.name,
          avatar: remoteUserData.avatar
        });
      }

      if (peerConnectionRef.current?.connectionState !== 'closed') {
        try {
          const offer = await peerConnectionRef.current?.createOffer();
          if (offer) {
            await peerConnectionRef.current?.setLocalDescription(offer);
            socket.emit('peer:offer', { offer, to: peerId });
          }
        } catch (error) {
          console.error('Error creating offer:', error);
        }
      }
    });

    socket.on('peer:offer', async ({ offer, from }: PeerOfferData) => {
      // Get remote user data from auth store
      const allUsers = Object.values(useAuthStore.getState())
        .filter((item): item is { id: string; name: string; avatar: string } => 
          typeof item === 'object' && 
          item !== null && 
          'id' in item && 
          'name' in item &&
          'avatar' in item
        );
      
      const remoteUserData = allUsers.find(u => u.id === from);
      if (remoteUserData) {
        setRemoteUser({
          id: remoteUserData.id,
          name: remoteUserData.name,
          avatar: remoteUserData.avatar
        });
      }

      if (peerConnectionRef.current?.connectionState !== 'closed') {
        try {
          await peerConnectionRef.current?.setRemoteDescription(new RTCSessionDescription(offer));
          const answer = await peerConnectionRef.current?.createAnswer();
          if (answer) {
            await peerConnectionRef.current?.setLocalDescription(answer);
            socket.emit('peer:answer', { answer, to: from });
          }
        } catch (error) {
          console.error('Error handling offer:', error);
        }
      }
    });

    socket.on('peer:answer', async ({ answer, from }: PeerAnswerData) => {
      if (peerConnectionRef.current?.connectionState !== 'closed') {
        try {
          await peerConnectionRef.current?.setRemoteDescription(new RTCSessionDescription(answer));
        } catch (error) {
          console.error('Error handling answer:', error);
        }
      }
    });

    socket.on('peer:ice', async ({ candidate, from }: PeerIceData) => {
      if (peerConnectionRef.current?.connectionState !== 'closed') {
        try {
          await peerConnectionRef.current?.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (error) {
          console.error('Error adding ICE candidate:', error);
        }
      }
    });

    socket.on('peer:left', () => {
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = null;
      }
      setRemoteStream(null);
      setRemoteUser(null);
    });

    return () => {
      socket.off('room:joined');
      socket.off('peer:joined');
      socket.off('peer:offer');
      socket.off('peer:answer');
      socket.off('peer:ice');
      socket.off('peer:left');
      
      // Cleanup
      localStream?.getTracks().forEach(track => track.stop());
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
        peerConnectionRef.current = null;
      }
      cleanupWebGazer();
    };
  }, [localStream]);

  const initializeMedia = async () => {
    try {
      // Close existing peer connection if it exists
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
        peerConnectionRef.current = null;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: isVideoEnabled,
        audio: isAudioEnabled,
      });
      
      setLocalStream(stream);
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      // Initialize WebRTC peer connection
      const peerConnection = new RTCPeerConnection(configuration);
      peerConnectionRef.current = peerConnection;

      // Add local stream tracks to peer connection
      stream.getTracks().forEach(track => {
        peerConnection.addTrack(track, stream);
      });

      // Handle incoming streams
      peerConnection.ontrack = (event) => {
        console.log('Received remote track:', event.streams[0]);
        setRemoteStream(event.streams[0]);
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = event.streams[0];
        }
      };

      // Handle ICE candidates
      peerConnection.onicecandidate = (event) => {
        if (event.candidate && selectedMeeting) {
          socket.emit('peer:ice', {
            candidate: event.candidate,
            to: selectedMeeting.roomId,
          });
        }
      };

      // Log connection state changes
      peerConnection.onconnectionstatechange = () => {
        console.log('Connection state:', peerConnection.connectionState);
        if (peerConnection.connectionState === 'closed') {
          peerConnectionRef.current = null;
        }
      };

      peerConnection.oniceconnectionstatechange = () => {
        console.log('ICE connection state:', peerConnection.iceConnectionState);
      };

    } catch (error) {
      console.error('Error accessing media devices:', error);
    }
  };

  const joinMeeting = async (meeting: Meeting) => {
    setSelectedMeeting(meeting);
    await initializeMedia();
    socket.emit('join:room', meeting.roomId);
  };

  const handleCreateMeeting = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const roomId = Math.random().toString(36).substring(7);

    addMeeting({
      ...newMeeting,
      roomId,
      participants: [user.id],
      createdBy: user.id,
    });

    setIsCreating(false);
    setNewMeeting({
      title: '',
      description: '',
      startTime: '',
      endTime: '',
      roomId: '',
    });
  };

  const toggleAudio = () => {
    if (localStream) {
      localStream.getAudioTracks().forEach(track => {
        track.enabled = !isAudioEnabled;
      });
      setIsAudioEnabled(!isAudioEnabled);
    }
  };

  const toggleVideo = () => {
    if (localStream) {
      localStream.getVideoTracks().forEach(track => {
        track.enabled = !isVideoEnabled;
      });
      setIsVideoEnabled(!isVideoEnabled);
    }
  };

  const endCall = () => {
    localStream?.getTracks().forEach(track => track.stop());
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
    setLocalStream(null);
    setRemoteStream(null);
    setRemoteUser(null);
    setSelectedMeeting(null);
  };

  // Start recording
  const startRecording = () => {
    if (localStream) {
      const mediaRecorder = new MediaRecorder(localStream);
      mediaRecorderRef.current = mediaRecorder;
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          setRecordedChunks(prev => [...prev, event.data]);
        }
      };
      
      mediaRecorder.onstop = () => {
        const blob = new Blob(recordedChunks, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        setRecordedVideoUrl(url);
      };
      
      mediaRecorder.start();
      setIsRecording(true);
    }
  };
  
  // Stop recording
  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };
  
  // Save recording
  const saveRecording = () => {
    if (recordedVideoUrl) {
      const a = document.createElement('a');
      a.href = recordedVideoUrl;
      a.download = `meeting-recording-${new Date().toISOString()}.webm`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  // Update the cleanupWebGazer function
  const cleanupWebGazer = () => {
    if (isEyeTrackingEnabled) {
      setIsEyeTrackingEnabled(false);
      setGazeData(null);
    }
  };

  // Update the toggleEyeTracking function
  const toggleEyeTracking = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent default button behavior
    e.stopPropagation(); // Stop event propagation
    
    if (isEyeTrackingEnabled) {
      cleanupWebGazer();
    } else {
      setIsEyeTrackingEnabled(true);
    }
  };

  const handleFocusChange = (focused: boolean) => {
    setIsFocused(focused);
    if (!focused) {
      toast.error('Please pay attention to the meeting!', {
        duration: 3000,
        position: 'top-center',
        icon: '👀',
      });
    }
  };

  return (
    <DashboardLayout>
      {isEyeTrackingEnabled && (
        <WebGazerInit
          onGazeData={(data) => setGazeData(data)}
          onFocusChange={handleFocusChange}
          videoContainerRef={videoContainerRef}
        />
      )}
      <div className="h-[calc(100vh-theme(spacing.16))] flex gap-4">
        {/* Meetings List */}
        <div className="w-64 bg-white rounded-lg shadow-sm p-4 flex flex-col">
          <button
            onClick={() => setIsCreating(true)}
            className="flex items-center justify-center gap-2 mb-4 w-full py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            <Plus className="h-4 w-4" />
            New Meeting
          </button>

          <div className="flex-1 overflow-y-auto space-y-3">
            {userMeetings.map((meeting) => (
              <div
                key={meeting.id}
                onClick={() => joinMeeting(meeting)}
                className="p-3 hover:bg-gray-50 rounded-lg cursor-pointer"
              >
                <div className="flex items-center gap-3 mb-2">
                  <Video className="h-5 w-5 text-gray-500" />
                  <h3 className="font-medium">{meeting.title}</h3>
                </div>
                <div className="text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <CalendarIcon className="h-4 w-4" />
                    {format(new Date(meeting.startTime), 'MMM d, HH:mm')}
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    {meeting.participants.length} participants
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Meeting Area */}
        <div className="flex-1 bg-white rounded-lg shadow-sm">
          {isCreating ? (
            <div className="p-6">
              <h2 className="text-2xl font-semibold mb-6">Create New Meeting</h2>
              <form onSubmit={handleCreateMeeting} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Title
                  </label>
                  <input
                    type="text"
                    required
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                    value={newMeeting.title}
                    onChange={(e) =>
                      setNewMeeting({ ...newMeeting, title: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Description
                  </label>
                  <textarea
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                    value={newMeeting.description}
                    onChange={(e) =>
                      setNewMeeting({ ...newMeeting, description: e.target.value })
                    }
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Start Time
                    </label>
                    <input
                      type="datetime-local"
                      required
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                      value={newMeeting.startTime}
                      onChange={(e) =>
                        setNewMeeting({ ...newMeeting, startTime: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      End Time
                    </label>
                    <input
                      type="datetime-local"
                      required
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                      value={newMeeting.endTime}
                      onChange={(e) =>
                        setNewMeeting({ ...newMeeting, endTime: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsCreating(false)}
                    className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                  >
                    Create Meeting
                  </button>
                </div>
              </form>
            </div>
          ) : selectedMeeting ? (
            <div className="h-full flex flex-col">
              <div className="flex-1 grid grid-cols-2 gap-4 p-4">
                <div className="relative">
                  <video
                    ref={localVideoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover rounded-lg"
                  />
                  <div className="absolute bottom-4 left-4">
                    <p className="text-white bg-black bg-opacity-50 px-2 py-1 rounded">
                      You {!isFocused && '(Not Focused)'}
                    </p>
                  </div>
                </div>
                <div ref={videoContainerRef} className="relative">
                  <video
                    ref={remoteVideoRef}
                    autoPlay
                    playsInline
                    className="w-full h-full object-cover rounded-lg"
                  />
                  {!remoteStream && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg">
                      <img
                        src="https://media.licdn.com/dms/image/v2/D5603AQGuyWpEtHFhYA/profile-displayphoto-shrink_800_800/profile-displayphoto-shrink_800_800/0/1695215728632?e=1749686400&v=beta&t=D_ndzySlZuQCKo5PEheIywc0_BBZGWqO4UgDT09DiRc"
                        alt="Remote participant placeholder"
                        className="w-full h-full object-cover rounded-lg"
                      />
                    </div>
                  )}
                  <div className="absolute bottom-4 left-4 flex items-center gap-2">
                    {remoteUser ? (
                      <>
                        <div className="h-8 w-8 rounded-full overflow-hidden">
                          <img 
                            src={remoteUser.avatar} 
                            alt={remoteUser.name} 
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <p className="text-white bg-black bg-opacity-50 px-2 py-1 rounded">
                          {remoteUser.name}
                        </p>
                      </>
                    ) : (
                      <p className="text-white bg-black bg-opacity-50 px-2 py-1 rounded">
                        Ready to connect
                      </p>
                    )}
                  </div>
                </div>
              </div>
              <div className="p-4 border-t flex items-center justify-center gap-4">
                <button
                  onClick={toggleAudio}
                  className={`p-3 rounded-full ${
                    isAudioEnabled ? 'bg-gray-200' : 'bg-red-500 text-white'
                  }`}
                >
                  {isAudioEnabled ? <Mic className="h-6 w-6" /> : <MicOff className="h-6 w-6" />}
                </button>
                <button
                  onClick={toggleVideo}
                  className={`p-3 rounded-full ${
                    isVideoEnabled ? 'bg-gray-200' : 'bg-red-500 text-white'
                  }`}
                >
                  {isVideoEnabled ? <Video className="h-6 w-6" /> : <VideoOff className="h-6 w-6" />}
                </button>
                <button
                  onClick={toggleEyeTracking}
                  className={`p-3 rounded-full ${
                    isEyeTrackingEnabled 
                      ? isFocused 
                        ? 'bg-green-500 text-white' 
                        : 'bg-red-500 text-white'
                      : 'bg-gray-200'
                  }`}
                  title={isEyeTrackingEnabled ? (isFocused ? 'Focused' : 'Not Focused') : 'Enable Focus Tracking'}
                >
                  <Eye className="h-6 w-6" />
                </button>
                {!isRecording && !recordedVideoUrl && (
                  <button
                    onClick={startRecording}
                    className="p-3 rounded-full bg-red-500 text-white"
                  >
                    <Circle className="h-6 w-6" />
                  </button>
                )}
                {isRecording && (
                  <button
                    onClick={stopRecording}
                    className="p-3 rounded-full bg-gray-500 text-white"
                  >
                    <StopCircle className="h-6 w-6" />
                  </button>
                )}
                {recordedVideoUrl && (
                  <button
                    onClick={saveRecording}
                    className="p-3 rounded-full bg-blue-500 text-white"
                  >
                    <Save className="h-6 w-6" />
                  </button>
                )}
                <button
                  onClick={endCall}
                  className="p-3 rounded-full bg-red-500 text-white"
                >
                  <Phone className="h-6 w-6" />
                </button>
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-500">
              <div className="text-center">
                <Video className="h-12 w-12 mx-auto mb-4" />
                <p>Select a meeting to join or create a new one</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}