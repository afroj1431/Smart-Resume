import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/Layout/DashboardLayout';
import { resumesAPI, scoreAPI } from '../services/api';

const ResumeReview = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [resume, setResume] = useState(null);
  const [loading, setLoading] = useState(true);
  const [calculating, setCalculating] = useState(false);

  useEffect(() => {
    fetchResume();
  }, [id]);

  const fetchResume = async () => {
    try {
      const response = await resumesAPI.getById(id);
      setResume(response.data.data.resume);
    } catch (error) {
      console.error('Failed to fetch resume:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCalculateScore = async () => {
    setCalculating(true);
    try {
      await scoreAPI.calculate(id);
      navigate(`/rankings/${resume.jobId}`);
    } catch (error) {
      alert('Failed to calculate score');
    } finally {
      setCalculating(false);
    }
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

  if (!resume) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <p className="text-gray-500">Resume not found</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Resume Review</h1>
            <p className="text-gray-600 mt-2">{resume.candidateName}</p>
          </div>
          <button
            onClick={handleCalculateScore}
            disabled={calculating}
            className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
          >
            {calculating ? 'Calculating...' : 'Calculate ATS Score'}
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Candidate Information</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Name</p>
              <p className="font-medium">{resume.candidateName}</p>
            </div>
            {resume.candidateEmail && (
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium">{resume.candidateEmail}</p>
              </div>
            )}
            {resume.candidatePhone && (
              <div>
                <p className="text-sm text-gray-500">Phone</p>
                <p className="font-medium">{resume.candidatePhone}</p>
              </div>
            )}
            <div>
              <p className="text-sm text-gray-500">Status</p>
              <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${
                resume.status === 'parsed' ? 'bg-green-100 text-green-800' :
                resume.status === 'scored' ? 'bg-blue-100 text-blue-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {resume.status}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Extracted Skills</h2>
          {resume.extractedSkills && resume.extractedSkills.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {resume.extractedSkills.map((skill, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-primary-100 text-primary-800 rounded-full text-sm"
                >
                  {skill}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No skills extracted</p>
          )}
        </div>

        {resume.extractedEducation && resume.extractedEducation.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Education</h2>
            <ul className="space-y-2">
              {resume.extractedEducation.map((edu, index) => (
                <li key={index} className="text-gray-700">{edu}</li>
              ))}
            </ul>
          </div>
        )}

        {resume.extractedExperience && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Experience</h2>
            <p className="text-gray-700">{resume.extractedExperience}</p>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Parsed Text</h2>
          <div className="bg-gray-50 p-4 rounded-lg max-h-96 overflow-y-auto">
            <pre className="text-sm text-gray-700 whitespace-pre-wrap">
              {resume.parsedText}
            </pre>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ResumeReview;

