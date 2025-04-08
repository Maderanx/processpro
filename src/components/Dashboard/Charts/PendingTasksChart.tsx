import React from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';
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
      text: 'Pending Tasks by Priority',
    },
  },
};

export default function PendingTasksChart() {
  const tasks = useTaskStore(state => state.tasks);

  const pendingTasks = tasks.filter(task => task.status !== 'completed');
  const priorityCounts = {
    high: pendingTasks.filter(task => task.priority === 'high').length,
    medium: pendingTasks.filter(task => task.priority === 'medium').length,
    low: pendingTasks.filter(task => task.priority === 'low').length,
  };

  const data = {
    labels: ['High Priority', 'Medium Priority', 'Low Priority'],
    datasets: [
      {
        data: [priorityCounts.high, priorityCounts.medium, priorityCounts.low],
        backgroundColor: [
          'rgba(255, 99, 132, 0.8)',
          'rgba(255, 206, 86, 0.8)',
          'rgba(75, 192, 192, 0.8)',
        ],
        borderColor: ['rgba(255, 99, 132, 1)', 'rgba(255, 206, 86, 1)', 'rgba(75, 192, 192, 1)'],
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <Pie options={options} data={data} />
    </div>
  );
}
