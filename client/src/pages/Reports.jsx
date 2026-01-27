import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../components/Layout/DashboardLayout';
import { jobsAPI, rankingsAPI } from '../services/api';

const Reports = () => {
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [rankings, setRankings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const response = await jobsAPI.getAll();
      setJobs(response.data.data.jobs || []);
    } catch (error) {
      console.error('Failed to fetch jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleJobSelect = async (jobId) => {
    try {
      const response = await rankingsAPI.get(jobId);
      setRankings(response.data.data.rankings || []);
      setSelectedJob(response.data.data.job);
    } catch (error) {
      console.error('Failed to fetch rankings:', error);
    }
  };

  const exportToCSV = () => {
    if (rankings.length === 0) return;

    const headers = ['Rank', 'Candidate Name', 'Email', 'Phone', 'ATS Score', 'Skills Score', 'Experience Score', 'Education Score', 'Matched Skills', 'Missing Skills'];
    const rows = rankings.map(item => [
      item.rank,
      item.resume.candidateName,
      item.resume.candidateEmail || '',
      item.resume.candidatePhone || '',
      item.score.finalScore,
      item.score.skillScore,
      item.score.experienceScore,
      item.score.educationScore,
      item.score.matchedSkills?.join('; ') || '',
      item.score.missingSkills?.join('; ') || ''
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `talentscan-export-${selectedJob?.title || 'report'}-${Date.now()}.csv`;
    a.click();
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading...</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Reports & Export</h1>
            <p className="text-gray-600 mt-2">Export candidate data and generate reports</p>
          </div>
          {rankings.length > 0 && (
            <button
              onClick={exportToCSV}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              Export to CSV
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Select Job</h2>
            {jobs.length === 0 ? (
              <p className="text-gray-500">No jobs available</p>
            ) : (
              <div className="space-y-2">
                {jobs.map((job) => (
                  <button
                    key={job._id}
                    onClick={() => handleJobSelect(job._id)}
                    className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                      selectedJob?._id === job._id
                        ? 'bg-primary-50 border-2 border-primary-500'
                        : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
                    }`}
                  >
                    <p className="font-medium text-gray-900">{job.title}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      {job.experienceLevel} • {job.skills?.length || 0} skills
                    </p>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Rankings {selectedJob && `- ${selectedJob.title}`}
            </h2>
            {!selectedJob ? (
              <p className="text-gray-500">Select a job to view rankings</p>
            ) : rankings.length === 0 ? (
              <p className="text-gray-500">No rankings available for this job</p>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {rankings.map((item) => (
                  <div
                    key={item.resume._id}
                    className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="font-medium text-gray-900">
                          #{item.rank} {item.resume.candidateName}
                        </p>
                        {item.resume.candidateEmail && (
                          <p className="text-sm text-gray-500">{item.resume.candidateEmail}</p>
                        )}
                      </div>
                      <span className="text-lg font-bold text-primary-600">
                        {item.score.finalScore}%
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {item.score.matchedSkills?.slice(0, 3).map((skill, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Reports;

