import { Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const AnalyticsChart = ({ type, data, title, emptyMessage = 'No data available' }) => {
  if (!data || (type === 'bar' && (!data.labels || data.labels.length === 0)) || 
      (type === 'doughnut' && (!data.datasets || !data.datasets[0] || !data.datasets[0].data))) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400">
        <div className="text-center">
          <p className="text-sm">{emptyMessage}</p>
        </div>
      </div>
    );
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: type === 'doughnut' ? 'bottom' : 'top',
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        titleFont: { size: 14 },
        bodyFont: { size: 13 }
      }
    },
    scales: type === 'bar' ? {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1
        }
      }
    } : undefined
  };

  return (
    <div className="h-64">
      {type === 'bar' ? (
        <Bar data={data} options={chartOptions} />
      ) : (
        <Doughnut data={data} options={chartOptions} />
      )}
    </div>
  );
};

export default AnalyticsChart;

