import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const Navbar = ({ onMenuClick }) => {
  return (
    <div className="bg-white/10 backdrop-blur-2xl shadow-xl border-b border-white/20 px-4 sm:px-6 py-3 sm:py-4">
      <div className="flex items-center justify-between gap-4">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center space-x-3 sm:space-x-4"
        >
          {/* Mobile Menu Button */}
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 hover:bg-white/10 rounded-lg transition-colors"
            aria-label="Toggle menu"
          >
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <h2 className="text-base sm:text-lg font-bold bg-gradient-to-r from-indigo-400 to-primary-500 bg-clip-text text-transparent hidden sm:block">
            TalentScan AI
          </h2>
          <span className="text-xs sm:text-sm text-white/70 hidden md:block">Your AI Career Assistant</span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-2 sm:gap-4"
        >
          <Link
            to="/upload"
            className="px-3 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm bg-gradient-to-r from-indigo-600 to-primary-600 text-white rounded-lg sm:rounded-xl hover:from-indigo-700 hover:to-primary-700 transition-all font-semibold shadow-lg hover:shadow-indigo-500/50 transform hover:scale-105 whitespace-nowrap"
          >
            <span className="hidden sm:inline">Upload Resume</span>
            <span className="sm:hidden">Upload</span>
          </Link>
        </motion.div>
      </div>
    </div>
  );
};

export default Navbar;

