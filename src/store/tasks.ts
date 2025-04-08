import { create } from 'zustand';
import { Task } from '../types';
import { useNotificationStore } from './notifications';
import { format } from 'date-fns';

interface TaskState {
  tasks: Task[];
  isLoading: boolean;
  error: string | null;
  fetchTasks: (userId: string) => Promise<void>;
  addTask: (task: Omit<Task, 'id' | 'createdAt'>) => Promise<void>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  getTasksByStatus: (status: Task['status']) => Task[];
  getTasksByPriority: (priority: Task['priority']) => Task[];
  getTasksByAssignee: (assigneeId: string) => Task[];
}

// Helper function to generate mock tasks
const generateMockTasks = (userId: string): Task[] => {
  const priorities: Task['priority'][] = ['low', 'medium', 'high'];
  const statuses: Task['status'][] = ['todo', 'in_progress', 'completed', 'on_hold'];
  const departments = ['Engineering', 'Marketing', 'Sales', 'HR'];
  
  return Array.from({ length: 20 }, (_, i) => ({
    id: `task-${i + 1}`,
    title: `Task ${i + 1}`,
    description: `Description for task ${i + 1}`,
    priority: priorities[Math.floor(Math.random() * priorities.length)],
    status: statuses[Math.floor(Math.random() * statuses.length)],
    assignee: {
      id: `user-${Math.floor(Math.random() * 5) + 1}`,
      name: `User ${Math.floor(Math.random() * 5) + 1}`,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${Math.floor(Math.random() * 5) + 1}`,
    },
    department: departments[Math.floor(Math.random() * departments.length)],
    dueDate: new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
    createdBy: userId,
    createdAt: new Date().toISOString(),
  }));
};

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: [],
  isLoading: false,
  error: null,

  fetchTasks: async (userId: string) => {
    set({ isLoading: true, error: null });
    try {
      // Generate mock tasks for the user
      const mockTasks = generateMockTasks(userId);
      set({ tasks: mockTasks });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to fetch tasks' });
    } finally {
      set({ isLoading: false });
    }
  },

  addTask: async (task) => {
    const { generateAndAddNotification } = useNotificationStore.getState();
    
    // Generate notification for the assignee
    generateAndAddNotification({
      type: 'deadline',
      data: {
        task: task.title,
        dueDate: task.dueDate,
        priority: task.priority,
        department: task.department,
      },
      userId: task.assignee.id,
    });

    set((state) => ({
      tasks: [...state.tasks, {
        ...task,
        id: Math.random().toString(36).substr(2, 9),
        createdAt: format(new Date(), "yyyy-MM-dd'T'HH:mm:ss'Z'"),
      }],
    }));
  },

  updateTask: async (id, updates) => {
    const { generateAndAddNotification } = useNotificationStore.getState();
    const task = get().tasks.find(t => t.id === id);
    
    if (task && updates.status === 'completed') {
      // Generate notification for task completion
      generateAndAddNotification({
        type: 'update',
        data: {
          task: task.title,
          status: 'completed',
          assignee: task.assignee.name,
        },
        userId: task.assignee.id,
      });
    }

    set((state) => ({
      tasks: state.tasks.map(task =>
        task.id === id ? { ...task, ...updates } : task
      ),
    }));
  },

  deleteTask: async (id) => {
    set({ isLoading: true, error: null });
    try {
      set((state) => ({
        tasks: state.tasks.filter((task) => task.id !== id),
      }));
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to delete task' });
    } finally {
      set({ isLoading: false });
    }
  },

  getTasksByStatus: (status) => {
    return get().tasks.filter((task) => task.status === status);
  },

  getTasksByPriority: (priority) => {
    return get().tasks.filter((task) => task.priority === priority);
  },

  getTasksByAssignee: (assigneeId) => {
    return get().tasks.filter((task) => task.assignee.id === assigneeId);
  },
}));