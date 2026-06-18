const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export interface MonitoringOverview {
  riskStatus: string;
  readinessScore: number;
  overallTrend: string;
  lastAssessmentDate: string | null;
  assignedTeacher: string;
}

export interface RiskAnalysis {
  riskCategory: string;
  riskLevel: string;
  riskExplanation: string;
  confidence: string;
}

export interface StrengthArea {
  area: string;
  score: number;
  description: string;
}

export interface SupportArea {
  area: string;
  score: number;
  guidance: string;
}

export interface InterventionItem {
  id: string;
  title: string;
  type: string;
  status: string;
  dueDate: string | null;
  progress: number;
}

export interface InterventionStatus {
  items: InterventionItem[];
  summary: {
    pending: number;
    completed: number;
    overdue: number;
  };
}

export interface ParentVisibleNote {
  id: string;
  note: string;
  date: string;
  author: string;
}

export interface HomeSupportSummary {
  improving: string;
  attention: string;
  actions: string[];
}

import { supabase } from '../lib/supabase';

const getHeaders = async () => {
  const { data }: any = await supabase.auth.getSession();
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${data.session?.access_token || ''}`
  };
};

export const parentMonitoringService = {
  getOverview: async (studentId: string): Promise<MonitoringOverview> => {
    const response = await fetch(`${API_URL}/parent/monitoring/overview?student_id=${studentId}`, { headers: await getHeaders() });
    if (!response.ok) throw new Error('Failed to fetch monitoring overview');
    return response.json();
  },

  getRiskAnalysis: async (studentId: string): Promise<RiskAnalysis> => {
    const response = await fetch(`${API_URL}/parent/monitoring/risk?student_id=${studentId}`, { headers: await getHeaders() });
    if (!response.ok) throw new Error('Failed to fetch risk analysis');
    return response.json();
  },

  getStrengths: async (studentId: string): Promise<StrengthArea[]> => {
    const response = await fetch(`${API_URL}/parent/monitoring/strengths?student_id=${studentId}`, { headers: await getHeaders() });
    if (!response.ok) throw new Error('Failed to fetch strengths');
    return response.json();
  },

  getSupportAreas: async (studentId: string): Promise<SupportArea[]> => {
    const response = await fetch(`${API_URL}/parent/monitoring/support-areas?student_id=${studentId}`, { headers: await getHeaders() });
    if (!response.ok) throw new Error('Failed to fetch support areas');
    return response.json();
  },

  getInterventions: async (studentId: string): Promise<InterventionStatus> => {
    const response = await fetch(`${API_URL}/parent/monitoring/interventions?student_id=${studentId}`, { headers: await getHeaders() });
    if (!response.ok) throw new Error('Failed to fetch interventions');
    return response.json();
  },

  getNotes: async (studentId: string): Promise<ParentVisibleNote[]> => {
    const response = await fetch(`${API_URL}/parent/monitoring/notes?student_id=${studentId}`, { headers: await getHeaders() });
    if (!response.ok) throw new Error('Failed to fetch notes');
    return response.json();
  },

  getHomeSupportSummary: async (studentId: string): Promise<HomeSupportSummary> => {
    const response = await fetch(`${API_URL}/parent/monitoring/home-support?student_id=${studentId}`, { headers: await getHeaders() });
    if (!response.ok) throw new Error('Failed to fetch home support summary');
    return response.json();
  }
};
