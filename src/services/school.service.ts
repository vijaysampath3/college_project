const API_URL = 'http://127.0.0.1:8000/api/schools';

export interface School {
  id: string;
  school_name: string;
  school_code: string;
  district?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postal_code?: string;
  phone?: string;
  email?: string;
  principal_name?: string;
  logo_url?: string;
  academic_year?: string;
  status: 'active' | 'inactive' | 'pending';
  created_at?: string;
  updated_at?: string;
}

export interface SchoolStats {
  teachers: number;
  students: number;
  parents: number;
  assessments: number;
  highRiskStudents: number;
}

export const schoolService = {
  async getSchools(): Promise<School[]> {
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error('Failed to fetch schools');
    const data = await response.json();
    return data.schools;
  },

  async getSchoolById(id: string): Promise<School> {
    const response = await fetch(`${API_URL}/${id}`);
    if (!response.ok) throw new Error('Failed to fetch school details');
    const data = await response.json();
    return data.school;
  },

  async createSchool(schoolData: Partial<School>): Promise<School> {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(schoolData)
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.detail || 'Failed to create school');
    return data.school;
  },

  async updateSchool(id: string, schoolData: Partial<School>): Promise<School> {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(schoolData)
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.detail || 'Failed to update school');
    return data.school;
  },

  async deactivateSchool(id: string): Promise<School> {
    const response = await fetch(`${API_URL}/${id}/status`, {
      method: 'PATCH'
    });
    if (!response.ok) throw new Error('Failed to deactivate school');
    const data = await response.json();
    return data.school;
  },

  async getSchoolStats(id: string): Promise<SchoolStats> {
    const response = await fetch(`${API_URL}/${id}/stats`);
    if (!response.ok) throw new Error('Failed to fetch school stats');
    const data = await response.json();
    return data.stats;
  }
};
