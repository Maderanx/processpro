import React, { useEffect } from 'react';
import DashboardLayout from '../components/Layout/DashboardLayout';
import TaskBoard from '../components/Dashboard/TaskBoard';
import PerformanceChart from '../components/Dashboard/Charts/PerformanceChart';
import WorkloadChart from '../components/Dashboard/Charts/WorkloadChart';
import PendingTasksChart from '../components/Dashboard/Charts/PendingTasksChart';
import CompletedTasksChart from '../components/Dashboard/Charts/CompletedTasksChart';
import ProjectSuccessChart from '../components/Dashboard/Charts/ProjectSuccessChart';
import { useAuthStore } from '../store/auth';
import { useTaskStore } from '../store/tasks';
import { usePerformanceStore } from '../store/performance';
import { useWorkloadStore } from '../store/workload';
import { useProjectStore } from '../store/projects';

export default function Dashboard() {
  const user = useAuthStore((state) => state.user);
  const { fetchTasks } = useTaskStore();
  const { fetchMetrics } = usePerformanceStore();
  const { fetchWorkloadData } = useWorkloadStore();
  const { fetchProjects } = useProjectStore();

  useEffect(() => {
    if (user?.id) {
      // Fetch all necessary data
      fetchTasks(user.id);
      fetchMetrics(user.id);
      fetchWorkloadData(user.id);
      fetchProjects(user.id);
    }
  }, [user?.id, fetchTasks, fetchMetrics, fetchWorkloadData, fetchProjects]);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Welcome back, {user?.name}</h1>
            <p className="text-gray-600">Here's what's happening today</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Performance Metrics */}
          <div className="lg:col-span-2">
            <PerformanceChart />
          </div>

          {/* Pending Tasks by Priority */}
          <div>
            <PendingTasksChart />
          </div>

          {/* Workload Distribution */}
          <div className="lg:col-span-2">
            <WorkloadChart />
          </div>

          {/* Completed Tasks Overview */}
          <div>
            <CompletedTasksChart />
          </div>

          {/* Project Success vs Failure */}
          <div className="lg:col-span-3">
            <ProjectSuccessChart />
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">Task Board</h2>
          <TaskBoard />
        </div>
      </div>
    </DashboardLayout>
  );
}