import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const Navbar = () => {
  return (
    <div className="bg-white/10 backdrop-blur-2xl shadow-xl border-b border-white/20 px-6 py-4">
      <div className="flex items-center justify-between">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center space-x-4"
        >
          <h2 className="text-lg font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            TalentScan AI
          </h2>
          <span className="text-sm text-white/70 hidden md:block">Your AI Career Assistant</span>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center space-x-4"
        >
          <Link
            to="/upload"
            className="px-5 py-2.5 text-sm bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all font-semibold shadow-lg hover:shadow-purple-500/50 transform hover:scale-105"
          >
            Upload Resume
          </Link>
        </motion.div>
      </div>
    </div>
  );
};

export default Navbar;

