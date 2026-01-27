import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import DashboardLayout from '../components/Layout/DashboardLayout';
import { resumesAPI, scoreAPI } from '../services/api';

const CandidateDetail = () => {
  const { id } = useParams();
  const [resume, setResume] = useState(null);
  const [score, setScore] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const [resumeRes, scoreRes] = await Promise.all([
        resumesAPI.getById(id),
        scoreAPI.get(id).catch(() => null)
      ]);
      
      setResume(resumeRes.data.data.resume);
      if (scoreRes) {
        setScore(scoreRes.data.data.score);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
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
          <p className="text-gray-500">Candidate not found</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{resume.candidateName}</h1>
            <p className="text-gray-600 mt-2">Candidate Details</p>
          </div>
          <Link
            to={`/rankings/${resume.jobId}`}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Back to Rankings
          </Link>
        </div>

        {score && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">ATS Score</h2>
            <div className="grid grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-gray-500">Final Score</p>
                <p className="text-3xl font-bold text-primary-600">{score.finalScore}%</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Skills (60%)</p>
                <p className="text-2xl font-semibold text-gray-900">{score.skillScore}%</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Experience (25%)</p>
                <p className="text-2xl font-semibold text-gray-900">{score.experienceScore}%</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Education (15%)</p>
                <p className="text-2xl font-semibold text-gray-900">{score.educationScore}%</p>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Contact Information</h2>
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
          </div>
        </div>

        {score && (
          <>
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Matched Skills</h2>
              {score.matchedSkills && score.matchedSkills.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {score.matchedSkills.map((skill, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No skills matched</p>
              )}
            </div>

            {score.missingSkills && score.missingSkills.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Missing Skills</h2>
                <div className="flex flex-wrap gap-2">
                  {score.missingSkills.map((skill, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {resume.extractedSkills && resume.extractedSkills.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Extracted Skills</h2>
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
          </div>
        )}

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
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Resume Text</h2>
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

export default CandidateDetail;

