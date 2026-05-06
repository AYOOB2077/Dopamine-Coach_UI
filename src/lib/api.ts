import axios from 'axios';

// Create a centralized Axios instance
export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5293', // Backend API URL
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 60000, // 60 seconds timeout
});

// Request interceptor for auth tokens
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 Unauthorized - clear token and redirect to login
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      // Optionally dispatch logout action or redirect
    }
    return Promise.reject(error);
  }
);

// --- Auth Endpoints ---
export const authApi = {
  signup: (userData: { email: string; password: string; passwordConfirm: string; fullName?: string }) =>
    apiClient.post('/api/auth/signup', userData),
  login: (credentials: { email: string; password: string }) =>
    apiClient.post('/api/auth/login', credentials),
  checkEmail: (email: string) =>
    apiClient.post('/api/auth/check-email', email),
};

// --- Task Endpoints ---
export const taskApi = {
  // Get all tasks
  getAllTasks: () => apiClient.get('/api/tasks/get/all/tasks'),

  // Get tasks by status
  getUpcomingTasks: () => apiClient.get('/api/tasks/get/all/upcoming-tasks'),
  getOngoingTasks: () => apiClient.get('/api/tasks/get/all/ongoing-tasks'),
  getFinishedTasks: () => apiClient.get('/api/tasks/get/all/finished-tasks'),
  getTasksByDate: () => apiClient.get('/api/tasks/get/all/tasks-by-date'),

  // Get specific task
  getTaskById: (taskId: string) => apiClient.get(`/api/tasks/get/task/${taskId}`),

  // Create manual task (requires userId in route)
  createTask: (userId: string, taskData: { title: string; description: string }) =>
    apiClient.post(`/api/tasks/create/task/${userId}`, taskData),

  // Create AI task with steps
  createTaskWithStepsFromAi: (userId: string, taskData: { title: string; description: string; userInput?: string }) =>
    apiClient.post(`/api/tasks/create/task/ai/with-steps/${userId}`, taskData),

  // Update task status
  completeTask: (taskId: string) => apiClient.put(`/api/tasks/complete/task/${taskId}`),
  updateTask: (taskId: string, taskData: any) => apiClient.put(`/api/tasks/update/task/${taskId}`, taskData),
  deleteTask: (taskId: string) => apiClient.delete(`/api/tasks/delete/task/${taskId}`),
};

// --- Step Endpoints ---
export const stepApi = {
  getAllSteps: () => apiClient.get('/api/steps/get/all/steps'),
  getStepById: (stepId: string) => apiClient.get(`/api/steps/get/step/${stepId}`),
  getStepsByTaskId: (taskId: string) => apiClient.get(`/api/Steps/get/all/steps/${taskId}`),
  completeStep: (stepId: string) => apiClient.put(`/api/steps/complete/step/${stepId}`),
  deleteStep: (stepId: string) => apiClient.delete(`/api/steps/delete/step/${stepId}`),
};

// --- StepFeel/Survey Endpoints ---
export const stepFeelApi = {
  getAllStepFeels: () => apiClient.get('/api/stepfeels/get/all/stepfeels'),
  getStepFeelById: (stepFeelId: string) => apiClient.get(`/api/stepfeels/get/stepfeel/${stepFeelId}`),
  createStepFeel: (stepFeelData: {
    stepId: string;
    scoreEnthusiasm: number;
    scoreFatigue: number;
    scoreAnxiety: number;
    scoreDistraction: number;
  }) => apiClient.post('/api/stepfeels', stepFeelData),
};

// --- Focus Session Endpoints ---
export const focusSessionApi = {
  startSession: (taskId: string, stepId: string) =>
    apiClient.post('/api/focus-sessions/start', { taskId, stepId }),
  endSession: (sessionId: string) =>
    apiClient.post(`/api/focus-sessions/end/${sessionId}`),
};

// --- Survey / Rest Endpoints ---
export const surveyApi = {
  submitSurvey: (taskId: string, stepId: string, answers: number[]) =>
    apiClient.post('/api/surveys/submit', { taskId, stepId, answers }),
  getCurrentTip: () =>
    apiClient.get('/api/rest-tips/current'),
  completeRest: (sessionId: string) =>
    apiClient.post(`/api/rest/complete/${sessionId}`),
};
