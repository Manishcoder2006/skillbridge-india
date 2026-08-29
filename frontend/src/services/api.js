import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api/v1';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: Attach Auth Bearer token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('sb_auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    return Promise.reject(error);
  }
);

// API Service Methods
export const apiService = {
  // Health
  getHealth: async () => {
    const res = await apiClient.get('/health');
    return res.data;
  },

  // Auth
  login: async (email, password) => {
    const res = await apiClient.post('/auth/login', { email, password });
    return res.data;
  },

  register: async (payload) => {
    const res = await apiClient.post('/auth/register', payload);
    return res.data;
  },

  getProfile: async () => {
    const res = await apiClient.get('/auth/me');
    return res.data;
  },

  updateProfile: async (data) => {
    const res = await apiClient.put('/users/profile', data);
    return res.data;
  },

  // Institutions (Public Safe APIs)
  getPublicInstitutions: async () => {
    const res = await apiClient.get('/institutions/public');
    return res.data;
  },

  getDepartments: async (institutionId) => {
    const res = await apiClient.get(`/institutions/${institutionId}/departments`);
    return res.data;
  },

  // Student Endpoints (Phase 2)
  getStudentDashboardSummary: async () => {
    const res = await apiClient.get('/student/dashboard-summary');
    return res.data;
  },

  getStudentFullProfile: async () => {
    const res = await apiClient.get('/student/profile');
    return res.data;
  },

  updateStudentFullProfile: async (data) => {
    const res = await apiClient.put('/student/profile', data);
    return res.data;
  },

  getStudentSkills: async () => {
    const res = await apiClient.get('/student/skills');
    return res.data;
  },

  addStudentSkill: async (skillData) => {
    const res = await apiClient.post('/student/skills', skillData);
    return res.data;
  },

  deleteStudentSkill: async (skillId) => {
    const res = await apiClient.delete(`/student/skills/${skillId}`);
    return res.data;
  },

  getAssessments: async () => {
    const res = await apiClient.get('/student/assessments');
    return res.data;
  },

  getAssessmentDetail: async (assessmentId) => {
    const res = await apiClient.get(`/student/assessments/${assessmentId}`);
    return res.data;
  },

  submitAssessment: async (assessmentId, answers) => {
    const res = await apiClient.post(`/student/assessments/${assessmentId}/submit`, { answers });
    return res.data;
  },

  getAssessmentResults: async () => {
    const res = await apiClient.get('/student/assessment-results');
    return res.data;
  },

  getLearningResources: async () => {
    const res = await apiClient.get('/student/learning-resources');
    return res.data;
  },

  updateLearningProgress: async (resourceId, status, progressPercent = 100) => {
    const res = await apiClient.post('/student/learning-progress', {
      resource_id: resourceId,
      status,
      progress_percent: progressPercent,
    });
    return res.data;
  },

  getOpportunities: async () => {
    const res = await apiClient.get('/student/opportunities');
    return res.data;
  },

  getOpportunityDetails: async (opportunityId) => {
    const res = await apiClient.get(`/student/opportunities/${opportunityId}`);
    return res.data;
  },

  applyForOpportunity: async (opportunityId, notes = '') => {
    const res = await apiClient.post(`/student/opportunities/${opportunityId}/apply`, { notes });
    return res.data;
  },

  getStudentApplications: async () => {
    const res = await apiClient.get('/student/applications');
    return res.data;
  },

  getStudentResume: async () => {
    const res = await apiClient.get('/student/resume');
    return res.data;
  },

  updateStudentResume: async (resumeData) => {
    const res = await apiClient.put('/student/resume', resumeData);
    return res.data;
  },

  // ---------------------------------------------------------------------------
  // Phase 3: Academician / Faculty Endpoints
  // ---------------------------------------------------------------------------
  getAcademicianSummary: async () => {
    const res = await apiClient.get('/academician/dashboard-summary');
    return res.data;
  },

  getAcademicianProfile: async () => {
    const res = await apiClient.get('/academician/profile');
    return res.data;
  },

  updateAcademicianProfile: async (updateData) => {
    const res = await apiClient.put('/academician/profile', updateData);
    return res.data;
  },

  getAuthorizedStudents: async (params = {}) => {
    const res = await apiClient.get('/academician/students', { params });
    return res.data;
  },

  getAuthorizedStudentDetail: async (studentId) => {
    const res = await apiClient.get(`/academician/students/${studentId}`);
    return res.data;
  },

  getStudentAnalytics: async () => {
    const res = await apiClient.get('/academician/analytics');
    return res.data;
  },

  getFacultyContent: async () => {
    const res = await apiClient.get('/academician/content');
    return res.data;
  },

  createFacultyContent: async (contentData) => {
    const res = await apiClient.post('/academician/content', contentData);
    return res.data;
  },

  updateFacultyContent: async (contentId, contentData) => {
    const res = await apiClient.put(`/academician/content/${contentId}`, contentData);
    return res.data;
  },

  deleteFacultyContent: async (contentId) => {
    const res = await apiClient.delete(`/academician/content/${contentId}`);
    return res.data;
  },

  getFacultyOpportunities: async () => {
    const res = await apiClient.get('/academician/opportunities');
    return res.data;
  },

  recommendOpportunity: async (opportunityId, message) => {
    const res = await apiClient.post(`/academician/opportunities/${opportunityId}/recommend`, {
      opportunity_id: opportunityId,
      message,
    });
    return res.data;
  },

  getCollaborationInitiatives: async () => {
    const res = await apiClient.get('/academician/collaboration');
    return res.data;
  },

  participateInCollaboration: async (initiativeId, interestNote) => {
    const res = await apiClient.post(`/academician/collaboration/${initiativeId}/participate`, {
      interest_note: interestNote,
    });
    return res.data;
  },

  getFacultyNotifications: async () => {
    const res = await apiClient.get('/academician/notifications');
    return res.data;
  },

  markNotificationRead: async (notificationId) => {
    const res = await apiClient.put(`/academician/notifications/${notificationId}/read`);
    return res.data;
  },

  markAllNotificationsRead: async () => {
    const res = await apiClient.put('/academician/notifications/read-all');
    return res.data;
  },

  // ---------------------------------------------------------------------------
  // Phase 4: Industry & HR APIs
  // ---------------------------------------------------------------------------
  getIndustryDashboardSummary: async () => {
    const res = await apiClient.get('/industry/dashboard-summary');
    return res.data;
  },

  getCompanyProfile: async () => {
    const res = await apiClient.get('/industry/company-profile');
    return res.data;
  },

  updateCompanyProfile: async (updateData) => {
    const res = await apiClient.put('/industry/company-profile', updateData);
    return res.data;
  },

  getCompanyPostings: async () => {
    const res = await apiClient.get('/industry/postings');
    return res.data;
  },

  createPosting: async (postingData) => {
    const res = await apiClient.post('/industry/postings', postingData);
    return res.data;
  },

  updatePosting: async (postingId, postingData) => {
    const res = await apiClient.put(`/industry/postings/${postingId}`, postingData);
    return res.data;
  },

  deletePosting: async (postingId) => {
    const res = await apiClient.delete(`/industry/postings/${postingId}`);
    return res.data;
  },

  getCompanyApplications: async (status = null, search = null) => {
    const params = {};
    if (status && status !== 'all') params.status = status;
    if (search) params.search = search;
    const res = await apiClient.get('/industry/applications', { params });
    return res.data;
  },

  updateApplicationStatus: async (applicationId, statusData) => {
    const res = await apiClient.put(`/industry/applications/${applicationId}/status`, statusData);
    return res.data;
  },

  getCandidateProfile: async (studentId) => {
    const res = await apiClient.get(`/industry/candidates/${studentId}`);
    return res.data;
  },

  getAIMatches: async (opportunityId) => {
    const res = await apiClient.get(`/industry/matching/${opportunityId}`);
    return res.data;
  },

  getIndustryCollaborationProposals: async () => {
    const res = await apiClient.get('/industry/collaboration');
    return res.data;
  },

  createIndustryCollaborationProposal: async (proposalData) => {
    const res = await apiClient.post('/industry/collaboration', proposalData);
    return res.data;
  },

  getIndustryAnalytics: async () => {
    const res = await apiClient.get('/industry/analytics');
    return res.data;
  },

  // ---------------------------------------------------------------------------
  // Phase 5: Multi-Model AI Service APIs (Gemini + Grok + Orchestrator)
  // ---------------------------------------------------------------------------
  getAIEngineHealth: async () => {
    const res = await apiClient.get('/ai/health');
    return res.data;
  },

  getAISkillGapAnalysis: async (targetRole = 'Full Stack Engineer', customSkills = null) => {
    const res = await apiClient.post('/ai/student/skill-gap', {
      target_role: targetRole,
      custom_skills: customSkills,
    });
    return res.data;
  },

  getAICareerRecommendations: async (interests = null) => {
    const res = await apiClient.post('/ai/student/career-recommendations', {
      interests: interests,
    });
    return res.data;
  },

  getAILearningRecommendations: async (focusSkills = null) => {
    const res = await apiClient.post('/ai/student/learning-recommendations', {
      focus_skills: focusSkills,
    });
    return res.data;
  },

  getAIResumeSuggestions: async (targetJobTitle = null, customSummary = null) => {
    const res = await apiClient.post('/ai/student/resume-suggestions', {
      target_job_title: targetJobTitle,
      custom_summary: customSummary,
    });
    return res.data;
  },

  getAICandidateMatchMultiModel: async (opportunityId, modelMode = 'hybrid') => {
    const res = await apiClient.post('/ai/industry/candidate-match', {
      opportunity_id: opportunityId,
      model_mode: modelMode,
    });
    return res.data;
  },

  getAICohortInsights: async (departmentId = null) => {
    const res = await apiClient.post('/ai/academician/student-insights', {
      department_id: departmentId,
    });
    return res.data;
  },

  chatWithAIAssistant: async (message, history = []) => {
    const res = await apiClient.post('/ai/assistant/chat', {
      message,
      conversation_history: history,
    });
    return res.data;
  },
};
