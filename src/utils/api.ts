/**
 * API Utility Functions
 * Central place for all API calls to the server
 */

import { projectId, publicAnonKey } from './supabase/info';

const API_BASE_URL = `https://${projectId}.supabase.co/functions/v1/make-server-e2861589`;

const headers = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${publicAnonKey}`
};

// ============================================
// HELPER FUNCTIONS
// ============================================

async function handleResponse(response: Response) {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Network error' }));
    throw new Error(error.error || error.message || 'API request failed');
  }
  return response.json();
}

// ============================================
// AUTH APIs
// ============================================

export const authAPI = {
  login: async (username: string, password: string) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ username, password })
    });
    return handleResponse(response);
  },

  changePassword: async (userId: string, oldPassword: string, newPassword: string) => {
    const response = await fetch(`${API_BASE_URL}/auth/change-password`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ userId, oldPassword, newPassword })
    });
    return handleResponse(response);
  },

  forgotPassword: async (email: string) => {
    const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ email })
    });
    return handleResponse(response);
  },

  resetPassword: async (email: string, code: string, newPassword: string) => {
    const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ email, code, newPassword })
    });
    return handleResponse(response);
  }
};

// ============================================
// STUDENTS APIs
// ============================================

export const studentsAPI = {
  getAll: async () => {
    const response = await fetch(`${API_BASE_URL}/students`, { headers });
    return handleResponse(response);
  },

  create: async (student: any) => {
    const response = await fetch(`${API_BASE_URL}/students`, {
      method: 'POST',
      headers,
      body: JSON.stringify(student)
    });
    return handleResponse(response);
  },

  update: async (id: string, student: any) => {
    const response = await fetch(`${API_BASE_URL}/students/${id}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(student)
    });
    return handleResponse(response);
  },

  delete: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/students/${id}`, {
      method: 'DELETE',
      headers
    });
    return handleResponse(response);
  }
};

// ============================================
// TEACHERS APIs
// ============================================

export const teachersAPI = {
  getAll: async () => {
    const response = await fetch(`${API_BASE_URL}/teachers`, { headers });
    return handleResponse(response);
  },

  create: async (teacher: any) => {
    const response = await fetch(`${API_BASE_URL}/teachers`, {
      method: 'POST',
      headers,
      body: JSON.stringify(teacher)
    });
    return handleResponse(response);
  },

  update: async (id: string, teacher: any) => {
    const response = await fetch(`${API_BASE_URL}/teachers/${id}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(teacher)
    });
    return handleResponse(response);
  },

  delete: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/teachers/${id}`, {
      method: 'DELETE',
      headers
    });
    return handleResponse(response);
  }
};

// ============================================
// CLASSES APIs
// ============================================

export const classesAPI = {
  getAll: async () => {
    const response = await fetch(`${API_BASE_URL}/classes`, { headers });
    return handleResponse(response);
  },

  create: async (classData: any) => {
    const response = await fetch(`${API_BASE_URL}/classes`, {
      method: 'POST',
      headers,
      body: JSON.stringify(classData)
    });
    return handleResponse(response);
  },

  update: async (id: string, classData: any) => {
    const response = await fetch(`${API_BASE_URL}/classes/${id}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(classData)
    });
    return handleResponse(response);
  },

  delete: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/classes/${id}`, {
      method: 'DELETE',
      headers
    });
    return handleResponse(response);
  }
};

// ============================================
// CAMPUSES APIs
// ============================================

export const campusesAPI = {
  getAll: async () => {
    const response = await fetch(`${API_BASE_URL}/campuses`, { headers });
    return handleResponse(response);
  },

  create: async (campus: any) => {
    const response = await fetch(`${API_BASE_URL}/campuses`, {
      method: 'POST',
      headers,
      body: JSON.stringify(campus)
    });
    return handleResponse(response);
  },

  update: async (id: string, campus: any) => {
    const response = await fetch(`${API_BASE_URL}/campuses/${id}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(campus)
    });
    return handleResponse(response);
  },

  delete: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/campuses/${id}`, {
      method: 'DELETE',
      headers
    });
    return handleResponse(response);
  }
};

// ============================================
// SCHEDULES APIs
// ============================================

export const schedulesAPI = {
  getAll: async () => {
    const response = await fetch(`${API_BASE_URL}/schedules`, { headers });
    return handleResponse(response);
  },

  create: async (schedule: any) => {
    const response = await fetch(`${API_BASE_URL}/schedules`, {
      method: 'POST',
      headers,
      body: JSON.stringify(schedule)
    });
    return handleResponse(response);
  },

  update: async (id: string, schedule: any) => {
    const response = await fetch(`${API_BASE_URL}/schedules/${id}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(schedule)
    });
    return handleResponse(response);
  }
};

// ============================================
// GRADES APIs
// ============================================

export const gradesAPI = {
  getAll: async () => {
    const response = await fetch(`${API_BASE_URL}/grades`, { headers });
    return handleResponse(response);
  },

  create: async (grade: any) => {
    const response = await fetch(`${API_BASE_URL}/grades`, {
      method: 'POST',
      headers,
      body: JSON.stringify(grade)
    });
    return handleResponse(response);
  },

  update: async (id: string, grade: any) => {
    const response = await fetch(`${API_BASE_URL}/grades/${id}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(grade)
    });
    return handleResponse(response);
  },

  batchUpdate: async (grades: any[]) => {
    const response = await fetch(`${API_BASE_URL}/grades/batch`, {
      method: 'POST',
      headers,
      body: JSON.stringify(grades)
    });
    return handleResponse(response);
  }
};

// ============================================
// DOCUMENTS APIs
// ============================================

export const documentsAPI = {
  getAll: async () => {
    const response = await fetch(`${API_BASE_URL}/documents`, { headers });
    return handleResponse(response);
  },

  create: async (document: any) => {
    const response = await fetch(`${API_BASE_URL}/documents`, {
      method: 'POST',
      headers,
      body: JSON.stringify(document)
    });
    return handleResponse(response);
  },

  delete: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/documents/${id}`, {
      method: 'DELETE',
      headers
    });
    return handleResponse(response);
  }
};

// ============================================
// ASSIGNMENTS APIs
// ============================================

export const assignmentsAPI = {
  getAll: async () => {
    const response = await fetch(`${API_BASE_URL}/assignments`, { headers });
    return handleResponse(response);
  },

  create: async (assignment: any) => {
    const response = await fetch(`${API_BASE_URL}/assignments`, {
      method: 'POST',
      headers,
      body: JSON.stringify(assignment)
    });
    return handleResponse(response);
  },

  update: async (id: string, assignment: any) => {
    const response = await fetch(`${API_BASE_URL}/assignments/${id}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(assignment)
    });
    return handleResponse(response);
  },

  delete: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/assignments/${id}`, {
      method: 'DELETE',
      headers
    });
    return handleResponse(response);
  }
};

// ============================================
// FEEDBACK APIs
// ============================================

export const feedbackAPI = {
  getAll: async () => {
    const response = await fetch(`${API_BASE_URL}/feedback`, { headers });
    return handleResponse(response);
  },

  create: async (feedback: any) => {
    const response = await fetch(`${API_BASE_URL}/feedback`, {
      method: 'POST',
      headers,
      body: JSON.stringify(feedback)
    });
    return handleResponse(response);
  },

  update: async (id: string, feedback: any) => {
    const response = await fetch(`${API_BASE_URL}/feedback/${id}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(feedback)
    });
    return handleResponse(response);
  }
};

// ============================================
// NOTIFICATIONS APIs
// ============================================

export const notificationsAPI = {
  getAll: async () => {
    const response = await fetch(`${API_BASE_URL}/notifications`, { headers });
    return handleResponse(response);
  },

  create: async (notification: any) => {
    const response = await fetch(`${API_BASE_URL}/notifications`, {
      method: 'POST',
      headers,
      body: JSON.stringify(notification)
    });
    return handleResponse(response);
  },

  update: async (id: string, notification: any) => {
    const response = await fetch(`${API_BASE_URL}/notifications/${id}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(notification)
    });
    return handleResponse(response);
  },

  delete: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/notifications/${id}`, {
      method: 'DELETE',
      headers
    });
    return handleResponse(response);
  }
};

// ============================================
// ADMIN APIs
// ============================================

export const adminAPI = {
  initData: async (data: any) => {
    const response = await fetch(`${API_BASE_URL}/admin/init-data`, {
      method: 'POST',
      headers,
      body: JSON.stringify(data)
    });
    return handleResponse(response);
  },

  resetData: async () => {
    const response = await fetch(`${API_BASE_URL}/admin/reset-data`, {
      method: 'POST',
      headers
    });
    return handleResponse(response);
  }
};

// ============================================
// USERS APIs (for UserManagement)
// ============================================

export const usersAPI = {
  getAll: async () => {
    const response = await fetch(`${API_BASE_URL}/users`, { headers });
    return handleResponse(response);
  },

  getById: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/users/${id}`, { headers });
    return handleResponse(response);
  },

  create: async (user: any) => {
    const response = await fetch(`${API_BASE_URL}/users`, {
      method: 'POST',
      headers,
      body: JSON.stringify(user)
    });
    return handleResponse(response);
  },

  update: async (id: string, user: any) => {
    const response = await fetch(`${API_BASE_URL}/users/${id}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(user)
    });
    return handleResponse(response);
  },

  delete: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/users/${id}`, {
      method: 'DELETE',
      headers
    });
    return handleResponse(response);
  },

  updateStatus: async (id: string, status: 'active' | 'inactive') => {
    const response = await fetch(`${API_BASE_URL}/users/${id}/status`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ status })
    });
    return handleResponse(response);
  },

  resetPassword: async (id: string, newPassword: string) => {
    const response = await fetch(`${API_BASE_URL}/users/${id}/reset-password`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ newPassword })
    });
    return handleResponse(response);
  }
};