import { supabase } from '../lib/supabase';

const API_URL = import.meta.env.VITE_API_URL || `${import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}`;

const getAuthHeaders = async () => {
  const { data }: any = await supabase.auth.getSession();
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${data.session?.access_token || ''}`,
  };
};

export const teacherInterventionService = {
  getOverview: async (): Promise<any> => {
    const response = await fetch(`${API_URL}/teacher/intervention/overview`, {
      headers: await getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch overview');
    return response.json();
  },

  getRecentAssessments: async (): Promise<any[]> => {
    const response = await fetch(`${API_URL}/teacher/intervention/recent-assessments`, {
      headers: await getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch recent assessments');
    return response.json();
  },

  getInterventionQueue: async (): Promise<any[]> => {
    const response = await fetch(`${API_URL}/teacher/intervention/queue`, {
      headers: await getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch intervention queue');
    return response.json();
  },

  getAllAssigned: async (): Promise<any> => {
    const response = await fetch(`${API_URL}/teacher/intervention/all-assigned`, {
      headers: await getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch assigned interventions');
    return response.json();
  },

  getRecommendations: async (studentId: string, assessmentId: string): Promise<any> => {
    const response = await fetch(`${API_URL}/teacher/intervention/student/${studentId}/assessment/${assessmentId}/recommendations`, {
      headers: await getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch recommendations');
    return response.json();
  },

  assignActivity: async (studentId: string, payload: any): Promise<any> => {
    const response = await fetch(`${API_URL}/teacher/intervention/student/${studentId}/assign-activity`, {
      method: 'POST',
      headers: await getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to assign activity');
    }
    return response.json();
  },

  assignAssessment: async (studentId: string, payload: any): Promise<any> => {
    const response = await fetch(`${API_URL}/teacher/intervention/student/${studentId}/assign-assessment`, {
      method: 'POST',
      headers: await getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to assign assessment');
    }
    return response.json();
  },

  getStudentAssignments: async (studentId: string): Promise<any> => {
    const response = await fetch(`${API_URL}/teacher/intervention/student/${studentId}/assignments`, {
      headers: await getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch student assignments');
    return response.json();
  }
};
