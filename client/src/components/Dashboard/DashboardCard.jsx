import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const DashboardCard = ({ title, value, icon, link, linkText, iconBg = 'bg-gradient-to-br from-purple-500 to-pink-500' }) => {
  return (
    <motion.div
      whileHover={{ y: -5, scale: 1.02 }}
      className="bg-white/10 backdrop-blur-xl p-6 rounded-2xl shadow-2xl border border-white/20 hover:border-white/40 transition-all duration-300 group"
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-white/70 mb-1">{title}</p>
          <p className="text-4xl font-bold text-white mt-2">{value}</p>
          {link && (
            <Link
              to={link}
              className="mt-4 inline-flex items-center text-sm font-semibold text-white/80 hover:text-white transition-colors group-hover:translate-x-1 duration-200"
            >
              {linkText}
              <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          )}
        </div>
        <motion.div
          whileHover={{ rotate: 10, scale: 1.1 }}
          className={`${iconBg} p-4 rounded-xl shadow-lg`}
        >
          <span className="text-3xl">{icon}</span>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default DashboardCard;

