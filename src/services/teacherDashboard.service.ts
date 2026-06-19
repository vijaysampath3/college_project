import { supabase } from '../lib/supabase';

// Helper to get auth headers
const getAuthHeaders = async () => {
  const { data }: any = await supabase.auth.getSession();
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${data.session?.access_token || ''}`,
  };
};

const API_URL = import.meta.env.VITE_API_URL || `${import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}`;

export interface TeacherProfile {
  id: string;
  teacherId: string;
  teacherName: string;
  email: string;
  schoolId: string;
  schoolName: string;
  department: string;
  designation: string;
}

export interface DashboardStats {
  totalStudents: number;
  highRiskStudents: number;
  assessmentsCompleted: number;
  pendingReviews: number;
}

export interface RiskDistribution {
  "Low Risk": number;
  "Moderate Risk": number;
  "High Risk": number;
}

export interface AnalyticsData {
  goalsMet: string;
  engagement: string;
  weeklyImprovement: string;
}

export interface Alert {
  id: string;
  type: string;
  title: string;
  message: string;
  date: string;
}

export const teacherDashboardService = {
  getCurrentTeacher: async (): Promise<TeacherProfile> => {
    const response = await fetch(`${API_URL}/teacher/me`, {
      headers: await getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch teacher profile');
    return response.json();
  },

  getDashboardStats: async (): Promise<DashboardStats> => {
    const response = await fetch(`${API_URL}/teacher/dashboard/stats`, {
      headers: await getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch dashboard stats');
    return response.json();
  },

  getAssignedStudents: async (): Promise<any[]> => {
    const response = await fetch(`${API_URL}/teacher/students`, {
      headers: await getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch students');
    return response.json();
  },

  getRiskDistribution: async (): Promise<RiskDistribution> => {
    const response = await fetch(`${API_URL}/teacher/risk-distribution`, {
      headers: await getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch risk distribution');
    return response.json();
  },

  getRecentAssessments: async (): Promise<any[]> => {
    const response = await fetch(`${API_URL}/teacher/recent-assessments`, {
      headers: await getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch recent assessments');
    return response.json();
  },

  getTeacherAlerts: async (): Promise<Alert[]> => {
    const response = await fetch(`${API_URL}/teacher/alerts`, {
      headers: await getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch alerts');
    return response.json();
  },

  getAnalytics: async (): Promise<AnalyticsData> => {
    const response = await fetch(`${API_URL}/teacher/analytics`, {
      headers: await getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch analytics');
    return response.json();
  },

  getStudentPerformanceOverview: async (): Promise<any> => {
    const response = await fetch(`${API_URL}/teacher/dashboard/student-performance`, {
      headers: await getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch student performance');
    return response.json();
  }
};
