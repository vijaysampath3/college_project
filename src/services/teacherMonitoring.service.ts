import { supabase } from '../lib/supabase';

const API_URL = import.meta.env.VITE_API_URL || `${import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}`;

const getAuthHeaders = async () => {
  const { data }: any = await supabase.auth.getSession();
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${data.session?.access_token || ''}`,
  };
};

export const teacherMonitoringService = {
  getMonitoringSummary: async (): Promise<any> => {
    const response = await fetch(`${API_URL}/teacher/monitoring/summary`, {
      headers: await getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch monitoring summary');
    return response.json();
  },

  getInterventionStudents: async (): Promise<any[]> => {
    const response = await fetch(`${API_URL}/teacher/monitoring/interventions`, {
      headers: await getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch intervention students');
    return response.json();
  },

  getStudentMonitoring: async (studentId: string): Promise<any> => {
    const response = await fetch(`${API_URL}/teacher/monitoring/student/${studentId}/monitor`, {
      headers: await getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch student monitoring details');
    return response.json();
  },

  getStudentAssessments: async (studentId: string): Promise<any[]> => {
    const response = await fetch(`${API_URL}/teacher/monitoring/student/${studentId}/assessments`, {
      headers: await getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch student assessments');
    return response.json();
  },

  getStudentLearningPath: async (studentId: string): Promise<any> => {
    const response = await fetch(`${API_URL}/teacher/monitoring/student/${studentId}/learning-path`, {
      headers: await getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch learning path');
    return response.json();
  },

  getStudentRecommendations: async (studentId: string): Promise<any[]> => {
    const response = await fetch(`${API_URL}/teacher/monitoring/student/${studentId}/recommendations`, {
      headers: await getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch recommendations');
    return response.json();
  },

  getStudentActivities: async (studentId: string): Promise<any[]> => {
    const response = await fetch(`${API_URL}/teacher/monitoring/student/${studentId}/activities`, {
      headers: await getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch activities');
    return response.json();
  },

  createNote: async (studentId: string, note: string): Promise<any> => {
    const response = await fetch(`${API_URL}/teacher/monitoring/student/${studentId}/notes`, {
      method: 'POST',
      headers: await getAuthHeaders(),
      body: JSON.stringify({ note }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to create note');
    }
    return response.json();
  },

  getNotes: async (studentId: string): Promise<any[]> => {
    const response = await fetch(`${API_URL}/teacher/monitoring/student/${studentId}/notes`, {
      headers: await getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch notes');
    return response.json();
  }
};
