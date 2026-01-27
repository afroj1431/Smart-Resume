import { Routes, Route } from 'react-router-dom';

// Pages
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import UploadResume from './pages/UploadResume';
import ResumeAnalyzer from './pages/ResumeAnalyzer';
import Settings from './pages/Settings';
import JobMatches from './pages/JobMatches';
import ResumeTips from './pages/ResumeTips';
import MyResumes from './pages/MyResumes';
import ATSScores from './pages/ATSScores';
import Profile from './pages/Profile';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/my-resumes" element={<MyResumes />} />
      <Route path="/ats-scores" element={<ATSScores />} />
      <Route path="/upload" element={<UploadResume />} />
      <Route path="/analyzer/:id" element={<ResumeAnalyzer />} />
      <Route path="/matches" element={<JobMatches />} />
      <Route path="/tips" element={<ResumeTips />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/settings" element={<Settings />} />
    </Routes>
  );
}

export default App;

