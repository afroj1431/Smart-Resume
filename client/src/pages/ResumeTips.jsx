import { motion } from 'framer-motion';

const ResumeTips = () => {
  const tips = [
    {
      category: 'ATS Optimization',
      icon: '🎯',
      items: [
        'Use standard section headings (Experience, Education, Skills)',
        'Include relevant keywords from job descriptions',
        'Avoid graphics, tables, or complex formatting',
        'Save as PDF to preserve formatting'
      ]
    },
    {
      category: 'Skills Section',
      icon: '💡',
      items: [
        'List both hard and soft skills',
        'Match skills to job requirements',
        'Use industry-standard terminology',
        'Quantify your expertise when possible'
      ]
    },
    {
      category: 'Experience',
      icon: '📈',
      items: [
        'Use action verbs (Led, Developed, Implemented)',
        'Quantify achievements with numbers',
        'Focus on results and impact',
        'Keep descriptions concise and relevant'
      ]
    },
    {
      category: 'Education',
      icon: '🎓',
      items: [
        'Include degree, major, and institution',
        'Add GPA if above 3.5',
        'List relevant coursework or certifications',
        'Include graduation year'
      ]
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
          <h1 className="text-5xl font-bold text-white mb-4">Resume Tips</h1>
          <p className="text-xl text-white/80">Expert advice to improve your resume</p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8">
          {tips.map((tip, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -5 }}
              className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20 hover:border-white/40 transition-all shadow-2xl"
            >
              <div className="flex items-center space-x-4 mb-6">
                <div className="text-4xl">{tip.icon}</div>
                <h2 className="text-2xl font-bold text-white">{tip.category}</h2>
              </div>
              <ul className="space-y-3">
                {tip.items.map((item, i) => (
                  <li key={i} className="flex items-start space-x-3">
                    <span className="text-purple-400 mt-1">✓</span>
                    <span className="text-white/80">{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* Quick Tips Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-12 bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-xl rounded-2xl p-8 border border-white/20"
        >
          <h2 className="text-3xl font-bold text-white mb-6">Quick Wins</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              'Keep resume to 1-2 pages',
              'Use a professional email address',
              'Include a LinkedIn profile link',
              'Proofread for typos and grammar',
              'Customize for each job application',
              'Use consistent formatting'
            ].map((tip, i) => (
              <div key={i} className="flex items-center space-x-3">
                <span className="text-green-400">✨</span>
                <span className="text-white/80">{tip}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ResumeTips;









