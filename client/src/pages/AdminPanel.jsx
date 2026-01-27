import { useState, useEffect } from 'react';
import DashboardLayout from '../components/Layout/DashboardLayout';
import { adminAPI } from '../services/api';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const AdminPanel = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await adminAPI.getAnalytics();
      setAnalytics(response.data.data);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading...</div>
        </div>
      </DashboardLayout>
    );
  }

  if (!analytics) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <p className="text-gray-500">Failed to load analytics</p>
        </div>
      </DashboardLayout>
    );
  }

  const chartData = {
    labels: analytics.jobsByStatus?.map(item => item._id) || [],
    datasets: [
      {
        label: 'Jobs',
        data: analytics.jobsByStatus?.map(item => item.count) || [],
        backgroundColor: 'rgba(99, 102, 241, 0.5)',
        borderColor: 'rgba(99, 102, 241, 1)',
        borderWidth: 1
      }
    ]
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Admin Panel</h1>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <p className="text-sm text-gray-600">Total Users</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{analytics.overview.totalUsers}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <p className="text-sm text-gray-600">Total Jobs</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{analytics.overview.totalJobs}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <p className="text-sm text-gray-600">Total Resumes</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{analytics.overview.totalResumes}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <p className="text-sm text-gray-600">Avg ATS Score</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">
              {Math.round(analytics.overview.averageScore)}%
            </p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Jobs by Status</h2>
          <Bar data={chartData} />
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Activity</h2>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {analytics.recentActivity?.map((log, index) => (
              <div key={index} className="p-3 border border-gray-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">{log.action}</p>
                    <p className="text-sm text-gray-500">
                      {log.userId?.name} ({log.userRole}) • {new Date(log.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminPanel;

