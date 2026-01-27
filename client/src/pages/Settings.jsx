import { motion } from 'framer-motion';
import DashboardLayout from '../components/Layout/DashboardLayout';
import { getAuth } from '../utils/auth';

const Settings = () => {
  const { user } = getAuth();

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-4xl font-bold text-white mb-2">Settings</h1>
          <p className="text-white/70 text-lg">Manage your account preferences</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-white/20"
        >
          <h2 className="text-2xl font-bold text-white mb-6">Profile Information</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-white/80 mb-2">Name</label>
              <input
                type="text"
                value={user?.name || ''}
                disabled
                className="w-full px-4 py-3 border border-white/20 rounded-xl bg-white/5 backdrop-blur-md text-white placeholder-white/40"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-white/80 mb-2">Email</label>
              <input
                type="email"
                value={user?.email || ''}
                disabled
                className="w-full px-4 py-3 border border-white/20 rounded-xl bg-white/5 backdrop-blur-md text-white placeholder-white/40"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-white/80 mb-2">Account Type</label>
              <input
                type="text"
                value="Job Seeker"
                disabled
                className="w-full px-4 py-3 border border-white/20 rounded-xl bg-white/5 backdrop-blur-md text-white placeholder-white/40"
              />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-2xl"
        >
          <h2 className="text-2xl font-bold text-white mb-4">About TalentScan AI</h2>
          <p className="text-white/80 leading-relaxed mb-4">
            TalentScan AI is your personal career assistant. We help job seekers optimize their resumes 
            with AI-powered analysis, ATS scoring, and personalized job matching.
          </p>
          <p className="text-white/80 leading-relaxed">
            Upload your resume to get instant insights and improve your chances of landing your dream job.
          </p>
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default Settings;
