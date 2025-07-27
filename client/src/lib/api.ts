import axios from 'axios';

// Simple API configuration - only need to change NEXT_PUBLIC_API_BASE_URL in .env
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5002/api';
const API_DEBUG = process.env.NEXT_PUBLIC_API_DEBUG === 'true';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use((requestConfig) => {
  if (API_DEBUG) {
    console.log('API Request:', requestConfig.method?.toUpperCase(), requestConfig.url, requestConfig.data);
  }
  
  const token = localStorage.getItem('token');
  if (token) {
    requestConfig.headers.Authorization = `Bearer ${token}`;
  }
  return requestConfig;
});

// Add response interceptor for debugging and error handling
api.interceptors.response.use(
  (response) => {
    if (API_DEBUG) {
      console.log('API Response:', response.status, response.config.url, response.data);
    }
    return response;
  },
  (error) => {
    if (API_DEBUG) {
      console.error('API Error:', error.response?.status, error.config?.url, error.response?.data);
    }
    
    // Handle common error cases
    if (error.response?.status === 401) {
      // Unauthorized - remove token and redirect to login
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    
    return Promise.reject(error instanceof Error ? error : new Error(error.message || 'API Error'));
  }
);

// Types
interface SubjectData {
  name: string;
  description?: string;
  color?: string;
}

interface ExamData {
  title: string;
  subject: string;
  date: string;
  description?: string;
}

interface StudySessionData {
  title: string;
  description?: string;
  subject: string;
  exam?: string;
  date: string;
  duration: number;
}

interface SessionData {
  title: string;
  subject: string;
  exam?: string;
  startTime: string;
  endTime: string;
}

export const authAPI = {
  register: (data: { name: string; email: string; password: string }) =>
    api.post('/auth/register', data),
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
};

export const subjectAPI = {
  getSubjects: () => api.get('/subjects'),
  createSubject: (data: SubjectData) =>
    api.post('/subjects', data),
  updateSubject: (id: string, data: Partial<SubjectData>) => api.put(`/subjects/${id}`, data),
  deleteSubject: (id: string) => api.delete(`/subjects/${id}`),
  toggleSubject: (id: string) => api.patch(`/subjects/${id}/toggle`),
};

export const examAPI = {
  getExams: () => api.get('/exams'),
  createExam: (data: ExamData) =>
    api.post('/exams', data),
  updateExam: (id: string, data: Partial<ExamData>) => api.put(`/exams/${id}`, data),
  deleteExam: (id: string) => api.delete(`/exams/${id}`),
  toggleExam: (id: string) => api.patch(`/exams/${id}/toggle`),
};

export const studySessionAPI = {
  getStudySessions: () => api.get('/study'),
  createStudySession: (data: StudySessionData) =>
    api.post('/study', data),
  updateStudySession: (id: string, data: Partial<StudySessionData>) => api.put(`/study/${id}`, data),
  deleteStudySession: (id: string) => api.delete(`/study/${id}`),
  toggleSession: (id: string) => api.patch(`/study/${id}/toggle`),
};

export const studyAPI = {
  getSessions: () => api.get('/study'),
  createSession: (data: SessionData) =>
    api.post('/study', data),
  updateSession: (id: string, data: Partial<SessionData>) => api.put(`/study/${id}`, data),
  deleteSession: (id: string) => api.delete(`/study/${id}`),
};

export const pomodoroAPI = {
  getSessions: () => api.get('/pomodoro'),
  createSession: (data: { duration: number; type: string; studySession?: string; subject?: string; exam?: string }) =>
    api.post('/pomodoro', data),
  getStats: () => api.get('/pomodoro/stats'),
};

export const getProgress = async () => {
  return api.get("/progress");
};

export default api;
