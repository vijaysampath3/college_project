import { supabase } from '../lib/supabase';

const getAuthHeaders = async () => {
  const { data }: any = await supabase.auth.getSession();
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${data.session?.access_token || ''}`,
  };
};

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export interface ProgressSummary {
  studentName: string;
  grade: string;
  schoolName: string;
  assignedTeacher: string;
  riskStatus: string;
  overallScore: number;
  overallTrend: string;
}

export interface AssessmentHistoryItem {
  type: string;
  date: string;
  score: number;
  improvement: number;
}

export interface ProgressTrend {
  date: string;
  [key: string]: string | number; // dynamic categories like Reading, Attention
}

export interface LearningPathProgress {
  currentPath: string;
  completionPercentage: number;
  currentWeek: number;
  completedActivities: number;
  remainingActivities: number;
}

export interface SkillArea {
  category: string;
  score: number;
  description: string;
}

export interface TimelineAchievement {
  id: string;
  title: string;
  description: string;
  date: string;
  type: 'activity' | 'assessment' | 'recommendation';
}

export const parentProgressService = {
  getSummary: async (studentId: string): Promise<ProgressSummary> => {
    const response = await fetch(`${API_URL}/parent/progress/summary?student_id=${encodeURIComponent(studentId)}`, {
      headers: await getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch progress summary');
    return response.json();
  },

  getAssessmentHistory: async (studentId: string): Promise<AssessmentHistoryItem[]> => {
    const response = await fetch(`${API_URL}/parent/progress/assessments?student_id=${encodeURIComponent(studentId)}`, {
      headers: await getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch assessment history');
    return response.json();
  },

  getTrends: async (studentId: string): Promise<ProgressTrend[]> => {
    const response = await fetch(`${API_URL}/parent/progress/trends?student_id=${encodeURIComponent(studentId)}`, {
      headers: await getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch progress trends');
    return response.json();
  },

  getLearningPath: async (studentId: string): Promise<LearningPathProgress> => {
    const response = await fetch(`${API_URL}/parent/progress/learning-path?student_id=${encodeURIComponent(studentId)}`, {
      headers: await getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch learning path progress');
    return response.json();
  },

  getStrengths: async (studentId: string): Promise<SkillArea[]> => {
    const response = await fetch(`${API_URL}/parent/progress/strengths?student_id=${encodeURIComponent(studentId)}`, {
      headers: await getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch strengths');
    return response.json();
  },

  getImprovements: async (studentId: string): Promise<SkillArea[]> => {
    const response = await fetch(`${API_URL}/parent/progress/improvements?student_id=${encodeURIComponent(studentId)}`, {
      headers: await getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch improvements');
    return response.json();
  },

  getAchievements: async (studentId: string): Promise<TimelineAchievement[]> => {
    const response = await fetch(`${API_URL}/parent/progress/achievements?student_id=${encodeURIComponent(studentId)}`, {
      headers: await getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch achievements');
    return response.json();
  }
};
