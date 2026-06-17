const API_URL = 'http://127.0.0.1:8000/api/teachers';

export interface Teacher {
  id: string;
  user_id?: string;
  school_id: string;
  teacher_id: string;
  employee_id: string;
  teacher_name: string;
  email: string;
  phone?: string;
  department?: string;
  designation?: string;
  qualification?: string;
  joining_date?: string;
  profile_photo_url?: string;
  status: 'active' | 'inactive' | 'pending';
  created_at?: string;
  updated_at?: string;
  schools?: {
    school_name: string;
    school_code: string;
  };
}

export interface TeacherStats {
  assignedStudents: number;
  completedAssessments: number;
  generatedReports: number;
  activeInterventions: number;
}

export const teacherService = {
  createTeacher: async (data: Partial<Teacher> & { temp_password?: string }): Promise<Teacher> => {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.detail || 'Failed to create teacher');
    return result;
  },

  getTeachers: async (): Promise<Teacher[]> => {
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error('Failed to fetch teachers');
    return await response.json();
  },

  getTeacherById: async (id: string): Promise<Teacher> => {
    const response = await fetch(`${API_URL}/${id}`);
    if (!response.ok) throw new Error('Failed to fetch teacher details');
    return await response.json();
  },

  getTeachersBySchool: async (schoolId: string): Promise<Teacher[]> => {
    const response = await fetch(`${API_URL}/school/${schoolId}`);
    if (!response.ok) throw new Error('Failed to fetch teachers for school');
    return await response.json();
  },

  updateTeacher: async (id: string, data: Partial<Teacher> & { temp_password?: string }): Promise<Teacher> => {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.detail || 'Failed to update teacher');
    return result;
  },

  updateTeacherStatus: async (id: string, status: Teacher['status']): Promise<Teacher> => {
    const response = await fetch(`${API_URL}/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.detail || 'Failed to update teacher status');
    return result;
  },

  deactivateTeacher: async (id: string): Promise<Teacher> => {
    return teacherService.updateTeacherStatus(id, 'inactive');
  },

  getTeacherStats: async (id: string): Promise<TeacherStats> => {
    const response = await fetch(`${API_URL}/${id}/stats`);
    if (!response.ok) throw new Error('Failed to fetch teacher stats');
    return await response.json();
  }
};
