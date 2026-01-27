import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../components/Layout/DashboardLayout';
import { resumesAPI, scoreAPI } from '../services/api';
import { Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';
import { motion } from 'framer-motion';

ChartJS.register(ArcElement, Tooltip, Legend);

const ATSScores = () => {
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchScores();
  }, []);

  const fetchScores = async () => {
    try {
      const response = await resumesAPI.getMyResumes();
      const resumes = response.data.data.resumes || [];
      
      const scoresData = await Promise.all(
        resumes.map(async (resume) => {
          try {
            const scoreRes = await scoreAPI.get(resume._id);
            return {
              resume,
              score: scoreRes.data.data.score
            };
          } catch {
            return null;
          }
        })
      );
      
      setScores(scoresData.filter(s => s !== null));
    } catch (error) {
      console.error('Failed to fetch scores:', error);
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'from-green-500 to-emerald-500';
    if (score >= 60) return 'from-blue-500 to-cyan-500';
    if (score >= 40) return 'from-yellow-500 to-orange-500';
    return 'from-red-500 to-pink-500';
  };

  const chartData = scores.length > 0 ? {
    labels: ['Excellent (80-100)', 'Good (60-79)', 'Average (40-59)', 'Poor (<40)'],
    datasets: [{
      data: [
        scores.filter(s => s.score.finalScore >= 80).length,
        scores.filter(s => s.score.finalScore >= 60 && s.score.finalScore < 80).length,
        scores.filter(s => s.score.finalScore >= 40 && s.score.finalScore < 60).length,
        scores.filter(s => s.score.finalScore < 40).length
      ],
      backgroundColor: [
        'rgba(34, 197, 94, 0.8)',
        'rgba(59, 130, 246, 0.8)',
        'rgba(251, 191, 36, 0.8)',
        'rgba(239, 68, 68, 0.8)'
      ],
      borderColor: [
        'rgba(34, 197, 94, 1)',
        'rgba(59, 130, 246, 1)',
        'rgba(251, 191, 36, 1)',
        'rgba(239, 68, 68, 1)'
      ],
      borderWidth: 2
    }]
  } : null;

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading...</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">ATS Scores</h1>
            <p className="text-white/70 text-lg">Track your resume performance over time</p>
          </div>
          <Link
            to="/upload"
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all font-semibold shadow-2xl hover:shadow-purple-500/50 transform hover:scale-105"
          >
            Upload New Resume
          </Link>
        </motion.div>

        {scores.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl p-12 text-center border border-white/20"
          >
            <div className="text-6xl mb-4">🎯</div>
            <h3 className="text-2xl font-bold text-white mb-2">No scores yet</h3>
            <p className="text-white/70 mb-6">Upload a resume to get your first ATS score</p>
            <Link
              to="/upload"
              className="inline-block px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all font-semibold shadow-lg hover:shadow-purple-500/50 transform hover:scale-105"
            >
              Upload Resume
            </Link>
          </motion.div>
        ) : (
          <>
            {/* Score Distribution Chart */}
            {chartData && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl p-6 border border-white/20"
              >
                <h2 className="text-2xl font-bold text-white mb-4">Score Distribution</h2>
                <div className="h-64">
                  <Doughnut data={chartData} options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: { 
                        position: 'bottom',
                        labels: {
                          color: 'white',
                          font: { size: 12 }
                        }
                      }
                    }
                  }} />
                </div>
              </motion.div>
            )}

            {/* Scores List */}
            <div className="space-y-4">
              {scores.map((item, index) => (
                <motion.div
                  key={item.resume._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ x: 5 }}
                  className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-6 hover:border-white/40 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-white mb-2">
                        {item.resume.candidateName || item.resume.fileName}
                      </h3>
                      <p className="text-sm text-white/60 mb-4">
                        Analyzed on {new Date(item.resume.createdAt).toLocaleDateString()}
                      </p>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/20">
                          <p className="text-xs text-white/70 mb-1">Skills</p>
                          <p className="text-xl font-bold text-white">{item.score.skillScore}%</p>
                        </div>
                        <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/20">
                          <p className="text-xs text-white/70 mb-1">Experience</p>
                          <p className="text-xl font-bold text-white">{item.score.experienceScore}%</p>
                        </div>
                        <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/20">
                          <p className="text-xs text-white/70 mb-1">Education</p>
                          <p className="text-xl font-bold text-white">{item.score.educationScore}%</p>
                        </div>
                      </div>
                    </div>
                    <div className="ml-6 text-center">
                      <motion.div
                        animate={{ rotate: [0, 5, -5, 0] }}
                        transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                        className={`w-24 h-24 rounded-full bg-gradient-to-br ${getScoreColor(item.score.finalScore)} flex items-center justify-center shadow-2xl mb-2`}
                      >
                        <div className="text-center">
                          <div className="text-3xl font-bold text-white">{item.score.finalScore}</div>
                          <div className="text-white/80 text-xs">out of 100</div>
                        </div>
                      </motion.div>
                      <Link
                        to={`/analyzer/${item.resume._id}`}
                        className="text-sm text-white/80 hover:text-purple-300 font-semibold transition-colors"
                      >
                        View Details →
                      </Link>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ATSScores;



