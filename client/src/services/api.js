import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL
  // Don't set default Content-Type - let axios set it based on data type
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // Set Content-Type only for JSON requests (not FormData)
    if (!(config.data instanceof FormData)) {
      config.headers['Content-Type'] = 'application/json';
    }
    // For FormData, let browser set Content-Type with boundary automatically
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle errors (no redirect on 401)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Log error but don't redirect
    if (error.response?.status === 401) {
      console.warn('Unauthorized request - continuing without auth');
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me')
};

// Jobs API
export const jobsAPI = {
  create: (data) => api.post('/jobs', data),
  getAll: () => api.get('/jobs'),
  getById: (id) => api.get(`/jobs/${id}`),
  update: (id, data) => api.put(`/jobs/${id}`, data),
  delete: (id) => api.delete(`/jobs/${id}`)
};

// Resumes API
export const resumesAPI = {
  upload: (formData) => {
    // Don't set Content-Type manually - interceptor will handle it
    // Browser will automatically set 'multipart/form-data' with boundary
    return api.post('/resumes/upload', formData);
  },
  getMyResumes: () => api.get('/resumes/my-resumes'),
  getByJob: (jobId) => api.get(`/resumes/job/${jobId}`),
  getById: (id) => api.get(`/resumes/${id}`),
  delete: (id) => api.delete(`/resumes/${id}`)
};

// Score API
export const scoreAPI = {
  calculate: (resumeId) => api.post(`/score/${resumeId}`),
  get: (resumeId) => api.get(`/score/${resumeId}`)
};

// Rankings API
export const rankingsAPI = {
  get: (jobId, params) => api.get(`/rankings/${jobId}`, { params })
};

// Admin API
export const adminAPI = {
  getAnalytics: () => api.get('/admin/analytics'),
  getUsers: () => api.get('/admin/users'),
  getAllJobs: () => api.get('/admin/jobs'),
  getAuditLogs: (params) => api.get('/admin/audit-logs', { params }),
  deleteUser: (id) => api.delete(`/admin/users/${id}`)
};

// Dashboard API
export const dashboardAPI = {
  getStats: () => api.get('/dashboard/stats')
};

export default api;

