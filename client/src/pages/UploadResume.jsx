import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { resumesAPI } from '../services/api';

const UploadResume = () => {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
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
      setError('Please select a file');
      return;
    }

    setUploading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('resume', file);
      // Optional: Add candidate name from file name
      const candidateName = file.name.replace('.pdf', '').replace(/_/g, ' ');
      formData.append('candidateName', candidateName);

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
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-pink-900 py-20">
      <div className="max-w-4xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-bold text-white mb-4">
            Upload Your Resume
          </h1>
          <p className="text-xl text-white/80">
            Get instant AI-powered analysis of your resume
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white/10 backdrop-blur-xl rounded-3xl p-12 border border-white/20 shadow-2xl"
        >
          {/* Drag and Drop Area */}
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`relative border-3 border-dashed rounded-2xl p-16 text-center transition-all ${
              dragActive
                ? 'border-purple-400 bg-purple-500/20 scale-105'
                : file
                ? 'border-green-400 bg-green-500/10'
                : 'border-white/30 bg-white/5 hover:bg-white/10'
            }`}
          >
            {file ? (
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                className="space-y-6"
              >
                <div className="text-6xl mb-4">✅</div>
                <h3 className="text-2xl font-semibold text-white mb-2">{file.name}</h3>
                <p className="text-white/60">{(file.size / 1024).toFixed(2)} KB</p>
                <button
                  onClick={() => setFile(null)}
                  className="text-white/60 hover:text-white transition-colors text-sm"
                >
                  Choose different file
                </button>
              </motion.div>
            ) : (
              <div className="space-y-6">
                <div className="text-6xl mb-4">📄</div>
                <h3 className="text-2xl font-semibold text-white mb-2">
                  Drag & Drop your resume here
                </h3>
                <p className="text-white/60 mb-4">or</p>
                <label className="inline-block px-6 py-3 bg-white text-purple-600 rounded-lg hover:bg-white/90 transition-all font-semibold cursor-pointer shadow-lg">
                  Browse Files
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={handleFileInput}
                    className="hidden"
                  />
                </label>
                <p className="text-white/40 text-sm mt-4">
                  PDF files only, max 10MB
                </p>
              </div>
            )}
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200"
            >
              {error}
            </motion.div>
          )}

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleUpload}
            disabled={!file || uploading}
            className="w-full mt-8 px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all font-semibold text-lg shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploading ? 'Analyzing...' : 'Analyze My Resume'}
          </motion.button>
        </motion.div>

        {/* Info Cards */}
        <div className="grid md:grid-cols-3 gap-6 mt-12">
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
              className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 text-center"
            >
              <div className="text-4xl mb-3">{item.icon}</div>
              <h3 className="text-white font-semibold mb-2">{item.title}</h3>
              <p className="text-white/60 text-sm">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default UploadResume;
