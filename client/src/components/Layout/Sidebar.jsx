import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getAuth } from '../../utils/auth';

const Sidebar = ({ onClose }) => {
  const location = useLocation();
  const { user } = getAuth();

  const menu = [
    { path: '/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/my-resumes', label: 'My Resumes', icon: '📄' },
    { path: '/ats-scores', label: 'ATS Scores', icon: '🎯' },
    { path: '/matches', label: 'Job Matches', icon: '🔍' },
    { path: '/tips', label: 'Resume Tips', icon: '💡' },
    { path: '/profile', label: 'Profile', icon: '👤' },
    { path: '/settings', label: 'Settings', icon: '⚙️' }
  ];

  const handleLinkClick = () => {
    if (onClose) onClose();
  };

  return (
    <div className="w-64 bg-white/10 backdrop-blur-2xl shadow-2xl min-h-screen p-4 sm:p-6 border-r border-white/20">
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="mb-6 sm:mb-8"
      >
        <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-indigo-400 to-primary-500 bg-clip-text text-transparent">
          TalentScan AI
        </h1>
        <p className="text-xs sm:text-sm text-white/60 mt-1">Your Career Assistant</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-6 p-3 sm:p-4 bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 shadow-lg"
      >
        <p className="text-xs sm:text-sm font-semibold text-white">{user?.name || 'Guest User'}</p>
        <p className="text-xs text-white/60 mt-1">Job Seeker</p>
      </motion.div>

      <nav className="space-y-1 sm:space-y-2">
        {menu.map((item, index) => {
          const isActive = location.pathname === item.path || 
            (item.path !== '/dashboard' && location.pathname.startsWith(item.path));
          
          return (
            <motion.div
              key={item.path}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 + index * 0.05 }}
            >
              <Link
                to={item.path}
                onClick={handleLinkClick}
                className={`flex items-center space-x-2 sm:space-x-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg sm:rounded-xl transition-all duration-200 text-sm sm:text-base ${
                  isActive
                    ? 'bg-gradient-to-r from-indigo-500/30 to-primary-500/30 text-white font-semibold shadow-lg border border-white/30'
                    : 'text-white/70 hover:bg-white/10 hover:text-white hover:border border-white/10'
                }`}
              >
                <span className="text-base sm:text-lg w-4 sm:w-5 text-center flex-shrink-0">{item.icon}</span>
                <span className="text-xs sm:text-sm">{item.label}</span>
              </Link>
            </motion.div>
          );
        })}
      </nav>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-6 sm:mt-8 pt-6 sm:pt-8 border-t border-white/20"
      >
        <Link
          to="/upload"
          onClick={handleLinkClick}
          className="flex items-center justify-center space-x-1 sm:space-x-2 px-3 sm:px-4 py-2.5 sm:py-3 bg-gradient-to-r from-indigo-600 to-primary-600 text-white rounded-lg sm:rounded-xl hover:from-indigo-700 hover:to-primary-700 transition-all font-semibold shadow-2xl hover:shadow-indigo-500/50 transform hover:scale-105 text-xs sm:text-sm"
        >
          <span>➕</span>
          <span className="hidden sm:inline">Upload New Resume</span>
          <span className="sm:hidden">Upload</span>
        </Link>
      </motion.div>
    </div>
  );
};

export default Sidebar;
