import { create } from 'zustand';

export interface Project {
  id: string;
  name: string;
  description: string;
  status: 'planning' | 'in_progress' | 'completed' | 'on_hold';
  startDate: Date;
  endDate: Date | null;
  createdBy: string;
  createdAt: Date;
}

interface ProjectState {
  projects: Project[];
  isLoading: boolean;
  error: string | null;
  fetchProjects: (userId: string) => void;
  addProject: (project: Omit<Project, 'id' | 'createdAt'>) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  getProjectsByUser: (userId: string) => Project[];
  getProjectsByStatus: (status: Project['status']) => Project[];
}

// Generate mock project data
const generateMockProjects = (userId: string): Project[] => {
  const projectNames = [
    'Website Redesign',
    'Mobile App Development',
    'Database Migration',
    'API Integration',
    'Security Audit',
    'Performance Optimization'
  ];
  
  const statuses: Project['status'][] = ['planning', 'in_progress', 'completed', 'on_hold'];
  
  return projectNames.map((name, index) => {
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - Math.floor(Math.random() * 60));
    
    const endDate = status === 'completed' ? new Date(startDate) : null;
    if (endDate) {
      endDate.setDate(endDate.getDate() + Math.floor(Math.random() * 30) + 10);
    }
    
    return {
      id: `project-${index + 1}`,
      name,
      description: `Description for ${name}`,
      status,
      startDate,
      endDate,
      createdBy: userId,
      createdAt: new Date(startDate)
    };
  });
};

export const useProjectStore = create<ProjectState>((set, get) => ({
  projects: [],
  isLoading: false,
  error: null,

  fetchProjects: (userId: string) => {
    set({ isLoading: true, error: null });
    try {
      // Generate mock data for the user
      const mockProjects = generateMockProjects(userId);
      set({ projects: mockProjects });
    } catch (error) {
      console.error('Error fetching projects:', error);
      set({ error: 'Failed to fetch projects' });
    } finally {
      set({ isLoading: false });
    }
  },

  addProject: (project) => {
    set((state) => ({
      projects: [...state.projects, {
        ...project,
        id: `project-${state.projects.length + 1}`,
        createdAt: new Date()
      }]
    }));
  },

  updateProject: (id, updates) => {
    set((state) => ({
      projects: state.projects.map(project =>
        project.id === id ? { ...project, ...updates } : project
      )
    }));
  },

  deleteProject: (id) => {
    set((state) => ({
      projects: state.projects.filter(project => project.id !== id)
    }));
  },

  getProjectsByUser: (userId) => get().projects.filter(project => project.createdBy === userId),

  getProjectsByStatus: (status) => get().projects.filter(project => project.status === status)
})); 