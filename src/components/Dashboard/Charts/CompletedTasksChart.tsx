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
import { subMonths, format } from 'date-fns';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const options = {
  responsive: true,
  plugins: {
    legend: {
      position: 'top' as const,
    },
    title: {
      display: true,
      text: 'Completed Tasks by Type',
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

export default function CompletedTasksChart() {
  const tasks = useTaskStore(state => state.tasks);

  // Generate last 6 months labels
  const labels = Array.from({ length: 6 }).map((_, i) => {
    const date = subMonths(new Date(), 5 - i);
    return format(date, 'MMM yyyy');
  });

  const completedTasks = tasks.filter(task => task.status === 'completed');

  const data = {
    labels,
    datasets: [
      {
        label: 'Bugs Fixed',
        data: labels.map(() => Math.floor(Math.random() * 5) + 1), // Simulated data
        backgroundColor: 'rgba(255, 99, 132, 0.8)',
      },
      {
        label: 'Features Developed',
        data: labels.map(() => Math.floor(Math.random() * 5) + 1), // Simulated data
        backgroundColor: 'rgba(54, 162, 235, 0.8)',
      },
      {
        label: 'Documents Completed',
        data: labels.map(() => Math.floor(Math.random() * 3) + 1), // Simulated data
        backgroundColor: 'rgba(75, 192, 192, 0.8)',
      },
    ],
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <Bar options={options} data={data} />
    </div>
  );
}
