import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../components/Layout/DashboardLayout';
import DashboardCard from '../components/Dashboard/DashboardCard';
import EmptyState from '../components/Dashboard/EmptyState';
import { dashboardAPI } from '../services/api';
import { motion } from 'framer-motion';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalResumes: 0,
    latestScore: null,
    averageScore: 0,
    recentResumes: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Use dashboard API for aggregated stats
      const dashboardRes = await dashboardAPI.getStats();
      const data = dashboardRes.data.data;
      
      setStats({
        totalResumes: data.totalResumes,
        latestScore: data.latestScore,
        averageScore: data.averageScore,
        recentResumes: data.recentResumes || []
      });
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'from-green-500 to-emerald-500';
    if (score >= 60) return 'from-blue-500 to-cyan-500';
    if (score >= 40) return 'from-yellow-500 to-orange-500';
    return 'from-red-500 to-orange-500';
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mb-4"></div>
            <p className="text-gray-500">Loading your dashboard...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={fetchDashboardData}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Dashboard</h1>
            <p className="text-white/70 text-lg">Your personal AI career assistant</p>
          </div>
          <Link
            to="/upload"
            className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-primary-600 text-white rounded-xl hover:from-indigo-700 hover:to-primary-700 transition-all font-semibold shadow-2xl hover:shadow-indigo-500/50 transform hover:scale-105"
          >
            Upload New Resume
          </Link>
        </motion.div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <DashboardCard
              title="My Resumes"
              value={stats.totalResumes}
              icon="📄"
              link="/my-resumes"
              linkText="View all resumes"
              iconBg="bg-gradient-to-br from-blue-500 to-cyan-500"
            />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <DashboardCard
              title="Latest ATS Score"
              value={stats.latestScore ? `${stats.latestScore.finalScore}%` : 'N/A'}
              icon="🎯"
              link={stats.latestScore ? `/analyzer/${stats.latestScore.resumeId}` : "/upload"}
              linkText={stats.latestScore ? "View details" : "Upload resume"}
              iconBg={stats.latestScore ? `bg-gradient-to-br ${getScoreColor(stats.latestScore.finalScore)}` : "bg-gradient-to-br from-gray-400 to-gray-600"}
            />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <DashboardCard
              title="Average Score"
              value={stats.averageScore > 0 ? `${stats.averageScore}%` : 'N/A'}
              icon="📊"
              link="/ats-scores"
              linkText="View all scores"
              iconBg="bg-gradient-to-br from-indigo-500 to-primary-600"
            />
          </motion.div>
        </div>

        {/* Latest Score Display */}
        {stats.latestScore && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20 shadow-2xl"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-3xl font-bold text-white mb-2">Your Latest ATS Score</h2>
                <p className="text-white/70 text-lg">Keep improving to increase your chances!</p>
              </div>
              <motion.div
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                className={`w-32 h-32 rounded-full bg-gradient-to-br ${getScoreColor(stats.latestScore.finalScore)} flex items-center justify-center shadow-2xl`}
              >
                <div className="text-center">
                  <div className="text-5xl font-bold text-white">{stats.latestScore.finalScore}</div>
                  <div className="text-white/80 text-sm">out of 100</div>
                </div>
              </motion.div>
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-5 border border-white/20">
                <p className="text-sm text-white/70 mb-1">Skills</p>
                <p className="text-3xl font-bold text-white">{stats.latestScore.skillScore}%</p>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-5 border border-white/20">
                <p className="text-sm text-white/70 mb-1">Experience</p>
                <p className="text-3xl font-bold text-white">{stats.latestScore.experienceScore}%</p>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-5 border border-white/20">
                <p className="text-sm text-white/70 mb-1">Education</p>
                <p className="text-3xl font-bold text-white">{stats.latestScore.educationScore}%</p>
              </div>
            </div>
            <div className="mt-6">
              <Link
                to={`/analyzer/${stats.latestScore.resumeId}`}
                className="inline-block px-6 py-3 bg-gradient-to-r from-indigo-600 to-primary-600 text-white rounded-xl hover:from-indigo-700 hover:to-primary-700 transition-all font-semibold shadow-lg hover:shadow-indigo-500/50 transform hover:scale-105"
              >
                View Full Analysis →
              </Link>
            </div>
          </motion.div>
        )}

        {/* Recent Analysis History */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Recent Analysis</h2>
            {stats.recentResumes.length > 0 && (
              <Link
                to="/my-resumes"
                className="text-sm text-white/80 hover:text-white font-semibold transition-colors"
              >
                View all →
              </Link>
            )}
          </div>

          {stats.recentResumes.length === 0 ? (
            <EmptyState
              icon="📄"
              title="No resumes analyzed yet"
              description="Upload your first resume to get AI-powered insights and improve your job search"
              actionLabel="Upload Resume"
              actionLink="/upload"
            />
          ) : (
            <div className="space-y-3">
              {stats.recentResumes.map((resume, index) => (
                <motion.div
                  key={resume._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                >
                  <Link
                    to={`/analyzer/${resume._id}`}
                    className="block p-4 bg-white/5 backdrop-blur-md border border-white/10 rounded-xl hover:bg-white/10 hover:border-white/30 transition-all duration-200 group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-white group-hover:text-indigo-300 transition-colors">
                          {resume.candidateName || resume.fileName}
                        </h3>
                        <p className="text-sm text-white/60 mt-1">
                          {new Date(resume.createdAt).toLocaleDateString()} • {resume.extractedSkills?.length || 0} skills detected
                        </p>
                      </div>
                      <div className="flex items-center space-x-3">
                        {resume.score && (
                          <div className={`px-3 py-1 rounded-full text-xs font-bold ${
                            resume.score.finalScore >= 80
                              ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white'
                              : resume.score.finalScore >= 60
                              ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white'
                              : 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white'
                          }`}>
                            {resume.score.finalScore}%
                          </div>
                        )}
                        <svg className="w-5 h-5 text-white/40 group-hover:text-indigo-300 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="grid md:grid-cols-2 gap-6"
        >
          <Link
            to="/matches"
            className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 hover:border-white/40 hover:shadow-2xl transition-all group transform hover:scale-105"
          >
            <div className="flex items-center space-x-4">
              <div className="text-5xl">🔍</div>
              <div>
                <h3 className="text-xl font-bold text-white group-hover:text-primary-300 transition-colors">
                  Find Job Matches
                </h3>
                <p className="text-white/70 mt-1">Discover jobs that match your resume</p>
              </div>
            </div>
          </Link>
          <Link
            to="/tips"
            className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 hover:border-white/40 hover:shadow-2xl transition-all group transform hover:scale-105"
          >
            <div className="flex items-center space-x-4">
              <div className="text-5xl">💡</div>
              <div>
                <h3 className="text-xl font-bold text-white group-hover:text-indigo-300 transition-colors">
                  Get Resume Tips
                </h3>
                <p className="text-white/70 mt-1">Learn how to improve your resume</p>
              </div>
            </div>
          </Link>
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
