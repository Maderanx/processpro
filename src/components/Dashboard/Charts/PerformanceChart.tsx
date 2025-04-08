import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { useTaskStore } from '../../../store/tasks';
import { useAuthStore } from '../../../store/auth';
import { subMonths, format } from 'date-fns';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const options = {
  responsive: true,
  plugins: {
    legend: {
      position: 'top' as const,
    },
    title: {
      display: true,
      text: 'Performance Metrics',
    },
  },
  scales: {
    y: {
      beginAtZero: true,
      max: 100,
    },
  },
};

export default function PerformanceChart() {
  const { user } = useAuthStore();
  const tasks = useTaskStore(state => state.tasks);

  // Generate last 6 months labels
  const labels = Array.from({ length: 6 }).map((_, i) => {
    const date = subMonths(new Date(), 5 - i);
    return format(date, 'MMM yyyy');
  });

  // Calculate completion rate and efficiency score
  const completionRate = labels.map(() => Math.floor(Math.random() * 30) + 70); // Simulated data
  const efficiencyScore = labels.map(() => Math.floor(Math.random() * 20) + 60); // Simulated data

  const data = {
    labels,
    datasets: [
      {
        label: 'Task Completion Rate',
        data: completionRate,
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
        fill: true,
        tension: 0.4,
      },
      {
        label: 'Efficiency Score',
        data: efficiencyScore,
        borderColor: 'rgb(53, 162, 235)',
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <Line options={options} data={data} />
    </div>
  );
}
