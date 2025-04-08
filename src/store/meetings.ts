import { create } from 'zustand';
import { Meeting } from '../types';
import { format } from 'date-fns';
import { useNotificationStore } from './notifications';

interface MeetingState {
  meetings: Meeting[];
  addMeeting: (meeting: Omit<Meeting, 'id' | 'createdAt'>) => void;
  updateMeeting: (id: string, updates: Partial<Meeting>) => void;
  deleteMeeting: (id: string) => void;
  getMeetingsByUser: (userId: string) => Meeting[];
}

// Mock meetings that are visible to all users
const mockMeetings: Meeting[] = [
  {
    id: '1',
    title: 'Team Sync',
    description: 'Weekly team sync meeting',
    startTime: format(new Date().setHours(new Date().getHours() + 1), "yyyy-MM-dd'T'HH:mm:ss"),
    endTime: format(new Date().setHours(new Date().getHours() + 2), "yyyy-MM-dd'T'HH:mm:ss"),
    participants: ['1', '2', '3', '4', '5'],
    roomId: 'team-sync-room',
    createdBy: '1',
    createdAt: format(new Date(), "yyyy-MM-dd'T'HH:mm:ss'Z'"),
  },
  {
    id: '2',
    title: 'Project Review',
    description: 'Monthly project review meeting',
    startTime: format(new Date().setHours(new Date().getHours() + 3), "yyyy-MM-dd'T'HH:mm:ss"),
    endTime: format(new Date().setHours(new Date().getHours() + 4), "yyyy-MM-dd'T'HH:mm:ss"),
    participants: ['1', '2', '4'],
    roomId: 'project-review-room',
    createdBy: '2',
    createdAt: format(new Date(), "yyyy-MM-dd'T'HH:mm:ss'Z'"),
  },
];

export const useMeetingStore = create<MeetingState>((set, get) => ({
  meetings: mockMeetings,

  addMeeting: meeting => {
    const { generateAndAddNotification } = useNotificationStore.getState();
    
    // Generate notifications for all participants
    meeting.participants.forEach(participantId => {
      generateAndAddNotification({
        type: 'meeting',
        data: {
          title: meeting.title,
          description: meeting.description,
          startTime: meeting.startTime,
          endTime: meeting.endTime,
          roomId: meeting.roomId,
        },
        userId: participantId,
      });
    });

    set(state => ({
      meetings: [
        ...state.meetings,
        {
          ...meeting,
          id: Math.random().toString(36).substr(2, 9),
          createdAt: format(new Date(), "yyyy-MM-dd'T'HH:mm:ss'Z'"),
        },
      ],
    }));
  },

  updateMeeting: (id, updates) => {
    const { generateAndAddNotification } = useNotificationStore.getState();
    const meeting = get().meetings.find(m => m.id === id);
    
    if (meeting && updates.startTime) {
      // Generate notifications for time changes
      meeting.participants.forEach(participantId => {
        generateAndAddNotification({
          type: 'meeting',
          data: {
            title: meeting.title,
            description: 'Meeting time has been updated',
            startTime: updates.startTime,
            endTime: updates.endTime || meeting.endTime,
            roomId: meeting.roomId,
          },
          userId: participantId,
        });
      });
    }

    set(state => ({
      meetings: state.meetings.map(meeting =>
        meeting.id === id ? { ...meeting, ...updates } : meeting
      ),
    }));
  },

  deleteMeeting: id =>
    set(state => ({
      meetings: state.meetings.filter(meeting => meeting.id !== id),
    })),

  getMeetingsByUser: userId =>
    get().meetings.filter(
      meeting => meeting.participants.includes(userId) || meeting.createdBy === userId
    ),
}));
