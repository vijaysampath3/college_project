import { supabase } from '../lib/supabase';
import { LinkedStudent } from '../context/ParentContext';

const getAuthHeaders = async () => {
  const { data }: any = await supabase.auth.getSession();
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${data.session?.access_token || ''}`,
  };
};

const API_URL = import.meta.env.VITE_API_URL || `${import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}`;

export interface ParentProfile {
  id: string;
  parentId: string;
  parentName: string;
  email: string;
  phone: string;
  linkedStudentCount: number;
}

export interface ParentDashboardSummary {
  readingScore: number;
  attentionScore: number;
  learningScore: number;
  latestAssessmentDate: string;
  riskStatus: string;
  progressSummary: string;
  assignedActivitiesCount: number;
  pendingAssessmentsCount: number;
  learningPathCompletion: number;
  latestRecommendation: string;
  progressHistory: any[];
}

export const parentDashboardService = {
  getCurrentParent: async (): Promise<ParentProfile> => {
    const response = await fetch(`${API_URL}/parent/me`, {
      headers: await getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch parent profile');
    return response.json();
  },

  getLinkedStudents: async (): Promise<LinkedStudent[]> => {
    const response = await fetch(`${API_URL}/parent/students`, {
      headers: await getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch linked students');
    return response.json();
  },

  getDashboardSummary: async (studentId: string): Promise<ParentDashboardSummary> => {
    const response = await fetch(`${API_URL}/parent/dashboard?student_id=${encodeURIComponent(studentId)}`, {
      headers: await getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch dashboard summary');
    return response.json();
  }
};
