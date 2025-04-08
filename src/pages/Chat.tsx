import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Send, Plus, Search, Users, X, ChevronDown, Check, User, FileText, Sparkles, Mic, MicOff } from 'lucide-react';
import DashboardLayout from '../components/Layout/DashboardLayout';
import { useChatStore } from '../store/chat';
import { useAuthStore } from '../store/auth';
import { format } from 'date-fns';
import { generateMeetingMinutes, generateChatSummary, MeetingMinutes, ChatSummary } from '../services/groqService';
import AISummaryModal from '../components/AI/AISummaryModal';

// Add TypeScript definitions for Web Speech API
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
  error: any;
}

interface SpeechRecognitionResult {
  isFinal: boolean;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  abort(): void;
  onerror: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
  onend: ((this: SpeechRecognition, ev: Event) => any) | null;
  onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
}

interface SpeechRecognitionConstructor {
  new (): SpeechRecognition;
  prototype: SpeechRecognition;
}

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  }
}

export default function Chat() {
  const [message, setMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [isCreatingGroup, setIsCreatingGroup] = useState(false);
  const [isCreatingDM, setIsCreatingDM] = useState(false);
  const [newGroup, setNewGroup] = useState({ name: '', members: [] as string[] });
  const [isGroupDropdownOpen, setIsGroupDropdownOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();
  const groupDropdownRef = useRef<HTMLDivElement>(null);
  const userDropdownRef = useRef<HTMLDivElement>(null);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  
  // AI Summary states
  const [isAISummaryModalOpen, setIsAISummaryModalOpen] = useState(false);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [meetingMinutes, setMeetingMinutes] = useState<MeetingMinutes | undefined>(undefined);
  const [chatSummary, setChatSummary] = useState<ChatSummary | undefined>(undefined);
  
  const { user } = useAuthStore();
  const {
    messages,
    groups,
    addMessage,
    createGroup,
    initializeSocket,
    disconnectSocket,
    sendMessage,
    startTyping,
    stopTyping,
    typingUsers,
    getMessagesByUser,
    getMessagesByGroup
  } = useChatStore();

  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  const filteredGroups = searchTerm
    ? groups.filter(group => 
        group.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
        group.members.includes(user?.id || '')
      )
    : groups.filter(group => group.members.includes(user?.id || ''));

  // Get all users from auth store for DM selection
  const allUsers = Object.values(useAuthStore.getState())
    .filter((item): item is { id: string; name: string; avatar: string } => 
      typeof item === 'object' && 
      item !== null && 
      'id' in item && 
      'name' in item &&
      item.id !== user?.id
    );

  const filteredUsers = searchTerm
    ? allUsers.filter(user => 
        user.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : allUsers;

  useEffect(() => {
    initializeSocket();
    return () => {
      disconnectSocket();
    };
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (groupDropdownRef.current && !groupDropdownRef.current.contains(event.target as Node)) {
        setIsGroupDropdownOpen(false);
      }
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target as Node)) {
        setIsUserDropdownOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Auto-select the first group if none is selected
  useEffect(() => {
    if (!selectedGroupId && !selectedUserId && filteredGroups.length > 0) {
      setSelectedGroupId(filteredGroups[0].id);
    }
  }, [filteredGroups, selectedGroupId, selectedUserId]);

  const selectedGroup = groups.find(g => g.id === selectedGroupId);
  const selectedUser = allUsers.find(u => u.id === selectedUserId);
  
  // Get messages based on whether a group or user is selected
  const currentMessages = selectedGroupId 
    ? getMessagesByGroup(selectedGroupId)
    : selectedUserId 
      ? getMessagesByUser(selectedUserId)
      : [];

  // Initialize speech recognition
  useEffect(() => {
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = (window.SpeechRecognition || window.webkitSpeechRecognition) as SpeechRecognitionConstructor;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      
      recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
        const transcript = Array.from(event.results)
          .map(result => result[0].transcript)
          .join('');
        
        setMessage(prev => {
          const newMessage = transcript.trim();
          return newMessage !== prev ? newMessage : prev;
        });
      };

      recognitionRef.current.onerror = (event: SpeechRecognitionEvent) => {
        console.error('Speech recognition error:', event.error);
        setIsRecording(false);
      };

      recognitionRef.current.onend = () => {
        setIsRecording(false);
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const toggleVoiceRecording = () => {
    if (!recognitionRef.current) {
      console.error('Speech recognition is not supported in this browser');
      return;
    }

    if (isRecording) {
      recognitionRef.current.stop();
    } else {
      setMessage(''); // Clear existing message when starting new recording
      recognitionRef.current.start();
    }
    setIsRecording(!isRecording);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !user) return;
    
    if (selectedGroupId) {
      sendMessage(message, selectedGroupId, null);
    } else if (selectedUserId) {
      sendMessage(message, null, selectedUserId);
    }
    
    setMessage('');
  };

  const handleCreateGroup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroup.name.trim() || newGroup.members.length === 0) return;

    createGroup(newGroup.name, [...newGroup.members, user?.id || '']);
    setIsCreatingGroup(false);
    setNewGroup({ name: '', members: [] });
  };

  const handleStartDM = (userId: string) => {
    setSelectedUserId(userId);
    setSelectedGroupId(null);
    setIsCreatingDM(false);
    setSelectedUsers([]);
  };

  const handleSelectUser = (userId: string) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleStartSelectedDM = () => {
    if (selectedUsers.length === 1) {
      handleStartDM(selectedUsers[0]);
    } else if (selectedUsers.length > 1) {
      // Create a group with selected users
      const groupName = `Group with ${selectedUsers.length} members`;
      createGroup(groupName, [...selectedUsers, user?.id || '']);
      setIsCreatingDM(false);
      setSelectedUsers([]);
    }
  };

  const handleTyping = () => {
    if (selectedGroupId) {
      startTyping(selectedGroupId);
      
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      typingTimeoutRef.current = setTimeout(() => {
        stopTyping(selectedGroupId);
      }, 2000);
    }
  };

  const currentlyTyping = selectedGroupId ? typingUsers.get(selectedGroupId) || [] : [];

  const handleGenerateAISummary = async () => {
    if (!user) return;
    
    setIsGeneratingSummary(true);
    setIsAISummaryModalOpen(true);
    
    try {
      // Get the current messages
      const currentMessages = selectedGroupId 
        ? getMessagesByGroup(selectedGroupId)
        : selectedUserId 
          ? getMessagesByUser(selectedUserId)
          : [];
      
      // Format messages with sender names
      const formattedMessages = currentMessages.map(msg => {
        const sender = msg.senderId === user.id 
          ? { name: 'You' } 
          : allUsers.find(u => u.id === msg.senderId) || { name: 'Unknown User' };
        
        return {
          ...msg,
          senderName: sender.name
        };
      });
      
      if (selectedGroupId && selectedGroup) {
        // Generate meeting minutes for groups
        const minutes = await generateMeetingMinutes(formattedMessages, selectedGroup.name);
        setMeetingMinutes(minutes);
        setChatSummary(undefined);
      } else if (selectedUserId && selectedUser) {
        // Generate chat summary for DMs
        const summary = await generateChatSummary(formattedMessages, selectedUser.name);
        setChatSummary(summary);
        setMeetingMinutes(undefined);
      }
    } catch (error) {
      console.error('Error generating AI summary:', error);
      // You could add a toast notification here
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  const handleRegenerateSummary = () => {
    setMeetingMinutes(undefined);
    setChatSummary(undefined);
    handleGenerateAISummary();
  };

  return (
    <DashboardLayout>
      <div className="h-[calc(100vh-theme(spacing.16))] flex gap-4">
        {/* Sidebar */}
        <div className="w-64 bg-white rounded-lg shadow-sm p-4 flex flex-col">
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search chats..."
                className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setIsCreatingGroup(true)}
              className="flex-1 flex items-center justify-center gap-2 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              <Plus className="h-4 w-4" />
              New Group
            </button>
            <button
              onClick={() => setIsCreatingDM(true)}
              className="flex-1 flex items-center justify-center gap-2 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
            >
              <User className="h-4 w-4" />
              New DM
            </button>
          </div>

          <div className="flex-1 overflow-y-auto">
            {/* Groups Section */}
            <div className="mb-4">
              <h3 className="text-sm font-medium text-gray-500 mb-2 px-2">Groups</h3>
              {filteredGroups.map((group) => (
                <div
                  key={group.id}
                  onClick={() => {
                    setSelectedGroupId(group.id);
                    setSelectedUserId(null);
                  }}
                  className={`flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer ${
                    selectedGroupId === group.id ? 'bg-blue-50 border border-blue-200' : ''
                  }`}
                >
                  <div className="h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center">
                    <Users className="h-5 w-5 text-gray-500" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium">{group.name}</h3>
                    <p className="text-sm text-gray-500">
                      {group.members.length} members
                    </p>
                  </div>
                  {selectedGroupId === group.id && (
                    <Check className="h-5 w-5 text-blue-500" />
                  )}
                </div>
              ))}
            </div>

            {/* Direct Messages Section */}
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2 px-2">Direct Messages</h3>
              {filteredUsers.map((user) => (
                <div
                  key={user.id}
                  onClick={() => {
                    setSelectedUserId(user.id);
                    setSelectedGroupId(null);
                  }}
                  className={`flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer ${
                    selectedUserId === user.id ? 'bg-blue-50 border border-blue-200' : ''
                  }`}
                >
                  <div className="h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center overflow-hidden">
                    {user.avatar ? (
                      <img src={user.avatar} alt={user.name} className="h-full w-full object-cover" />
                    ) : (
                      <User className="h-5 w-5 text-gray-500" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium">{user.name}</h3>
                  </div>
                  {selectedUserId === user.id && (
                    <Check className="h-5 w-5 text-blue-500" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 bg-white rounded-lg shadow-sm flex flex-col">
          {selectedGroup || selectedUser ? (
            <>
              <div className="p-4 border-b flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {selectedGroup ? (
                    <>
                      <div className="h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center">
                        <Users className="h-5 w-5 text-gray-500" />
                      </div>
                      <div>
                        <h2 className="text-xl font-semibold">{selectedGroup.name}</h2>
                        <p className="text-sm text-gray-500">
                          {selectedGroup.members.length} members
                        </p>
                      </div>
                    </>
                  ) : selectedUser ? (
                    <>
                      <div className="h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center overflow-hidden">
                        {selectedUser.avatar ? (
                          <img src={selectedUser.avatar} alt={selectedUser.name} className="h-full w-full object-cover" />
                        ) : (
                          <User className="h-5 w-5 text-gray-500" />
                        )}
                      </div>
                      <div>
                        <h2 className="text-xl font-semibold">{selectedUser.name}</h2>
                        <p className="text-sm text-gray-500">Direct Message</p>
                      </div>
                    </>
                  ) : null}
                </div>
                
                <div className="flex items-center gap-2">
                  {/* AI Summary Button */}
                  <button
                    onClick={handleGenerateAISummary}
                    className="flex items-center gap-1 px-3 py-1.5 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors"
                  >
                    <Sparkles className="h-4 w-4" />
                    <span className="text-sm font-medium">AI Summary</span>
                  </button>
                  
                  {/* Group Dropdown */}
                  {selectedGroup && (
                    <div className="relative" ref={groupDropdownRef}>
                      <button 
                        onClick={() => setIsGroupDropdownOpen(!isGroupDropdownOpen)}
                        className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-lg"
                      >
                        <span className="text-sm text-gray-600">Switch Group</span>
                        <ChevronDown className="h-4 w-4 text-gray-500" />
                      </button>
                      
                      {isGroupDropdownOpen && (
                        <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border z-50 max-h-80 overflow-y-auto">
                          {filteredGroups.map((group) => (
                            <div
                              key={group.id}
                              onClick={() => {
                                setSelectedGroupId(group.id);
                                setSelectedUserId(null);
                                setIsGroupDropdownOpen(false);
                              }}
                              className={`flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer ${
                                selectedGroupId === group.id ? 'bg-blue-50' : ''
                              }`}
                            >
                              <div className="h-8 w-8 bg-gray-100 rounded-full flex items-center justify-center">
                                <Users className="h-4 w-4 text-gray-500" />
                              </div>
                              <div className="flex-1">
                                <h3 className="font-medium">{group.name}</h3>
                                <p className="text-xs text-gray-500">
                                  {group.members.length} members
                                </p>
                              </div>
                              {selectedGroupId === group.id && (
                                <Check className="h-4 w-4 text-blue-500" />
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
              
              {currentlyTyping.length > 0 && (
                <div className="px-4 py-1 bg-gray-50 border-b">
                  <p className="text-sm text-gray-500 italic">
                    {currentlyTyping.length === 1
                      ? "Someone is typing..."
                      : "Multiple people are typing..."}
                  </p>
                </div>
              )}

              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {currentMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${
                      msg.senderId === user?.id ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <div
                      className={`max-w-[70%] rounded-lg p-3 ${
                        msg.senderId === user?.id
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100'
                      }`}
                    >
                      <p>{msg.content}</p>
                      <p
                        className={`text-xs mt-1 ${
                          msg.senderId === user?.id
                            ? 'text-blue-100'
                            : 'text-gray-500'
                        }`}
                      >
                        {format(new Date(msg.createdAt), 'HH:mm')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <form onSubmit={handleSendMessage} className="mt-4 flex items-center gap-2">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={message}
                    onChange={(e) => {
                      setMessage(e.target.value);
                      handleTyping();
                    }}
                    placeholder="Type your message..."
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={toggleVoiceRecording}
                    className={`absolute right-2 top-1/2 transform -translate-y-1/2 p-2 rounded-full transition-colors ${
                      isRecording ? 'text-red-500 hover:text-red-600' : 'text-gray-400 hover:text-gray-500'
                    }`}
                  >
                    {isRecording ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                  </button>
                </div>
                <button
                  type="submit"
                  disabled={!message.trim()}
                  className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="h-5 w-5" />
                </button>
              </form>
            </>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-500">
              <div className="text-center">
                <MessageSquare className="h-12 w-12 mx-auto mb-4" />
                <p>Select a chat to start messaging</p>
              </div>
            </div>
          )}
        </div>

        {/* Create Group Modal */}
        {isCreatingGroup && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white rounded-lg p-6 w-96">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Create New Group</h2>
                <button
                  onClick={() => setIsCreatingGroup(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleCreateGroup} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Group Name
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full rounded-lg border border-gray-200 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={newGroup.name}
                    onChange={(e) =>
                      setNewGroup({ ...newGroup, name: e.target.value })
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Select Members
                  </label>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {allUsers.map((member) => (
                      <div
                        key={member.id}
                        className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded-lg cursor-pointer"
                        onClick={() => {
                          const isSelected = newGroup.members.includes(member.id);
                          setNewGroup({
                            ...newGroup,
                            members: isSelected
                              ? newGroup.members.filter(id => id !== member.id)
                              : [...newGroup.members, member.id]
                          });
                        }}
                      >
                        <div className="h-8 w-8 bg-gray-100 rounded-full flex items-center justify-center overflow-hidden">
                          {member.avatar ? (
                            <img src={member.avatar} alt={member.name} className="h-full w-full object-cover" />
                          ) : (
                            <User className="h-4 w-4 text-gray-500" />
                          )}
                        </div>
                        <span className="flex-1">{member.name}</span>
                        {newGroup.members.includes(member.id) && (
                          <Check className="h-4 w-4 text-blue-500" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsCreatingGroup(false)}
                    className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                  >
                    Create Group
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Create DM Modal */}
        {isCreatingDM && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white rounded-lg p-6 w-96">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Start a Direct Message</h2>
                <button
                  onClick={() => {
                    setIsCreatingDM(false);
                    setSelectedUsers([]);
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Select User(s)
                  </label>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {filteredUsers.map((user) => (
                      <div
                        key={user.id}
                        className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded-lg cursor-pointer"
                        onClick={() => handleSelectUser(user.id)}
                      >
                        <div className="h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center overflow-hidden">
                          {user.avatar ? (
                            <img src={user.avatar} alt={user.name} className="h-full w-full object-cover" />
                          ) : (
                            <User className="h-5 w-5 text-gray-500" />
                          )}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium">{user.name}</h3>
                        </div>
                        {selectedUsers.includes(user.id) && (
                          <Check className="h-5 w-5 text-blue-500" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsCreatingDM(false);
                      setSelectedUsers([]);
                    }}
                    className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleStartSelectedDM}
                    disabled={selectedUsers.length === 0}
                    className={`px-4 py-2 ${
                      selectedUsers.length === 0
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-blue-500 text-white hover:bg-blue-600'
                    } rounded-lg`}
                  >
                    {selectedUsers.length === 1 ? 'Start DM' : 'Create Group'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* AI Summary Modal */}
        <AISummaryModal
          isOpen={isAISummaryModalOpen}
          onClose={() => setIsAISummaryModalOpen(false)}
          title={selectedGroup ? `Meeting Minutes: ${selectedGroup.name}` : `Chat Summary: ${selectedUser?.name || ''}`}
          isLoading={isGeneratingSummary}
          meetingMinutes={meetingMinutes}
          chatSummary={chatSummary}
          onRegenerate={handleRegenerateSummary}
        />
      </div>
    </DashboardLayout>
  );
}