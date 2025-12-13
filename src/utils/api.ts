// API utility for English Complex Management System
import { projectId, publicAnonKey } from './supabase/info';

const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-e2861589`;

// Helper function to make API requests
async function apiRequest(endpoint: string, options: RequestInit = {}) {
  const url = `${API_BASE}${endpoint}`;
  
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${publicAnonKey}`,
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Network error' }));
    throw new Error(error.error || 'API request failed');
  }

  return response.json();
}

// ========================================
// AUTHENTICATION
// ========================================

export const authAPI = {
  login: async (username: string, password: string) => {
    return apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
  },

  changePassword: async (userId: string, oldPassword: string, newPassword: string) => {
    return apiRequest('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ userId, oldPassword, newPassword }),
    });
  },

  forgotPassword: async (email: string) => {
    return apiRequest('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  resetPassword: async (email: string, code: string, newPassword: string) => {
    return apiRequest('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ email, code, newPassword }),
    });
  },
};

// ========================================
// CAMPUSES
// ========================================

export const campusAPI = {
  getAll: async () => {
    return apiRequest('/campuses');
  },

  create: async (campus: any) => {
    return apiRequest('/campuses', {
      method: 'POST',
      body: JSON.stringify(campus),
    });
  },

  update: async (id: string, campus: any) => {
    return apiRequest(`/campuses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(campus),
    });
  },

  delete: async (id: string) => {
    return apiRequest(`/campuses/${id}`, {
      method: 'DELETE',
    });
  },
};

// ========================================
// STUDENTS
// ========================================

export const studentAPI = {
  getAll: async () => {
    return apiRequest('/students');
  },

  create: async (student: any) => {
    return apiRequest('/students', {
      method: 'POST',
      body: JSON.stringify(student),
    });
  },

  update: async (id: string, student: any) => {
    return apiRequest(`/students/${id}`, {
      method: 'PUT',
      body: JSON.stringify(student),
    });
  },

  delete: async (id: string) => {
    return apiRequest(`/students/${id}`, {
      method: 'DELETE',
    });
  },
};

// ========================================
// TEACHERS
// ========================================

export const teacherAPI = {
  getAll: async () => {
    return apiRequest('/teachers');
  },

  create: async (teacher: any) => {
    return apiRequest('/teachers', {
      method: 'POST',
      body: JSON.stringify(teacher),
    });
  },

  update: async (id: string, teacher: any) => {
    return apiRequest(`/teachers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(teacher),
    });
  },

  delete: async (id: string) => {
    return apiRequest(`/teachers/${id}`, {
      method: 'DELETE',
    });
  },
};

// ========================================
// CLASSES
// ========================================

export const classAPI = {
  getAll: async () => {
    return apiRequest('/classes');
  },

  create: async (classData: any) => {
    return apiRequest('/classes', {
      method: 'POST',
      body: JSON.stringify(classData),
    });
  },

  update: async (id: string, classData: any) => {
    return apiRequest(`/classes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(classData),
    });
  },

  delete: async (id: string) => {
    return apiRequest(`/classes/${id}`, {
      method: 'DELETE',
    });
  },
};

// ========================================
// SCHEDULES
// ========================================

export const scheduleAPI = {
  getAll: async () => {
    return apiRequest('/schedules');
  },

  create: async (schedule: any) => {
    return apiRequest('/schedules', {
      method: 'POST',
      body: JSON.stringify(schedule),
    });
  },

  update: async (id: string, schedule: any) => {
    return apiRequest(`/schedules/${id}`, {
      method: 'PUT',
      body: JSON.stringify(schedule),
    });
  },
};

// ========================================
// GRADES
// ========================================

export const gradeAPI = {
  getAll: async () => {
    return apiRequest('/grades');
  },

  create: async (grade: any) => {
    return apiRequest('/grades', {
      method: 'POST',
      body: JSON.stringify(grade),
    });
  },

  update: async (id: string, grade: any) => {
    return apiRequest(`/grades/${id}`, {
      method: 'PUT',
      body: JSON.stringify(grade),
    });
  },

  batchUpdate: async (grades: any[]) => {
    return apiRequest('/grades/batch', {
      method: 'POST',
      body: JSON.stringify(grades),
    });
  },
};

// ========================================
// DOCUMENTS
// ========================================

export const documentAPI = {
  getAll: async () => {
    return apiRequest('/documents');
  },

  create: async (document: any) => {
    return apiRequest('/documents', {
      method: 'POST',
      body: JSON.stringify(document),
    });
  },

  delete: async (id: string) => {
    return apiRequest(`/documents/${id}`, {
      method: 'DELETE',
    });
  },
};

// ========================================
// ASSIGNMENTS
// ========================================

export const assignmentAPI = {
  getAll: async () => {
    return apiRequest('/assignments');
  },

  create: async (assignment: any) => {
    return apiRequest('/assignments', {
      method: 'POST',
      body: JSON.stringify(assignment),
    });
  },

  update: async (id: string, assignment: any) => {
    return apiRequest(`/assignments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(assignment),
    });
  },

  delete: async (id: string) => {
    return apiRequest(`/assignments/${id}`, {
      method: 'DELETE',
    });
  },
};

// ========================================
// FEEDBACK
// ========================================

export const feedbackAPI = {
  getAll: async () => {
    return apiRequest('/feedback');
  },

  create: async (feedback: any) => {
    return apiRequest('/feedback', {
      method: 'POST',
      body: JSON.stringify(feedback),
    });
  },

  update: async (id: string, feedback: any) => {
    return apiRequest(`/feedback/${id}`, {
      method: 'PUT',
      body: JSON.stringify(feedback),
    });
  },
};

// ========================================
// NOTIFICATIONS
// ========================================

export const notificationAPI = {
  getAll: async () => {
    return apiRequest('/notifications');
  },

  create: async (notification: any) => {
    return apiRequest('/notifications', {
      method: 'POST',
      body: JSON.stringify(notification),
    });
  },

  update: async (id: string, notification: any) => {
    return apiRequest(`/notifications/${id}`, {
      method: 'PUT',
      body: JSON.stringify(notification),
    });
  },

  delete: async (id: string) => {
    return apiRequest(`/notifications/${id}`, {
      method: 'DELETE',
    });
  },
};

// ========================================
// ADMIN - Initialize Data
// ========================================

export const adminAPI = {
  initializeData: async (data: any) => {
    return apiRequest('/admin/init-data', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};
