const API_URL = `${import.meta.env.VITE_API_URL || `${import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}`}/admin/dashboard`;

export interface PlatformStats {
  totalStudents: number;
  totalTeachers: number;
  totalParents: number;
  totalSchools: number;
  totalAssessments: number;
  assignedStudents: number;
}

export interface PlatformUsageData {
  name: string;
  assessments: number;
  active_users: number;
}

export interface RiskDistributionData {
  name: string;
  value: number;
  color: string;
}

export interface SchoolOverviewData {
  school_id: string;
  school_name: string;
  student_count: number;
  active_students: number;
  teacher_count: number;
  parent_count: number;
  assessment_count: number;
  avg_risk_level: number;
}

export interface RecentUserData {
  name: string;
  role: string;
  school_name: string | null;
  created_by: string;
  created_at: string;
}

export interface HealthStats {
  totalStudents: number;
  studentsWithReports: number;
  studentsWithoutReports: number;
  activeTeachers: number;
  activeSchools: number;
}

export const adminDashboardService = {
  getStats: async (): Promise<PlatformStats> => {
    const response = await fetch(`${API_URL}/stats`);
    if (!response.ok) throw new Error('Failed to fetch platform stats');
    return await response.json();
  },

  getPlatformUsage: async (): Promise<PlatformUsageData[]> => {
    const response = await fetch(`${API_URL}/platform-usage`);
    if (!response.ok) throw new Error('Failed to fetch platform usage');
    return await response.json();
  },

  getRiskDistribution: async (): Promise<RiskDistributionData[]> => {
    const response = await fetch(`${API_URL}/risk-distribution`);
    if (!response.ok) throw new Error('Failed to fetch risk distribution');
    return await response.json();
  },

  getSchoolOverview: async (): Promise<SchoolOverviewData[]> => {
    const response = await fetch(`${API_URL}/school-overview`);
    if (!response.ok) throw new Error('Failed to fetch school overview');
    return await response.json();
  },

  getRecentUsers: async (): Promise<RecentUserData[]> => {
    const response = await fetch(`${API_URL}/recent-users`);
    if (!response.ok) throw new Error('Failed to fetch recent users');
    return await response.json();
  },

  getHealth: async (): Promise<HealthStats> => {
    const response = await fetch(`${API_URL}/health`);
    if (!response.ok) throw new Error('Failed to fetch health stats');
    return await response.json();
  }
};
