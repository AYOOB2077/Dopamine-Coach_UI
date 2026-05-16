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

// --- Helper Functions ---
/**
 * Converts a frontend Step object to a backend StepResponseDto for API calls
 */
export const convertStepToDto = (step: any) => {
  return {
    id: step.id,
    taskId: step.taskId,
    stepOrder: step.orderIndex || 0,
    stepTitle: step.stepTitle || step.title || '',
    stepDescription: step.decomposition || '',
    deliverable: step.deliverable || '',
    estimatedTime: step.estimatedTime || 25,
    primaryVerb: step.primaryVerb || '',
    noveltyHook: step.noveltyHook || '',
    passionAnchor: step.passionAnchor || '',
    urgencyCue: step.urgencyCue || '',
    incupTag: step.incupTag || 0,
    status: step.isCompleted ? 2 : (step.status || 0),
    createdAt: step.createdAt || new Date().toISOString(),
    startedAt: step.startedAt || new Date().toISOString(),
    completedAt: step.completedAt || new Date().toISOString(),
  };
};

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
  getUpcomingTasks: (userId: string, date: string) => apiClient.get('/api/Tasks/get/all/upcoming-tasks', { params: { userId, date } }),
  getOngoingTasks: (userId: string, date: string) => apiClient.get('/api/Tasks/get/all/ongoing-tasks', { params: { userId, date } }),
  getFinishedTasks: (userId: string) => apiClient.get('/api/Tasks/get/all/finished-tasks', { params: { userId } }),
  
  // Get tasks by date (ISO format: YYYY-MM-DD)
  getTasksByDate: (date?: string) => {
    const dateParam = date || new Date().toISOString().split('T')[0]; // Default to today
    return apiClient.get(`/api/Tasks/get/all/tasks-by-date`, {
      params: { date: dateParam }
    });
  },

  // Get specific task
  getTaskById: (taskId: string) => apiClient.get(`/api/tasks/get/task/${taskId}`),

  // Create manual task (requires userId in route)
  createTask: (userId: string, taskData: { title: string; description: string }) =>
    apiClient.post(`/api/tasks/create/task/${userId}`, taskData),

  // Create AI task with steps
  createTaskWithStepsFromAi: (userId: string, taskData: { title: string; description: string; userInput?: string }) =>
    apiClient.post(`/api/tasks/create/task/ai/with-steps/${userId}`, taskData),
    
  // Update task
  updateTask: (taskId: string, taskData: { title: string; description: string; status: number; taskLevel: number }) =>
    apiClient.put(`/api/Tasks/update/task/${taskId}`, taskData),

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
  startStep: (step: any) => {
    const dto = convertStepToDto(step);
    return apiClient.post(`/api/Steps/start/step/${step.id}`, dto);
  },
  completeStep: (step: any) => {
    const userId = localStorage.getItem('user_id') || 'placeholder-user-id';
    const dto = {
      userId: userId,
      taskId: step.taskId,
      stepId: step.id,
      statusStep: 2
    };
    return apiClient.put(`/api/Steps/complete/step/${userId}`, dto);
  },
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
