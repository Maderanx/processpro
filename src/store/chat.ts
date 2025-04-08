import { create } from 'zustand';
import { Message, ChatGroup } from '../types';
import { format } from 'date-fns';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from './auth';
import { useNotificationStore } from './notifications';

interface ChatState {
  messages: Message[];
  groups: ChatGroup[];
  selectedGroup: ChatGroup | null;
  socket: Socket | null;
  typingUsers: Map<string, string[]>;
  addMessage: (message: Omit<Message, 'id' | 'createdAt' | 'read'>) => void;
  markMessageAsRead: (id: string) => void;
  createGroup: (name: string, members: string[]) => void;
  getMessagesByUser: (userId: string) => Message[];
  getMessagesByGroup: (groupId: string) => Message[];
  initializeSocket: () => void;
  disconnectSocket: () => void;
  sendMessage: (content: string, groupId: string | null, receiverId: string | null) => void;
  startTyping: (groupId: string) => void;
  stopTyping: (groupId: string) => void;
  setSelectedGroup: (group: ChatGroup | null) => void;
}

const SOCKET_URL = 'http://localhost:3000';

const mockGroups: ChatGroup[] = [
  {
    id: '1',
    name: 'Engineering Team',
    members: ['1', '2', '5'],
    createdAt: '2024-03-15T10:00:00Z'
  },
  {
    id: '2',
    name: 'Design Team',
    members: ['3', '4'],
    createdAt: '2024-03-15T10:00:00Z'
  },
  {
    id: '3',
    name: 'Project Alpha',
    members: ['1', '2', '3', '4', '5'],
    createdAt: '2024-03-15T10:00:00Z'
  }
];

export const useChatStore = create<ChatState>((set, get) => ({
  messages: [],
  groups: mockGroups,
  selectedGroup: null,
  socket: null,
  typingUsers: new Map(),

  initializeSocket: () => {
    const socket = io(SOCKET_URL);
    const user = useAuthStore.getState().user;

    socket.on('connect', () => {
      console.log('Connected to chat server');
      if (user) {
        socket.emit('user:join', user);
      }
    });

    socket.on('message:receive', (message: Message) => {
      set((state) => ({
        messages: [...state.messages, message]
      }));
    });

    socket.on('message:group', (message: Message) => {
      set((state) => ({
        messages: [...state.messages, message]
      }));
    });

    socket.on('user:typing', ({ userId, groupId }) => {
      set((state) => {
        const newTypingUsers = new Map(state.typingUsers);
        const groupTyping = newTypingUsers.get(groupId) || [];
        if (!groupTyping.includes(userId)) {
          newTypingUsers.set(groupId, [...groupTyping, userId]);
        }
        return { typingUsers: newTypingUsers };
      });
    });

    socket.on('user:stop-typing', ({ userId, groupId }) => {
      set((state) => {
        const newTypingUsers = new Map(state.typingUsers);
        const groupTyping = newTypingUsers.get(groupId) || [];
        newTypingUsers.set(groupId, groupTyping.filter(id => id !== userId));
        return { typingUsers: newTypingUsers };
      });
    });

    set({ socket });
  },

  disconnectSocket: () => {
    const { socket } = get();
    if (socket) {
      socket.disconnect();
      set({ socket: null });
    }
  },

  sendMessage: (content: string, groupId: string | null, receiverId: string | null) => {
    const { socket } = get();
    if (!socket) return;

    if (groupId) {
      socket.emit('message:group', { content, groupId });
    } else if (receiverId) {
      socket.emit('message:private', { content, receiverId });
    }
  },

  startTyping: (groupId: string) => {
    const { socket } = get();
    if (socket) {
      socket.emit('typing:start', { groupId });
    }
  },

  stopTyping: (groupId: string) => {
    const { socket } = get();
    if (socket) {
      socket.emit('typing:stop', { groupId });
    }
  },

  addMessage: (message) => {
    const { generateAndAddNotification } = useNotificationStore.getState();
    
    // Generate notification for mentions
    if (message.content.includes('@')) {
      const mentions = message.content.match(/@(\w+)/g);
      if (mentions) {
        mentions.forEach(mention => {
          const mentionedUser = mention.substring(1); // Remove @ symbol
          generateAndAddNotification({
            type: 'mention',
            data: {
              message: message.content,
              sender: message.senderName,
              group: message.groupId ? get().groups.find(g => g.id === message.groupId)?.name : 'Direct Message',
              mentionedUser,
            },
            userId: mentionedUser, // This should be the actual user ID, you'll need to map username to ID
          });
        });
      }
    }

    // Generate notification for new messages in groups
    if (message.groupId) {
      const group = get().groups.find(g => g.id === message.groupId);
      if (group) {
        group.members.forEach(memberId => {
          if (memberId !== message.senderId) {
            generateAndAddNotification({
              type: 'update',
              data: {
                message: message.content,
                sender: message.senderName,
                group: group.name,
              },
              userId: memberId,
            });
          }
        });
      }
    }

    set((state) => ({
      messages: [...state.messages, {
        ...message,
        id: Math.random().toString(36).substr(2, 9),
        createdAt: format(new Date(), "yyyy-MM-dd'T'HH:mm:ss'Z'"),
        read: false
      }]
    }));
  },

  markMessageAsRead: (id) => set((state) => ({
    messages: state.messages.map(message =>
      message.id === id ? { ...message, read: true } : message
    )
  })),

  createGroup: (name, members) => set((state) => ({
    groups: [...state.groups, {
      id: Math.random().toString(36).substr(2, 9),
      name,
      members,
      createdAt: format(new Date(), "yyyy-MM-dd'T'HH:mm:ss'Z'")
    }]
  })),

  getMessagesByUser: (userId) => get().messages.filter(
    message => message.senderId === userId || message.receiverId === userId
  ),

  getMessagesByGroup: (groupId) => get().messages.filter(
    message => message.groupId === groupId
  ),

  setSelectedGroup: (group) => set({ selectedGroup: group }),
}));