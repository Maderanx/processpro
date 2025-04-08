import { create } from 'zustand';
import { Notification } from '../types';
import { format } from 'date-fns';
import { generateNotificationContent, NotificationContent } from '../services/groqService';

// Notification contexts for generating notifications
const notificationContexts = [
  {
    type: 'meeting' as const,
    data: {
      title: 'Team Sync Meeting',
      description: 'Weekly team sync meeting',
      startTime: format(new Date().setMinutes(new Date().getMinutes() + 30), "yyyy-MM-dd'T'HH:mm:ss'Z'"),
      endTime: format(new Date().setHours(new Date().getHours() + 1), "yyyy-MM-dd'T'HH:mm:ss'Z'"),
      roomId: 'team-sync-room',
    },
    userId: '1',
  },
  {
    type: 'deadline' as const,
    data: {
      task: 'Project Review Document',
      dueDate: format(new Date().setDate(new Date().getDate() + 1), "yyyy-MM-dd'T'HH:mm:ss'Z'"),
      priority: 'high',
      department: 'Engineering',
    },
    userId: '1',
  },
  {
    type: 'mention' as const,
    data: {
      message: 'Hey @user, can you review the latest changes?',
      sender: 'John Doe',
      group: 'Team Chat',
      mentionedUser: 'user',
    },
    userId: '1',
  },
  {
    type: 'update' as const,
    data: {
      project: 'Customer Portal',
      status: 'completed',
      milestone: 'User Authentication',
      assignee: 'Sarah Johnson',
    },
    userId: '1',
  },
  {
    type: 'meeting' as const,
    data: {
      title: 'Product Review',
      description: 'Monthly product review meeting',
      startTime: format(new Date().setHours(new Date().getHours() + 3), "yyyy-MM-dd'T'HH:mm:ss'Z'"),
      endTime: format(new Date().setHours(new Date().getHours() + 4), "yyyy-MM-dd'T'HH:mm:ss'Z'"),
      roomId: 'product-review-room',
    },
    userId: '1',
  },
];

interface NotificationState {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt' | 'read'>) => void;
  generateAndAddNotification: (context: { type: Notification['type']; data: any; userId: string }) => Promise<void>;
  markAsRead: (id: string) => void;
  deleteNotification: (id: string) => void;
  getUnreadNotifications: (userId: string) => Notification[];
  initializeNotifications: () => Promise<void>;
  clearNotifications: () => void;
}

// Load notifications from localStorage
const loadNotifications = (): Notification[] => {
  try {
    const savedNotifications = localStorage.getItem('notifications');
    return savedNotifications ? JSON.parse(savedNotifications) : [];
  } catch (error) {
    console.error('Error loading notifications:', error);
    return [];
  }
};

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: loadNotifications(),

  addNotification: notification =>
    set(state => {
      const newNotifications = [
        ...state.notifications,
        {
          ...notification,
          id: Math.random().toString(36).substr(2, 9),
          createdAt: format(new Date(), "yyyy-MM-dd'T'HH:mm:ss'Z'"),
          read: false,
        },
      ];
      // Save to localStorage
      localStorage.setItem('notifications', JSON.stringify(newNotifications));
      return { notifications: newNotifications };
    }),

  generateAndAddNotification: async (context) => {
    try {
      const notificationContent = await generateNotificationContent({
        type: context.type,
        data: context.data,
      });

      get().addNotification({
        ...notificationContent,
        userId: context.userId,
      });
    } catch (error) {
      console.error('Error generating notification:', error);
      // Fallback to a basic notification if AI generation fails
      get().addNotification({
        type: context.type,
        title: 'New Notification',
        description: 'A new notification has been created',
        userId: context.userId,
      });
    }
  },

  initializeNotifications: async () => {
    const { notifications, generateAndAddNotification, clearNotifications } = get();
    
    // Clear existing notifications
    clearNotifications();
    
    // Generate all notifications using Groq
    for (const context of notificationContexts) {
      await generateAndAddNotification(context);
    }
  },

  clearNotifications: () => {
    localStorage.removeItem('notifications');
    set({ notifications: [] });
  },

  markAsRead: id =>
    set(state => {
      const newNotifications = state.notifications.map(notification =>
        notification.id === id ? { ...notification, read: true } : notification
      );
      // Save to localStorage
      localStorage.setItem('notifications', JSON.stringify(newNotifications));
      return { notifications: newNotifications };
    }),

  deleteNotification: id =>
    set(state => {
      const newNotifications = state.notifications.filter(notification => notification.id !== id);
      // Save to localStorage
      localStorage.setItem('notifications', JSON.stringify(newNotifications));
      return { notifications: newNotifications };
    }),

  getUnreadNotifications: userId =>
    get().notifications.filter(
      notification => !notification.read && notification.userId === userId
    ),
}));
