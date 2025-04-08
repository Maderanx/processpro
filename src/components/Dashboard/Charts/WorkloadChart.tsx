import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { useTaskStore } from '../../../store/tasks';
import { useAuthStore } from '../../../store/auth';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const options = {
  responsive: true,
  plugins: {
    legend: {
      position: 'top' as const,
    },
    title: {
      display: true,
      text: 'Workload Distribution by Department',
    },
  },
  scales: {
    x: {
      stacked: true,
    },
    y: {
      stacked: true,
      beginAtZero: true,
    },
  },
};

export default function WorkloadChart() {
  const tasks = useTaskStore(state => state.tasks);

  const departments = ['Engineering', 'Design', 'Product'];
  const taskTypes = ['todo', 'in_progress', 'completed'] as const;

  const data = {
    labels: departments,
    datasets: taskTypes.map((status, index) => ({
      label: status === 'todo' ? 'To Do' : status === 'in_progress' ? 'In Progress' : 'Completed',
      data: departments.map(() => Math.floor(Math.random() * 10) + 1), // Simulated data
      backgroundColor: [
        'rgba(255, 99, 132, 0.8)',
        'rgba(54, 162, 235, 0.8)',
        'rgba(75, 192, 192, 0.8)',
      ][index],
    })),
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <Bar options={options} data={data} />
    </div>
  );
}
