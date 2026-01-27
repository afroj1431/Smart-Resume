import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const Landing = () => {
  return (
    <div className="min-h-screen relative overflow-hidden" style={{ 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #4facfe 75%, #00f2fe 100%)',
      backgroundSize: '400% 400%',
      animation: 'gradient 15s ease infinite'
    }}>
      {/* Animated Gradient Background */}
      <style>{`
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>

      {/* Floating Blob Animations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-20 left-10 w-72 h-72 bg-purple-500/30 rounded-full blur-3xl"
          animate={{
            x: [0, 100, 0],
            y: [0, 50, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute bottom-20 right-10 w-96 h-96 bg-pink-500/30 rounded-full blur-3xl"
          animate={{
            x: [0, -100, 0],
            y: [0, -50, 0],
            scale: [1, 1.3, 1],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl"
          animate={{
            x: [0, 150, 0],
            y: [0, -100, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 30,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>

      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-white/10 border-b border-white/20">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white">TalentScan AI</h1>
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/upload" className="text-white/80 hover:text-white transition-colors text-sm font-medium">
              Analyze Resume
            </Link>
            <Link to="/matches" className="text-white/80 hover:text-white transition-colors text-sm font-medium">
              Job Matches
            </Link>
            <Link to="/tips" className="text-white/80 hover:text-white transition-colors text-sm font-medium">
              Tips
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            <Link
              to="/upload"
              className="px-6 py-2 bg-white text-purple-600 rounded-lg hover:bg-white/90 transition-all font-medium text-sm shadow-lg"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pb-32 min-h-screen flex items-center">
        <div className="max-w-7xl mx-auto px-6 w-full">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center lg:text-left z-10"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="inline-block mb-6"
              >
                <span className="px-4 py-2 bg-white/20 backdrop-blur-md rounded-full text-white text-sm font-medium border border-white/30">
                  ✨ Powered by AI
                </span>
              </motion.div>
              
              <h1 className="text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
                Know How Strong{' '}
                <span className="bg-gradient-to-r from-yellow-200 via-pink-200 to-purple-200 bg-clip-text text-transparent">
                  Your Resume
                </span>{' '}
                Really Is
              </h1>
              
              <p className="text-xl lg:text-2xl text-white/90 mb-10 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                Get instant ATS score, skill gap analysis, and personalized job matches. 
                Make your resume stand out with AI-powered insights.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link
                  to="/upload"
                  className="group relative px-8 py-4 bg-white text-purple-600 rounded-xl hover:bg-white/95 transition-all font-semibold text-lg shadow-2xl hover:shadow-3xl transform hover:-translate-y-1 overflow-hidden"
                >
                  <span className="relative z-10">Upload Your Resume</span>
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 opacity-0 group-hover:opacity-100 transition-opacity"
                    initial={false}
                  />
                </Link>
                <Link
                  to="/upload"
                  className="px-8 py-4 bg-white/10 backdrop-blur-md text-white rounded-xl hover:bg-white/20 transition-all font-semibold text-lg border-2 border-white/30"
                >
                  Get Started
                </Link>
              </div>
            </motion.div>

            {/* Right - 3D Floating Elements */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="relative h-[600px] lg:h-[700px]"
            >
              {/* AI Orb / Robot */}
              <motion.div
                animate={{
                  y: [0, -20, 0],
                  rotate: [0, 5, -5, 0],
                }}
                transition={{
                  duration: 6,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="absolute top-20 right-10 z-20"
                style={{
                  transformStyle: 'preserve-3d',
                  perspective: '1000px'
                }}
              >
                <div className="w-32 h-32 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full shadow-2xl shadow-purple-500/50 flex items-center justify-center border-4 border-white/30">
                  <span className="text-5xl">🤖</span>
                </div>
                <div className="absolute inset-0 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full blur-xl opacity-50 animate-pulse"></div>
              </motion.div>

              {/* Floating Resume Card 1 */}
              <motion.div
                animate={{
                  y: [0, -30, 0],
                  rotateY: [0, 5, 0],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 0.5
                }}
                className="absolute top-40 left-0 z-10"
                style={{
                  transformStyle: 'preserve-3d',
                  perspective: '1000px'
                }}
              >
                <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 shadow-2xl border border-white/20 w-64 transform hover:scale-105 transition-transform">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-white font-semibold">Resume Score</h3>
                    <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-lg">87</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm text-white/80">
                      <span>Skills</span>
                      <span className="text-green-400">92%</span>
                    </div>
                    <div className="flex justify-between text-sm text-white/80">
                      <span>Experience</span>
                      <span className="text-blue-400">85%</span>
                    </div>
                    <div className="flex justify-between text-sm text-white/80">
                      <span>Education</span>
                      <span className="text-purple-400">78%</span>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Floating Resume Card 2 */}
              <motion.div
                animate={{
                  y: [0, -25, 0],
                  rotateY: [0, -5, 0],
                }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 1
                }}
                className="absolute bottom-40 right-0 z-10"
                style={{
                  transformStyle: 'preserve-3d',
                  perspective: '1000px'
                }}
              >
                <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 shadow-2xl border border-white/20 w-64 transform hover:scale-105 transition-transform">
                  <h3 className="text-white font-semibold mb-4">Top Skills</h3>
                  <div className="space-y-2">
                    {['React', 'Node.js', 'TypeScript', 'AWS'].map((skill, i) => (
                      <div key={i} className="flex items-center space-x-2">
                        <div className="flex-1 h-2 bg-white/20 rounded-full overflow-hidden">
                          <motion.div
                            className="h-full bg-gradient-to-r from-purple-400 to-pink-400 rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${75 + i * 5}%` }}
                            transition={{ duration: 1, delay: 1 + i * 0.2 }}
                          />
                        </div>
                        <span className="text-white/80 text-xs w-20 text-right">{skill}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>

              {/* ATS Score Gauge */}
              <motion.div
                animate={{
                  rotate: [0, 360],
                }}
                transition={{
                  duration: 20,
                  repeat: Infinity,
                  ease: "linear"
                }}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-0"
              >
                <div className="w-64 h-64 border-8 border-white/20 rounded-full flex items-center justify-center bg-white/5 backdrop-blur-md">
                  <div className="w-48 h-48 border-8 border-purple-400/50 rounded-full flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-5xl font-bold text-white mb-2">92</div>
                      <div className="text-white/80 text-sm">ATS Score</div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative py-20 lg:py-32 z-10">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl lg:text-5xl font-bold text-white mb-4">
              Everything You Need to Land Your Dream Job
            </h2>
            <p className="text-lg text-white/80 max-w-2xl mx-auto">
              AI-powered tools to optimize your resume and find the perfect match
            </p>
          </motion.div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: 'ATS Score',
                description: 'Get instant feedback on how ATS systems will parse your resume. Know your score before you apply.',
                icon: '🎯',
                gradient: 'from-purple-400 to-pink-400'
              },
              {
                title: 'Skill Gap Analysis',
                description: 'Discover missing skills for your target roles. Get personalized recommendations to improve.',
                icon: '📊',
                gradient: 'from-blue-400 to-cyan-400'
              },
              {
                title: 'Job Matching',
                description: 'Find jobs that match your resume. Get ranked recommendations based on your skills and experience.',
                icon: '🔍',
                gradient: 'from-green-400 to-emerald-400'
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -10, scale: 1.02 }}
                className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20 hover:border-white/40 transition-all shadow-2xl"
              >
                <div className={`w-16 h-16 bg-gradient-to-br ${feature.gradient} rounded-xl flex items-center justify-center text-3xl mb-6 shadow-lg`}>
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-semibold text-white mb-4">{feature.title}</h3>
                <p className="text-white/80 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="relative py-20 lg:py-32 z-10">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl lg:text-5xl font-bold text-white mb-4">
              How It Works
            </h2>
            <p className="text-lg text-white/80 max-w-2xl mx-auto">
              Get your resume analyzed in three simple steps
            </p>
          </motion.div>
          
          <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
            {[
              {
                step: '1',
                title: 'Upload Your Resume',
                description: 'Simply drag and drop your PDF resume or upload it directly. Our AI will parse it instantly.'
              },
              {
                step: '2',
                title: 'Get AI Analysis',
                description: 'Receive your ATS score, skill breakdown, missing skills, and personalized improvement tips.'
              },
              {
                step: '3',
                title: 'Find Job Matches',
                description: 'Discover jobs that match your profile. Apply with confidence knowing your resume is optimized.'
              }
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="text-center"
              >
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full mb-6 shadow-xl"
                >
                  <span className="text-3xl font-bold text-white">{item.step}</span>
                </motion.div>
                <h3 className="text-2xl font-semibold text-white mb-4">{item.title}</h3>
                <p className="text-white/80 leading-relaxed">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="relative py-20 lg:py-32 z-10">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl lg:text-6xl font-bold text-white mb-6">
              Ready to Optimize Your Resume?
            </h2>
            <p className="text-xl text-white/90 mb-10 max-w-2xl mx-auto leading-relaxed">
              Join thousands of job seekers who improved their resumes with AI-powered insights
            </p>
            <Link
              to="/upload"
              className="inline-block px-10 py-5 bg-white text-purple-600 rounded-xl hover:bg-white/95 transition-all font-semibold text-xl shadow-2xl hover:shadow-3xl transform hover:-translate-y-1"
            >
              Upload Your Resume Now
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative bg-white/5 backdrop-blur-xl border-t border-white/20 py-12 z-10">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="mb-6 md:mb-0">
              <h3 className="text-2xl font-bold text-white">TalentScan AI</h3>
              <p className="text-sm text-white/60 mt-2">AI Resume Analyzer for Job Seekers</p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-8">
              <Link to="/privacy" className="text-white/60 hover:text-white transition-colors text-sm">
                Privacy
              </Link>
              <Link to="/terms" className="text-white/60 hover:text-white transition-colors text-sm">
                Terms
              </Link>
              <Link to="/contact" className="text-white/60 hover:text-white transition-colors text-sm">
                Contact
              </Link>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-white/10 text-center">
            <p className="text-sm text-white/50">
              © {new Date().getFullYear()} TalentScan AI. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
