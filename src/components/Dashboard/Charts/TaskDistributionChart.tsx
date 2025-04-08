import React from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { useTaskStore } from '../../../store/tasks';

ChartJS.register(ArcElement, Tooltip, Legend);

const options = {
  responsive: true,
  plugins: {
    legend: {
      position: 'right' as const,
    },
    title: {
      display: true,
      text: 'Task Distribution by Type',
    },
  },
  cutout: '60%',
};

export default function TaskDistributionChart() {
  const tasks = useTaskStore(state => state.tasks);

  const taskTypes = ['bug', 'feature', 'document'];
  const taskCounts = taskTypes.map(type => tasks.filter(task => task.type === type).length);

  const data = {
    labels: ['Bugs', 'Features', 'Documentation'],
    datasets: [
      {
        data: taskCounts,
        backgroundColor: [
          'rgba(255, 99, 132, 0.8)',
          'rgba(54, 162, 235, 0.8)',
          'rgba(75, 192, 192, 0.8)',
        ],
        borderColor: ['rgba(255, 99, 132, 1)', 'rgba(54, 162, 235, 1)', 'rgba(75, 192, 192, 1)'],
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <Doughnut options={options} data={data} />
    </div>
  );
}
