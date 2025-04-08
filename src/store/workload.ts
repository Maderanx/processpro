import { create } from 'zustand';

export interface WorkloadData {
  userId: string;
  status: 'todo' | 'in_progress' | 'completed';
  count: number;
}

interface WorkloadState {
  workloadData: WorkloadData[];
  isLoading: boolean;
  error: string | null;
  fetchWorkloadData: (userId: string) => void;
  addWorkloadData: (data: WorkloadData) => void;
  updateWorkloadData: (userId: string, status: string, count: number) => void;
  getWorkloadByUser: (userId: string) => WorkloadData[];
}

// Generate mock workload data
const generateMockWorkloadData = (userId: string): WorkloadData[] => {
  const statuses: ('todo' | 'in_progress' | 'completed')[] = ['todo', 'in_progress', 'completed'];
  
  return statuses.map(status => ({
    userId,
    status,
    count: Math.floor(Math.random() * 10) + 1 // Random value between 1-10
  }));
};

export const useWorkloadStore = create<WorkloadState>((set, get) => ({
  workloadData: [],
  isLoading: false,
  error: null,

  fetchWorkloadData: (userId: string) => {
    set({ isLoading: true, error: null });
    try {
      // Generate mock data for the user
      const mockData = generateMockWorkloadData(userId);
      set({ workloadData: mockData });
    } catch (error) {
      console.error('Error fetching workload data:', error);
      set({ error: 'Failed to fetch workload data' });
    } finally {
      set({ isLoading: false });
    }
  },

  addWorkloadData: (data) => {
    set((state) => ({
      workloadData: [...state.workloadData, data]
    }));
  },

  updateWorkloadData: (userId, status, count) => {
    set((state) => ({
      workloadData: state.workloadData.map(data => 
        data.userId === userId && data.status === status
          ? { ...data, count }
          : data
      )
    }));
  },

  getWorkloadByUser: (userId) => get().workloadData.filter(data => data.userId === userId)
})); 