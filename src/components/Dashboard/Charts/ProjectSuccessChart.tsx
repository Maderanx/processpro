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

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const options = {
  responsive: true,
  plugins: {
    legend: {
      position: 'top' as const,
    },
    title: {
      display: true,
      text: 'Project Success vs Failure Rate',
    },
  },
  scales: {
    y: {
      beginAtZero: true,
      max: 100,
    },
  },
};

const projects = ['Project A', 'Project B', 'Project C', 'Project D'];

export default function ProjectSuccessChart() {
  const data = {
    labels: projects,
    datasets: [
      {
        label: 'Success Rate',
        data: projects.map(() => Math.floor(Math.random() * 30) + 70), // Simulated data
        backgroundColor: 'rgba(75, 192, 192, 0.8)',
      },
      {
        label: 'Failure Rate',
        data: projects.map(() => Math.floor(Math.random() * 20)), // Simulated data
        backgroundColor: 'rgba(255, 99, 132, 0.8)',
      },
    ],
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <Bar options={options} data={data} />
    </div>
  );
}
