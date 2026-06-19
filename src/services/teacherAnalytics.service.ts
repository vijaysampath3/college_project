import { supabase } from '../lib/supabase';

const API_URL = import.meta.env.VITE_API_URL || `${import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}`;

const getAuthHeaders = async () => {
  const { data }: any = await supabase.auth.getSession();
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${data.session?.access_token || ''}`,
  };
};

export const teacherAnalyticsService = {
  getOverviewMetrics: async (): Promise<any> => {
    const response = await fetch(`${API_URL}/teacher/analytics/overview`, {
      headers: await getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch analytics overview');
    return response.json();
  },

  getRiskAnalytics: async (): Promise<any> => {
    const response = await fetch(`${API_URL}/teacher/analytics/risk`, {
      headers: await getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch risk analytics');
    return response.json();
  },

  getAssessmentAnalytics: async (): Promise<any> => {
    const response = await fetch(`${API_URL}/teacher/analytics/assessments`, {
      headers: await getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch assessment analytics');
    return response.json();
  },

  getStudentImprovements: async (): Promise<any> => {
    const response = await fetch(`${API_URL}/teacher/analytics/improvements`, {
      headers: await getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch student improvements');
    return response.json();
  },

  getLearningPathAnalytics: async (): Promise<any> => {
    const response = await fetch(`${API_URL}/teacher/analytics/learning-paths`, {
      headers: await getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch learning path analytics');
    return response.json();
  },

  getInterventionAnalytics: async (): Promise<any> => {
    const response = await fetch(`${API_URL}/teacher/analytics/interventions`, {
      headers: await getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch intervention analytics');
    return response.json();
  },

  getParentAnalytics: async (): Promise<any> => {
    const response = await fetch(`${API_URL}/teacher/analytics/parents`, {
      headers: await getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch parent analytics');
    return response.json();
  }
};
