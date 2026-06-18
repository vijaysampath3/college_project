import { supabase } from '../lib/supabase';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export interface PriorityItem {
  id: string;
  title: string;
  type: string;
  source: string;
  dueDate: string | null;
}

export interface PriorityRecommendations {
  high: PriorityItem[];
  medium: PriorityItem[];
  optional: PriorityItem[];
  upcoming: PriorityItem[];
}

export interface TeacherAssignedActivity {
  id: string;
  name: string;
  teacherName: string;
  priority: string;
  dueDate: string;
  status: string;
}

export interface TeacherAssignedAssessment {
  id: string;
  name: string;
  teacherName: string;
  dueDate: string;
  status: string;
}

export interface HomeSupportActivity {
  id: string;
  name: string;
  category: string;
  estimatedMinutes: number;
}

export interface DailySupportPlan {
  todaysFocus: string;
  thisWeeksGoal: string;
  actionSteps: string[];
}

export interface TeacherRecommendation {
  id: string;
  text: string;
  teacherName: string;
  date: string;
  priority: string;
}

export interface HomeActivityLog {
  id: string;
  activityName: string;
  category: string;
  completedAt: string;
  notes: string;
}

const getHeaders = async () => {
  const { data }: any = await supabase.auth.getSession();
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${data.session?.access_token || ''}`
  };
};

export const parentRecommendationsService = {
  getPriorities: async (studentId: string): Promise<PriorityRecommendations> => {
    const response = await fetch(`${API_URL}/parent/recommendations/priorities?student_id=${studentId}`, { headers: await getHeaders() });
    if (!response.ok) throw new Error('Failed to fetch priorities');
    return response.json();
  },

  getActivities: async (studentId: string): Promise<TeacherAssignedActivity[]> => {
    const response = await fetch(`${API_URL}/parent/recommendations/activities?student_id=${studentId}`, { headers: await getHeaders() });
    if (!response.ok) throw new Error('Failed to fetch activities');
    return response.json();
  },

  getAssessments: async (studentId: string): Promise<TeacherAssignedAssessment[]> => {
    const response = await fetch(`${API_URL}/parent/recommendations/assessments?student_id=${studentId}`, { headers: await getHeaders() });
    if (!response.ok) throw new Error('Failed to fetch assessments');
    return response.json();
  },

  getHomeActivities: async (studentId: string): Promise<HomeSupportActivity[]> => {
    const response = await fetch(`${API_URL}/parent/recommendations/home-activities?student_id=${studentId}`, { headers: await getHeaders() });
    if (!response.ok) throw new Error('Failed to fetch home activities');
    return response.json();
  },

  getDailyPlan: async (studentId: string): Promise<DailySupportPlan> => {
    const response = await fetch(`${API_URL}/parent/recommendations/daily-plan?student_id=${studentId}`, { headers: await getHeaders() });
    if (!response.ok) throw new Error('Failed to fetch daily plan');
    return response.json();
  },

  getTeacherRecommendations: async (studentId: string): Promise<TeacherRecommendation[]> => {
    const response = await fetch(`${API_URL}/parent/recommendations/teacher-recommendations?student_id=${studentId}`, { headers: await getHeaders() });
    if (!response.ok) throw new Error('Failed to fetch teacher recommendations');
    return response.json();
  },

  createHomeActivityLog: async (studentId: string, logData: { activity_name: string, activity_category: string, parent_notes: string }): Promise<HomeActivityLog> => {
    const response = await fetch(`${API_URL}/parent/recommendations/home-activity-log?student_id=${studentId}`, {
      method: 'POST',
      headers: await getHeaders(),
      body: JSON.stringify(logData)
    });
    if (!response.ok) throw new Error('Failed to log home activity');
    return response.json();
  },

  getHomeActivityLogs: async (studentId: string): Promise<HomeActivityLog[]> => {
    const response = await fetch(`${API_URL}/parent/recommendations/home-activity-log?student_id=${studentId}`, { headers: await getHeaders() });
    if (!response.ok) throw new Error('Failed to fetch home activity logs');
    return response.json();
  }
};
