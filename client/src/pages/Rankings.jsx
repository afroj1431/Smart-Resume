import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import DashboardLayout from '../components/Layout/DashboardLayout';
import { rankingsAPI, scoreAPI } from '../services/api';

const Rankings = () => {
  const { jobId } = useParams();
  const [rankings, setRankings] = useState([]);
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    minScore: '',
    maxScore: ''
  });

  useEffect(() => {
    fetchRankings();
  }, [jobId, filters]);

  const fetchRankings = async () => {
    try {
      const params = {};
      if (filters.minScore) params.minScore = filters.minScore;
      if (filters.maxScore) params.maxScore = filters.maxScore;

      const response = await rankingsAPI.get(jobId, params);
      setRankings(response.data.data.rankings || []);
      setJob(response.data.data.job);
    } catch (error) {
      console.error('Failed to fetch rankings:', error);
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
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
            <h1 className="text-3xl font-bold text-gray-900">Candidate Rankings</h1>
            {job && <p className="text-gray-600 mt-2">{job.title}</p>}
          </div>
          <Link
            to={`/jobs/${jobId}/upload`}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            Upload Resume
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Filters</h2>
          <div className="flex space-x-4">
            <div>
              <label className="block text-sm text-gray-700 mb-1">Min Score</label>
              <input
                type="number"
                min="0"
                max="100"
                value={filters.minScore}
                onChange={(e) => setFilters({ ...filters, minScore: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">Max Score</label>
              <input
                type="number"
                min="0"
                max="100"
                value={filters.maxScore}
                onChange={(e) => setFilters({ ...filters, maxScore: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                placeholder="100"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={() => setFilters({ minScore: '', maxScore: '' })}
                className="px-4 py-2 text-gray-700 hover:text-gray-900"
              >
                Clear
              </button>
            </div>
          </div>
        </div>

        {rankings.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <p className="text-gray-500 mb-4">No candidates ranked yet</p>
            <Link
              to={`/jobs/${jobId}/upload`}
              className="text-primary-600 hover:text-primary-700 font-medium"
            >
              Upload resumes to get started →
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rank
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Candidate
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ATS Score
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Skills
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Matched
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {rankings.map((item) => (
                  <tr key={item.resume._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className="text-2xl font-bold text-primary-600">#{item.rank}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900">{item.resume.candidateName}</p>
                        {item.resume.candidateEmail && (
                          <p className="text-sm text-gray-500">{item.resume.candidateEmail}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${getScoreColor(item.score.finalScore)}`}
                            style={{ width: `${item.score.finalScore}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium text-gray-900">
                          {item.score.finalScore}%
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        S:{item.score.skillScore}% E:{item.score.experienceScore}% Ed:{item.score.educationScore}%
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {item.score.matchedSkills?.slice(0, 3).map((skill, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded"
                          >
                            {skill}
                          </span>
                        ))}
                        {item.score.matchedSkills?.length > 3 && (
                          <span className="px-2 py-1 text-xs text-gray-500">
                            +{item.score.matchedSkills.length - 3}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {item.score.missingSkills && item.score.missingSkills.length > 0 ? (
                        <div>
                          <p className="text-xs text-red-600 mb-1">Missing:</p>
                          <div className="flex flex-wrap gap-1">
                            {item.score.missingSkills.slice(0, 2).map((skill, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded"
                              >
                                {skill}
                              </span>
                            ))}
                            {item.score.missingSkills.length > 2 && (
                              <span className="text-xs text-gray-500">
                                +{item.score.missingSkills.length - 2}
                              </span>
                            )}
                          </div>
                        </div>
                      ) : (
                        <span className="text-xs text-green-600">All skills matched</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Link
                        to={`/resumes/${item.resume._id}`}
                        className="text-primary-600 hover:text-primary-900"
                      >
                        View Details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Rankings;

