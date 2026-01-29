import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { resumesAPI } from '../services/api';

const UploadResume = () => {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [jobDescription, setJobDescription] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (selectedFile) => {
    if (selectedFile.type !== 'application/pdf') {
      setError('Please upload a PDF file');
      return;
    }
    if (selectedFile.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB');
      return;
    }
    setFile(selectedFile);
    setError('');
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a resume file');
      return;
    }

    // Validate job description with minimum length threshold
    const MIN_JOB_DESCRIPTION_LENGTH = 30;
    const trimmedJobDesc = jobDescription?.trim() || '';
    
    if (!jobDescription || trimmedJobDesc.length < MIN_JOB_DESCRIPTION_LENGTH) {
      setError(`Job Description is required for ATS analysis. Please provide at least ${MIN_JOB_DESCRIPTION_LENGTH} characters of job description from the job posting.`);
      return;
    }
    
    console.log('✅ Frontend validation passed:', {
      jobDescriptionLength: trimmedJobDesc.length,
      minRequired: MIN_JOB_DESCRIPTION_LENGTH
    });

    setUploading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('resume', file);
      // Optional: Add candidate name from file name
      const candidateName = file.name.replace('.pdf', '').replace(/_/g, ' ');
      formData.append('candidateName', candidateName);
      // Job description is REQUIRED
      const trimmedJobDesc = jobDescription.trim();
      formData.append('jobDescription', trimmedJobDesc);
      
      // Debug logging
      console.log('Uploading FormData:', {
        hasFile: !!file,
        fileName: file.name,
        hasJobDescription: !!trimmedJobDesc,
        jobDescriptionLength: trimmedJobDesc.length,
        jobDescriptionPreview: trimmedJobDesc.substring(0, 100)
      });

      const response = await resumesAPI.upload(formData);
      const resumeId = response.data.data.resume._id;
      
      // Automatically calculate score after upload
      try {
        const scoreAPI = (await import('../services/api')).scoreAPI;
        await scoreAPI.calculate(resumeId);
      } catch (scoreError) {
        console.error('Score calculation error:', scoreError);
        // Continue even if score calculation fails
      }
      
      navigate(`/analyzer/${resumeId}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen" style={{
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
      <div className="py-8 sm:py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8 sm:mb-12"
        >
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-2 sm:mb-4">
            Upload Your Resume
          </h1>
          <p className="text-sm sm:text-base md:text-xl text-white/80">
            Get instant AI-powered analysis of your resume
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white/10 backdrop-blur-xl rounded-xl sm:rounded-3xl p-4 sm:p-8 md:p-12 border border-white/20 shadow-2xl"
        >
          {/* Drag and Drop Area */}
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`relative border-3 border-dashed rounded-xl sm:rounded-2xl p-6 sm:p-12 md:p-16 text-center transition-all ${
              dragActive
                ? 'border-indigo-500 bg-indigo-600/30 scale-105 shadow-indigo-500/30'
                : file
                ? 'border-indigo-400 bg-indigo-500/20'
                : 'border-white/30 bg-white/5 hover:bg-white/10 hover:border-indigo-500/50'
            }`}
          >
            {file ? (
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                className="space-y-4 sm:space-y-6"
              >
                <div className="text-5xl sm:text-6xl mb-2 sm:mb-4">✅</div>
                <h3 className="text-lg sm:text-2xl font-semibold text-white mb-1 sm:mb-2 break-words">{file.name}</h3>
                <p className="text-xs sm:text-base text-white/60">{(file.size / 1024).toFixed(2)} KB</p>
                <button
                  onClick={() => setFile(null)}
                  className="text-xs sm:text-sm text-white/60 hover:text-white transition-colors"
                >
                  Choose different file
                </button>
              </motion.div>
            ) : (
              <div className="space-y-4 sm:space-y-6">
                <div className="inline-flex items-center justify-center w-16 sm:w-24 h-16 sm:h-24 rounded-full bg-gradient-to-br from-indigo-600/50 to-primary-600/50 border-2 border-indigo-500/50 shadow-2xl shadow-indigo-500/30">
                  <span className="text-4xl sm:text-6xl filter drop-shadow-lg">📄</span>
                </div>
                <h3 className="text-lg sm:text-2xl font-semibold text-white mb-1 sm:mb-2">
                  Drag & Drop your resume here
                </h3>
                <p className="text-xs sm:text-base text-white/60 mb-2 sm:mb-4">or</p>
                <label className="inline-block px-4 sm:px-6 py-2 sm:py-3 bg-white text-indigo-700 rounded-lg hover:bg-indigo-50 hover:text-indigo-800 transition-all font-semibold cursor-pointer shadow-lg hover:shadow-xl border border-indigo-200 text-xs sm:text-base">
                  Browse Files
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={handleFileInput}
                    className="hidden"
                  />
                </label>
                <p className="text-white/40 text-xs sm:text-sm mt-2 sm:mt-4">
                  PDF files only, max 10MB
                </p>
              </div>
            )}
          </div>

          {/* Job Description Input - REQUIRED */}
          <div className="mt-4 sm:mt-6">
            <label className="block text-white font-semibold mb-2 sm:mb-3 text-sm sm:text-base">
              Job Description <span className="text-red-400">*</span>
              <span className="text-white/60 text-xs sm:text-sm font-normal ml-2 block sm:inline">
                Required for ATS analysis
              </span>
            </label>
            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste the complete job description from LinkedIn, Indeed, or any job portal..."
              className={`w-full px-3 sm:px-4 py-2 sm:py-3 bg-white/10 backdrop-blur-md border rounded-lg sm:rounded-xl text-white text-xs sm:text-base placeholder-white/40 focus:outline-none focus:ring-2 resize-none ${
                !jobDescription.trim() 
                  ? 'border-red-500/50 focus:border-red-500/70 focus:ring-red-500/20' 
                  : 'border-white/20 focus:border-indigo-500/50 focus:ring-indigo-500/20'
              }`}
              rows="6"
              required
            />
            {jobDescription.trim() ? (
              <p className="text-indigo-300 text-xs sm:text-sm mt-2 flex items-center">
                <span className="mr-2">✓</span> Job description ready ({jobDescription.trim().length} chars)
              </p>
            ) : (
              <p className="text-red-300 text-xs sm:text-sm mt-2 flex items-center">
                <span className="mr-2">⚠</span> Job description is required
              </p>
            )}
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 sm:mt-6 p-3 sm:p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200 text-xs sm:text-base"
            >
              {error}
            </motion.div>
          )}

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleUpload}
            disabled={!file || !jobDescription.trim() || uploading}
            className="w-full mt-6 sm:mt-8 px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-indigo-600 via-indigo-700 to-primary-600 text-white rounded-lg sm:rounded-xl hover:from-indigo-700 hover:via-indigo-800 hover:to-primary-700 transition-all font-semibold text-sm sm:text-base md:text-lg shadow-2xl shadow-indigo-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploading ? 'Analyzing Resume...' : (!jobDescription.trim() ? 'Add Job Description' : 'Analyze Resume')}
          </motion.button>
        </motion.div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mt-8 sm:mt-12">
          {[
            { icon: '🔒', title: 'Secure', desc: 'Your data is encrypted and private' },
            { icon: '⚡', title: 'Instant', desc: 'Get results in seconds' },
            { icon: '🤖', title: 'AI-Powered', desc: 'Advanced analysis technology' }
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.1 }}
              className="bg-white/10 backdrop-blur-xl rounded-lg sm:rounded-2xl p-4 sm:p-6 border border-white/20 text-center shadow-2xl hover:border-indigo-500/60 hover:shadow-indigo-500/20 transition-all"
            >
              <div className="inline-flex items-center justify-center w-12 sm:w-16 h-12 sm:h-16 rounded-full bg-gradient-to-br from-indigo-600/50 to-primary-600/50 border-2 border-indigo-500/50 shadow-lg shadow-indigo-500/30">
                <span className="text-2xl sm:text-3xl filter drop-shadow-lg">{item.icon}</span>
              </div>
              <h3 className="text-white font-semibold mb-1 sm:mb-2 text-sm sm:text-base">{item.title}</h3>
              <p className="text-white/60 text-xs sm:text-sm">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
      </div>
    </div>
  );
};

export default UploadResume;
