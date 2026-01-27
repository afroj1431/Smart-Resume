import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { resumesAPI } from '../services/api';

const JobMatches = () => {
  const [resumes, setResumes] = useState([]);
  const [selectedResume, setSelectedResume] = useState(null);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchResumes();
  }, []);

  const fetchResumes = async () => {
    try {
      // This would fetch user's resumes - placeholder for now
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch resumes:', error);
      setLoading(false);
    }
  };

  // Mock job matches data
  const mockMatches = [
    {
      title: 'Senior Software Engineer',
      company: 'Tech Corp',
      match: 92,
      skills: ['React', 'Node.js', 'TypeScript', 'AWS'],
      location: 'Remote',
      salary: '$120k - $150k'
    },
    {
      title: 'Full Stack Developer',
      company: 'StartupXYZ',
      match: 87,
      skills: ['React', 'Node.js', 'MongoDB'],
      location: 'San Francisco, CA',
      salary: '$100k - $130k'
    },
    {
      title: 'Frontend Engineer',
      company: 'Design Co',
      match: 85,
      skills: ['React', 'TypeScript', 'CSS'],
      location: 'New York, NY',
      salary: '$110k - $140k'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-pink-900 py-12">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-bold text-white mb-4">Job Matches</h1>
          <p className="text-xl text-white/80">Find jobs that match your resume</p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {mockMatches.map((job, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -5, scale: 1.02 }}
              className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 hover:border-white/40 transition-all shadow-2xl"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-white mb-1">{job.title}</h3>
                  <p className="text-white/60 text-sm">{job.company}</p>
                </div>
                <div className="px-3 py-1 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full">
                  <span className="text-white font-bold text-sm">{job.match}%</span>
                </div>
              </div>
              
              <div className="mb-4">
                <p className="text-white/80 text-sm mb-2">📍 {job.location}</p>
                <p className="text-white/80 text-sm">💰 {job.salary}</p>
              </div>
              
              <div className="mb-4">
                <p className="text-white/60 text-xs mb-2">Required Skills:</p>
                <div className="flex flex-wrap gap-2">
                  {job.skills.map((skill, i) => (
                    <span key={i} className="px-2 py-1 bg-purple-500/30 rounded text-white text-xs">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
              
              <button className="w-full px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all font-semibold">
                Apply Now
              </button>
            </motion.div>
          ))}
        </div>

        {mockMatches.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <p className="text-white/60 text-lg mb-6">No job matches yet</p>
            <Link
              to="/upload"
              className="inline-block px-6 py-3 bg-white text-purple-600 rounded-lg hover:bg-white/90 transition-all font-semibold"
            >
              Upload Your Resume
            </Link>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default JobMatches;









