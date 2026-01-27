import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { resumesAPI, scoreAPI } from '../services/api';
import { Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';

ChartJS.register(ArcElement, Tooltip, Legend);
ChartJS.register(ChartDataLabels);

const ANALYSIS_STEPS = [
  { id: 1, label: 'Parsing resume', icon: '📄' },
  { id: 2, label: 'Detecting skills', icon: '🔍' },
  { id: 3, label: 'Analyzing experience', icon: '💼' },
  { id: 4, label: 'Checking ATS compatibility', icon: '✅' },
  { id: 5, label: 'Generating insights', icon: '✨' }
];

const ResumeAnalyzer = () => {
  const { id } = useParams();
  const [resume, setResume] = useState(null);
  const [score, setScore] = useState(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let mounted = true;
    
    const fetchData = async () => {
      try {
        setAnalyzing(true);
        setProgress(0);
        setCurrentStep(0);

        const [resumeRes, scoreRes] = await Promise.all([
          resumesAPI.getById(id),
          scoreAPI.get(id).catch(() => null)
        ]);
        
        if (!mounted) return;
        
        const resumeData = resumeRes.data.data.resume;
        setResume(resumeData);
        
        // Debug logging
        console.log('Resume data received:', {
          resumeId: resumeData._id,
          hasJobDescription: !!resumeData.jobDescription,
          jobDescriptionType: typeof resumeData.jobDescription,
          jobDescriptionLength: resumeData.jobDescription?.length || 0,
          jobDescriptionPreview: resumeData.jobDescription?.substring(0, 50) || 'NULL',
          allResumeKeys: Object.keys(resumeData)
        });
        
        // Validate job description with minimum length threshold
        const MIN_JOB_DESCRIPTION_LENGTH = 30;
        const jobDesc = resumeData.jobDescription;
        const jobDescTrimmed = typeof jobDesc === 'string' ? jobDesc.trim() : '';
        
        console.log('Validating job description:', {
          exists: !!jobDesc,
          type: typeof jobDesc,
          length: jobDesc?.length || 0,
          trimmedLength: jobDescTrimmed.length,
          minRequired: MIN_JOB_DESCRIPTION_LENGTH,
          isValid: jobDescTrimmed.length >= MIN_JOB_DESCRIPTION_LENGTH
        });
        
        if (!jobDesc || jobDescTrimmed.length < MIN_JOB_DESCRIPTION_LENGTH) {
          console.warn('Job description validation failed:', {
            value: jobDesc,
            type: typeof jobDesc,
            length: jobDesc?.length || 0,
            trimmedLength: jobDescTrimmed.length,
            minRequired: MIN_JOB_DESCRIPTION_LENGTH
          });
          if (mounted) {
            setLoading(false);
            setAnalyzing(false);
          }
          return; // Will show error message in UI
        }
        
        console.log('✅ Job description validated successfully:', {
          length: jobDescTrimmed.length,
          preview: jobDescTrimmed.substring(0, 50)
        });
        
        if (scoreRes) {
          setScore(scoreRes.data.data.score);
        } else {
          try {
            const response = await scoreAPI.calculate(id);
            if (mounted) {
              setScore(response.data.data.score);
            }
          } catch (error) {
            console.error('Failed to calculate score:', error);
            if (mounted) {
              setLoading(false);
              setAnalyzing(false);
            }
          }
        }

        // Simulate analysis time
        setTimeout(() => {
          if (mounted) {
            setAnalyzing(false);
            setLoading(false);
          }
        }, 4000);
      } catch (error) {
        console.error('Failed to fetch data:', error);
        if (mounted) {
          setLoading(false);
          setAnalyzing(false);
        }
      }
    };

    fetchData();

    return () => {
      mounted = false;
    };
  }, [id]);

  useEffect(() => {
    if (!analyzing) {
      return;
    }

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 2;
      });
    }, 80);

    const stepInterval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev >= ANALYSIS_STEPS.length - 1) {
          clearInterval(stepInterval);
          return prev;
        }
        return prev + 1;
      });
    }, 800);

    return () => {
      clearInterval(progressInterval);
      clearInterval(stepInterval);
    };
  }, [analyzing]);

  // Generate AI insights based on resume data
  const generateInsights = () => {
    if (!resume || !score) return null;

    const skills = resume.extractedSkills || [];
    const experience = resume.extractedExperience || '';
    const education = resume.extractedEducation || [];
    const text = resume.parsedText || '';

    // Strengths
    const strengths = [];
    if (skills.length >= 10) strengths.push('Strong skill diversity detected');
    if (experience && experience.length > 50) strengths.push('Detailed experience descriptions');
    if (education.length > 0) strengths.push('Education section present');
    if (text.length > 1000) strengths.push('Comprehensive resume content');
    if (score.finalScore >= 70) strengths.push('Good ATS compatibility score');
    if (skills.length >= 5) strengths.push('Relevant technical skills identified');

    // Issues
    const issues = [];
    if (skills.length < 5) issues.push('Limited skills mentioned - add more relevant keywords');
    if (!experience || experience.length < 30) issues.push('Experience section needs more detail');
    if (education.length === 0) issues.push('Education section missing');
    if (text.length < 500) issues.push('Resume too short - expand on achievements');
    if (score.finalScore < 60) issues.push('Low ATS score - optimize keywords and formatting');
    if (!text.toLowerCase().includes('years') && !text.toLowerCase().includes('experience')) {
      issues.push('Missing quantifiable metrics and impact statements');
    }

    // Structure Analysis
    const structure = [
      {
        section: 'Contact Information',
        status: text.match(/@|email|phone|linkedin/i) ? '✅ Complete' : '❌ Missing',
        feedback: text.match(/@|email|phone|linkedin/i) 
          ? 'Contact details found' 
          : 'Add email, phone, and LinkedIn'
      },
      {
        section: 'Skills',
        status: skills.length >= 5 ? '✅ Strong' : skills.length > 0 ? '⚠️ Weak' : '❌ Missing',
        feedback: skills.length >= 5 
          ? `${skills.length} skills detected` 
          : `Only ${skills.length} skills - add more relevant keywords`
      },
      {
        section: 'Experience',
        status: experience && experience.length > 50 ? '✅ Good' : '⚠️ Needs Work',
        feedback: experience && experience.length > 50
          ? 'Experience section detailed'
          : 'Add more detail with metrics and achievements'
      },
      {
        section: 'Education',
        status: education.length > 0 ? '✅ Present' : '❌ Missing',
        feedback: education.length > 0
          ? 'Education section found'
          : 'Add education credentials'
      },
      {
        section: 'Projects',
        status: text.match(/project|built|developed|created/i) ? '✅ Present' : '⚠️ Weak',
        feedback: text.match(/project|built|developed|created/i)
          ? 'Projects mentioned'
          : 'Add technical projects with impact'
      },
      {
        section: 'Metrics & Numbers',
        status: text.match(/\d+%|\d+\+|\$\d+|\d+\s*(years|months|users|revenue)/i) ? '✅ Good' : '❌ Missing',
        feedback: text.match(/\d+%|\d+\+|\$\d+|\d+\s*(years|months|users|revenue)/i)
          ? 'Quantifiable metrics found'
          : 'Add numbers, percentages, and impact metrics'
      }
    ];

    // ATS Optimization
    const atsOptimization = {
      keywordMatch: Math.min(100, (skills.length / 10) * 100),
      sectionCompleteness: Math.round(
        (structure.filter(s => s.status.includes('✅')).length / structure.length) * 100
      ),
      formattingScore: score.finalScore >= 70 ? 85 : score.finalScore >= 50 ? 65 : 45
    };

    // AI Suggestions
    const suggestions = [
      {
        category: 'Keywords',
        items: [
          'Add industry-specific keywords from job descriptions',
          'Include both technical and soft skills',
          'Use action verbs: "Led", "Developed", "Implemented", "Optimized"'
        ]
      },
      {
        category: 'Formatting',
        items: [
          'Use consistent date formats (MM/YYYY)',
          'Keep bullet points concise (1-2 lines)',
          'Use standard section headers: Experience, Education, Skills',
          'Ensure proper spacing and readability'
        ]
      },
      {
        category: 'Content',
        items: [
          'Add quantifiable achievements (e.g., "Increased revenue by 30%")',
          'Include specific technologies and tools used',
          'Highlight leadership and collaboration examples',
          'Add relevant certifications if applicable'
        ]
      },
      {
        category: 'Projects',
        items: [
          'Add 2-3 technical projects with clear descriptions',
          'Include GitHub links or portfolio URLs',
          'Describe your role and impact in each project',
          'Use metrics to show project success'
        ]
      }
    ];

    return { strengths, issues, structure, atsOptimization, suggestions };
  };

  const insights = generateInsights();

  // Analysis Screen
  if (analyzing || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6" style={{
        background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 20%, #312E81 40%, #1E3A8A 60%, #2563EB 80%, #1E40AF 100%)',
        backgroundSize: '400% 400%',
        animation: 'gradient 15s ease infinite'
      }}>
        <style>{`
          @keyframes gradient {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
        `}</style>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-2xl bg-white/10 backdrop-blur-xl rounded-3xl p-12 border border-white/20 shadow-2xl"
        >
          <div className="text-center mb-8">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="w-20 h-20 border-4 border-indigo-500/30 border-t-indigo-400 rounded-full mx-auto mb-6"
            />
            <h2 className="text-3xl font-bold text-white mb-2">AI Analyzing Your Resume</h2>
            <p className="text-white/80">Please wait while we scan your document...</p>
          </div>

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between text-sm text-white/60 mb-2">
              <span>Progress</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3 }}
                className="h-full bg-gradient-to-r from-indigo-500 to-primary-600 rounded-full"
              />
            </div>
          </div>

          {/* Analysis Steps */}
          <div className="space-y-4">
            {ANALYSIS_STEPS.map((step, index) => (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{
                  opacity: index <= currentStep ? 1 : 0.3,
                  x: 0
                }}
                transition={{ delay: index * 0.1 }}
                className={`flex items-center space-x-4 p-4 rounded-lg ${
                  index <= currentStep
                    ? 'bg-white/10 border border-white/20'
                    : 'bg-white/5'
                }`}
              >
                <motion.div
                  animate={index === currentStep ? { scale: [1, 1.2, 1] } : {}}
                  transition={{ duration: 0.5, repeat: index === currentStep ? Infinity : 0 }}
                  className="text-2xl"
                >
                  {step.icon}
                </motion.div>
                <div className="flex-1">
                  <p className={`font-medium ${
                    index <= currentStep ? 'text-white' : 'text-white/40'
                  }`}>
                    {step.label}
                  </p>
                  {index === currentStep && (
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: '100%' }}
                      transition={{ duration: 0.8 }}
                      className="h-1 bg-gradient-to-r from-indigo-500 to-primary-600 rounded-full mt-2"
                    />
                  )}
                </div>
                {index < currentStep && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="text-indigo-400 text-xl"
                  >
                    ✓
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    );
  }

  const scoreData = score ? {
    labels: ['Skills', 'Experience', 'Education'],
    datasets: [{
      data: [score.skillScore, score.experienceScore, score.educationScore],
      backgroundColor: [
        'rgba(255, 255, 255, 0.9)',      // White for Skills
        'rgba(34, 197, 94, 0.9)',        // Green for Experience
        'rgba(56, 189, 248, 0.9)'        // Sky Blue for Education
      ],
      borderColor: [
        'rgba(255, 255, 255, 1)',        // White border
        'rgba(34, 197, 94, 1)',          // Green border
        'rgba(56, 189, 248, 1)'          // Sky Blue border
      ],
      borderWidth: 2
    }]
  } : null;

  return (
    <div className="min-h-screen py-12" style={{
      background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 20%, #312E81 40%, #1E3A8A 60%, #2563EB 80%, #1E40AF 100%)',
      backgroundSize: '400% 400%',
      animation: 'gradient 15s ease infinite'
    }}>
      <style>{`
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-bold text-white mb-4">AI Resume Analysis</h1>
          <p className="text-xl text-white/80">Job-Specific ATS Compatibility Analysis</p>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-4 inline-block px-4 py-2 bg-indigo-500/30 border border-indigo-400/50 rounded-lg"
          >
            <span className="text-indigo-300 text-sm">🎯 Analyzing resume against job description</span>
          </motion.div>
        </motion.div>

        {/* Error: No Job Description - Only show if jobDescription is missing or too short */}
        {resume && (() => {
          const MIN_LENGTH = 30;
          const jobDesc = resume.jobDescription;
          const jobDescTrimmed = typeof jobDesc === 'string' ? jobDesc.trim() : '';
          const isValid = jobDesc && jobDescTrimmed.length >= MIN_LENGTH;
          
          console.log('Checking job description for error display:', {
            exists: !!jobDesc,
            length: jobDescTrimmed.length,
            minRequired: MIN_LENGTH,
            isValid: isValid,
            shouldShowError: !isValid
          });
          
          return !isValid;
        })() && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-500/20 backdrop-blur-xl rounded-3xl p-8 border border-red-500/50 shadow-2xl text-center"
          >
            <div className="text-6xl mb-4">⚠️</div>
            <h2 className="text-3xl font-bold text-white mb-4">Job Description Required</h2>
            <p className="text-white/80 text-lg mb-6">
              ATS analysis requires a job description to evaluate resume compatibility.
            </p>
            <p className="text-white/60 mb-6">
              Please upload your resume again with a job description to get ATS compatibility analysis.
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => window.location.href = '/upload'}
              className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-primary-600 text-white rounded-xl hover:from-indigo-700 hover:to-primary-700 transition-all font-semibold shadow-lg"
            >
              Upload Resume with Job Description
            </motion.button>
          </motion.div>
        )}

        {score && resume && (() => {
          const MIN_LENGTH = 30;
          const jobDesc = resume.jobDescription;
          const jobDescTrimmed = typeof jobDesc === 'string' ? jobDesc.trim() : '';
          return jobDesc && jobDescTrimmed.length >= MIN_LENGTH;
        })() && insights && (
          <>
            {/* ATS Score Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-2xl mb-8"
            >
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div>
                  <h2 className="text-3xl font-bold text-white mb-6">Your ATS Score</h2>
                  <div className="relative inline-block">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.8, delay: 0.3 }}
                      className={`w-48 h-48 rounded-full flex items-center justify-center shadow-2xl ${
                        score.finalScore >= 80
                          ? 'bg-gradient-to-br from-indigo-500 to-primary-600'
                          : score.finalScore >= 60
                          ? 'bg-gradient-to-br from-indigo-600 to-primary-500'
                          : 'bg-gradient-to-br from-indigo-700 to-navy-700'
                      }`}
                    >
                      <div className="text-center">
                        <div className="text-6xl font-bold text-white">{score.finalScore}</div>
                        <div className="text-white/80 text-sm">out of 100</div>
                      </div>
                    </motion.div>
                  </div>
                  <p className="text-white/60 mt-4 text-sm">
                    {score.finalScore >= 80
                      ? 'Excellent! Your resume is ATS-optimized.'
                      : score.finalScore >= 60
                      ? 'Good score. Some improvements needed.'
                      : 'Needs work. Focus on keywords and formatting.'}
                  </p>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white mb-4">Score Breakdown</h3>
                  {scoreData && (
                    <div className="h-64">
                      <Doughnut 
                        data={scoreData} 
                        plugins={[ChartDataLabels]}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: {
                            legend: { 
                              position: 'bottom', 
                              labels: { 
                                color: 'white',
                                padding: 15,
                                font: { size: 12 }
                              } 
                            },
                            tooltip: {
                              callbacks: {
                                label: function(context) {
                                  const label = context.label || '';
                                  const value = context.parsed || 0;
                                  const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                  const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
                                  return `${label}: ${value} (${percentage}%)`;
                                }
                              }
                            },
                            datalabels: {
                              color: 'white',
                              font: {
                                size: 14,
                                weight: 'bold'
                              },
                              formatter: (value, context) => {
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
                                return `${value}\n(${percentage}%)`;
                              },
                              textAlign: 'center',
                              textStrokeColor: 'rgba(0, 0, 0, 0.5)',
                              textStrokeWidth: 2
                            }
                          }
                        }} 
                      />
                    </div>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Job Description Info */}
            {resume?.jobDescription && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-indigo-500/20 backdrop-blur-xl rounded-3xl p-6 border border-indigo-400/30 shadow-2xl mb-8"
              >
                <div className="flex items-start space-x-4">
                  <div className="text-3xl">📋</div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white mb-2">Job Description Analyzed</h3>
                    <p className="text-white/70 text-sm mb-3">
                      Your resume is being compared against the job requirements you provided.
                    </p>
                    {score?.missingSkills && score.missingSkills.length > 0 && (
                      <div className="mt-4">
                        <p className="text-white/80 text-sm font-semibold mb-2">Missing Skills:</p>
                        <div className="flex flex-wrap gap-2">
                          {score.missingSkills.slice(0, 10).map((skill, i) => (
                            <span key={i} className="px-3 py-1 bg-red-500/20 border border-red-500/30 rounded-lg text-red-300 text-xs">
                              {skill}
                            </span>
                          ))}
                          {score.missingSkills.length > 10 && (
                            <span className="px-3 py-1 bg-white/10 border border-white/20 rounded-lg text-white/60 text-xs">
                              +{score.missingSkills.length - 10} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Strengths & Issues */}
            <div className="grid md:grid-cols-2 gap-8 mb-8">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-2xl"
              >
                <div className="flex items-center space-x-3 mb-6">
                  <span className="text-3xl">✨</span>
                  <h3 className="text-2xl font-bold text-white">Strengths</h3>
                </div>
                <div className="space-y-3">
                  {insights.strengths.map((strength, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="flex items-start space-x-3 p-3 bg-indigo-500/20 rounded-lg border border-indigo-500/30"
                    >
                      <span className="text-indigo-400 mt-1">✓</span>
                      <p className="text-white">{strength}</p>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-2xl"
              >
                <div className="flex items-center space-x-3 mb-6">
                  <span className="text-3xl">⚠️</span>
                  <h3 className="text-2xl font-bold text-white">Issues to Fix</h3>
                </div>
                <div className="space-y-3">
                  {insights.issues.map((issue, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="flex items-start space-x-3 p-3 bg-red-500/20 rounded-lg border border-red-500/30"
                    >
                      <span className="text-red-400 mt-1">✗</span>
                      <p className="text-white">{issue}</p>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* ATS Optimization */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-2xl mb-8"
            >
              <h3 className="text-2xl font-bold text-white mb-6">ATS Optimization</h3>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                  <p className="text-white/60 mb-2">Keyword Match</p>
                  <div className="flex items-center space-x-3">
                    <div className="flex-1 h-3 bg-white/10 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${insights.atsOptimization.keywordMatch}%` }}
                        transition={{ delay: 0.5 }}
                        className="h-full bg-gradient-to-r from-indigo-500 to-primary-600 rounded-full"
                      />
                    </div>
                    <span className="text-white font-bold">{Math.round(insights.atsOptimization.keywordMatch)}%</span>
                  </div>
                </div>
                <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                  <p className="text-white/60 mb-2">Section Completeness</p>
                  <div className="flex items-center space-x-3">
                    <div className="flex-1 h-3 bg-white/10 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${insights.atsOptimization.sectionCompleteness}%` }}
                        transition={{ delay: 0.7 }}
                        className="h-full bg-gradient-to-r from-indigo-500 to-primary-600 rounded-full"
                      />
                    </div>
                    <span className="text-white font-bold">{insights.atsOptimization.sectionCompleteness}%</span>
                  </div>
                </div>
                <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                  <p className="text-white/60 mb-2">Formatting Score</p>
                  <div className="flex items-center space-x-3">
                    <div className="flex-1 h-3 bg-white/10 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${insights.atsOptimization.formattingScore}%` }}
                        transition={{ delay: 0.9 }}
                        className="h-full bg-gradient-to-r from-indigo-500 to-primary-600 rounded-full"
                      />
                    </div>
                    <span className="text-white font-bold">{insights.atsOptimization.formattingScore}%</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Structure Analysis */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-2xl mb-8"
            >
              <h3 className="text-2xl font-bold text-white mb-6">Structure Analysis</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/20">
                      <th className="text-left py-3 px-4 text-white font-semibold">Section</th>
                      <th className="text-left py-3 px-4 text-white font-semibold">Status</th>
                      <th className="text-left py-3 px-4 text-white font-semibold">Feedback</th>
                    </tr>
                  </thead>
                  <tbody>
                    {insights.structure.map((item, i) => (
                      <motion.tr
                        key={i}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="border-b border-white/10 hover:bg-white/5"
                      >
                        <td className="py-4 px-4 text-white font-medium">{item.section}</td>
                        <td className="py-4 px-4">
                          <span className={`px-3 py-1 rounded-full text-sm ${
                            item.status.includes('✅')
                              ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                              : item.status.includes('⚠️')
                              ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                              : 'bg-red-500/20 text-red-400 border border-red-500/30'
                          }`}>
                            {item.status}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-white/80">{item.feedback}</td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>

            {/* AI Improvement Suggestions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-2xl mb-8"
            >
              <div className="flex items-center space-x-3 mb-6">
                <span className="text-3xl">🤖</span>
                <h3 className="text-2xl font-bold text-white">AI Improvement Suggestions</h3>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                {insights.suggestions.map((category, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.1 }}
                    className="bg-white/5 rounded-xl p-6 border border-white/10"
                  >
                    <h4 className="text-lg font-semibold text-white mb-4">{category.category}</h4>
                    <ul className="space-y-2">
                      {category.items.map((item, j) => (
                        <li key={j} className="flex items-start space-x-2 text-white/80">
                          <span className="text-indigo-400 mt-1">•</span>
                          <span className="text-sm">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Skills Display */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-2xl"
            >
              <h3 className="text-2xl font-bold text-white mb-6">Detected Skills</h3>
              {resume?.extractedSkills && resume.extractedSkills.length > 0 ? (
                <div className="flex flex-wrap gap-3">
                  {resume.extractedSkills.map((skill, i) => (
                    <motion.span
                      key={i}
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.05 }}
                      className="px-4 py-2 bg-gradient-to-r from-indigo-500/30 to-primary-500/30 rounded-lg text-white text-sm border border-white/20"
                    >
                      {skill}
                    </motion.span>
                  ))}
                </div>
              ) : (
                <p className="text-white/60">No skills detected</p>
              )}
            </motion.div>
          </>
        )}
      </div>
    </div>
  );
};

export default ResumeAnalyzer;
