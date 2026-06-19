

const API_URL = `${import.meta.env.VITE_API_URL || `${import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}`}/admin/comparison`;

export interface SchoolComparisonData {
  id: string;
  school_name: string;
  totalStudents: number;
  totalTeachers: number;
  totalParents: number;
  assessmentCompletionRate: number;
  avgReadinessScore: number;
  highRiskPercentage: number;
}

export interface RiskComparisonData {
  school_name: string;
  lowRisk: number;
  moderateRisk: number;
  highRisk: number;
  total: number;
}

export interface TeacherComparisonData {
  id: string;
  teacher_name: string;
  school_name: string;
  assignedStudents: number;
  activeStudents: number;
  assessmentCompletionRate: number;
  avgReadinessScore: number;
  teiScore: number;
}

export interface AssessmentAnalyticsData {
  assessmentName: string;
  totalAttempts: number;
  completionRate: number;
  avgDurationSeconds: number;
  avgScore: number;
}

export interface InterventionAnalyticsData {
  hasData: boolean;
  message: string;
}

export interface SchoolRankingData {
  id: string;
  school_name: string;
  spiScore: number;
}

export interface PlatformHealthComparisonData {
  totalSchools: number;
  totalTeachers: number;
  totalStudents: number;
  totalParents: number;
  reportsGenerated: number;
  recommendationsGenerated: number;
  learningPathsGenerated: number;
  activitiesCompleted: number;
}

export const comparisonService = {
  getSchoolComparison: async (): Promise<SchoolComparisonData[]> => {
    const response = await fetch(`${API_URL}/schools`);
    return response.json();
  },

  getRiskComparison: async (): Promise<RiskComparisonData[]> => {
    const response = await fetch(`${API_URL}/risk`);
    return response.json();
  },

  getTeacherComparison: async (): Promise<TeacherComparisonData[]> => {
    const response = await fetch(`${API_URL}/teachers`);
    return response.json();
  },

  getAssessmentAnalytics: async (): Promise<AssessmentAnalyticsData[]> => {
    const response = await fetch(`${API_URL}/assessments`);
    return response.json();
  },

  getInterventionAnalytics: async (): Promise<InterventionAnalyticsData> => {
    const response = await fetch(`${API_URL}/interventions`);
    return response.json();
  },

  getSchoolRankings: async (): Promise<SchoolRankingData[]> => {
    const response = await fetch(`${API_URL}/rankings`);
    return response.json();
  },

  getPlatformHealth: async (): Promise<PlatformHealthComparisonData> => {
    const response = await fetch(`${API_URL}/platform-health`);
    return response.json();
  }
};
