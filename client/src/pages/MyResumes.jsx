import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../components/Layout/DashboardLayout';
import { resumesAPI, scoreAPI } from '../services/api';
import { motion } from 'framer-motion';

const MyResumes = () => {
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchResumes();
  }, []);

  const fetchResumes = async () => {
    try {
      const response = await resumesAPI.getMyResumes();
      const resumesData = response.data.data.resumes || [];
      
      // Fetch scores for each resume
      const resumesWithScores = await Promise.all(
        resumesData.map(async (resume) => {
          try {
            const scoreRes = await scoreAPI.get(resume._id);
            return { ...resume, score: scoreRes.data.data.score };
          } catch {
            return { ...resume, score: null };
          }
        })
      );
      
      setResumes(resumesWithScores);
    } catch (error) {
      console.error('Failed to fetch resumes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this resume?')) return;

    try {
      await resumesAPI.delete(id);
      setResumes(resumes.filter(r => r._id !== id));
    } catch (error) {
      alert('Failed to delete resume');
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

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">My Resumes</h1>
            <p className="text-white/70 text-lg">Manage and analyze your uploaded resumes</p>
          </div>
          <Link
            to="/upload"
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all font-semibold shadow-2xl hover:shadow-purple-500/50 transform hover:scale-105"
          >
            Upload New Resume
          </Link>
        </motion.div>

        {resumes.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl p-12 text-center border border-white/20"
          >
            <div className="text-6xl mb-4">📄</div>
            <h3 className="text-2xl font-bold text-white mb-2">No resumes yet</h3>
            <p className="text-white/70 mb-6">Upload your first resume to get started with AI-powered analysis</p>
            <Link
              to="/upload"
              className="inline-block px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all font-semibold shadow-lg hover:shadow-purple-500/50 transform hover:scale-105"
            >
              Upload Resume
            </Link>
          </motion.div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {resumes.map((resume, index) => (
              <motion.div
                key={resume._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5, scale: 1.02 }}
                className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 hover:border-white/40 transition-all overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="font-bold text-white mb-1">
                        {resume.candidateName || resume.fileName}
                      </h3>
                      <p className="text-sm text-white/60">
                        {new Date(resume.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    {resume.score && (
                      <div className={`px-3 py-1 rounded-full text-sm font-bold ${
                        resume.score.finalScore >= 80
                          ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white'
                          : resume.score.finalScore >= 60
                          ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white'
                          : 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white'
                      }`}>
                        {resume.score.finalScore}%
                      </div>
                    )}
                  </div>

                  <div className="mb-4">
                    <p className="text-sm text-white/70 mb-2">Skills Detected:</p>
                    <div className="flex flex-wrap gap-2">
                      {resume.extractedSkills?.slice(0, 3).map((skill, i) => (
                        <span key={i} className="px-2 py-1 bg-purple-500/30 backdrop-blur-md text-white rounded-lg text-xs border border-white/20">
                          {skill}
                        </span>
                      ))}
                      {resume.extractedSkills?.length > 3 && (
                        <span className="px-2 py-1 bg-white/10 backdrop-blur-md text-white/80 rounded-lg text-xs border border-white/20">
                          +{resume.extractedSkills.length - 3}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <Link
                      to={`/analyzer/${resume._id}`}
                      className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all text-sm font-semibold text-center shadow-lg hover:shadow-purple-500/50"
                    >
                      View Analysis
                    </Link>
                    <button
                      onClick={() => handleDelete(resume._id)}
                      className="px-4 py-2 bg-white/10 backdrop-blur-md text-white/80 rounded-xl hover:bg-white/20 transition-colors text-sm border border-white/20"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default MyResumes;



