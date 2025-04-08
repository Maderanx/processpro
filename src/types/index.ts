export interface User {
  id: string;
  name: string;
  email: string;
  role: 'manager' | 'employee';
  avatar: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  status: 'todo' | 'in_progress' | 'completed' | 'on_hold';
  assignee: {
    id: string;
    name: string;
    avatar: string;
  };
  department: string;
  dueDate: string;
  createdBy: string;
  createdAt: string;
}

export interface Message {
  id: string;
  content: string;
  senderId: string;
  receiverId: string | null;
  groupId: string | null;
  priority: 'normal' | 'urgent' | 'important';
  createdAt: string;
  read: boolean;
}

export interface ChatGroup {
  id: string;
  name: string;
  members: string[];
  createdAt: string;
}

export interface Meeting {
  id: string;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  participants: string[];
  roomId: string;
  createdBy: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  type: 'mention' | 'meeting' | 'deadline' | 'update';
  title: string;
  description: string;
  read: boolean;
  createdAt: string;
  userId: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'completed' | 'on_hold';
  startDate: string;
  endDate: string;
  createdBy: string;
  createdAt: string;
}

export interface PerformanceMetric {
  id: string;
  userId: string;
  month: string;
  completionRate: number;
  efficiencyScore: number;
  createdAt: string;
}

export interface WorkloadData {
  id: string;
  userId: string;
  status: 'todo' | 'in_progress' | 'completed' | 'on_hold';
  count: number;
  createdAt: string;
}