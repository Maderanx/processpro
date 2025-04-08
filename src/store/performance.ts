import { create } from 'zustand';
import { subMonths, format } from 'date-fns';

export interface PerformanceMetric {
  month: Date;
  completionRate: number;
  efficiencyScore: number;
  userId: string;
}

interface PerformanceState {
  metrics: PerformanceMetric[];
  isLoading: boolean;
  error: string | null;
  fetchMetrics: (userId: string) => void;
  addMetric: (metric: Omit<PerformanceMetric, 'month'>) => void;
  updateMetric: (month: Date, userId: string, updates: Partial<PerformanceMetric>) => void;
  getMetricsByUser: (userId: string) => PerformanceMetric[];
}

// Generate mock data for the last 6 months
const generateMockMetrics = (userId: string): PerformanceMetric[] => {
  return Array.from({ length: 6 }).map((_, i) => {
    const date = subMonths(new Date(), 5 - i);
    return {
      month: date,
      completionRate: Math.floor(Math.random() * 30) + 70, // Random value between 70-100
      efficiencyScore: Math.floor(Math.random() * 20) + 60, // Random value between 60-80
      userId
    };
  });
};

export const usePerformanceStore = create<PerformanceState>((set, get) => ({
  metrics: [],
  isLoading: false,
  error: null,

  fetchMetrics: (userId: string) => {
    set({ isLoading: true, error: null });
    try {
      // Generate mock data for the user
      const mockMetrics = generateMockMetrics(userId);
      set({ metrics: mockMetrics });
    } catch (error) {
      console.error('Error fetching performance metrics:', error);
      set({ error: 'Failed to fetch performance metrics' });
    } finally {
      set({ isLoading: false });
    }
  },

  addMetric: (metric) => {
    set((state) => ({
      metrics: [...state.metrics, { ...metric, month: new Date() }]
    }));
  },

  updateMetric: (month, userId, updates) => {
    set((state) => ({
      metrics: state.metrics.map(metric => 
        metric.month.getTime() === month.getTime() && metric.userId === userId
          ? { ...metric, ...updates }
          : metric
      )
    }));
  },

  getMetricsByUser: (userId) => get().metrics.filter(metric => metric.userId === userId)
})); 