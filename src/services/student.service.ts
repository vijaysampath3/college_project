export interface Student {
  id: string;
  user_id?: string;
  student_id: string;
  school_id: string;
  temporary_password?: string;
  student_name: string;
  admission_number?: string;
  grade?: string;
  section?: string;
  date_of_birth?: string;
  gender?: string;
  phone?: string;
  email?: string;
  status: 'active' | 'inactive' | 'pending';
  created_at?: string;
  updated_at?: string;
  schools?: {
    school_name: string;
    school_code: string;
  };
  assignmentStatus?: 'Assigned' | 'Unassigned';
  assigned_teacher?: string | null;
  assigned_teacher_id?: string | null;
  created_by_teacher?: string | null;
}

const API_URL = 'http://127.0.0.1:8000/api/students';

export interface StudentFilters {
  school_id?: string;
  teacher_id?: string;
  grade?: string;
  section?: string;
  status?: string;
  search?: string;
}

export interface StudentStats {
  totalStudents: number;
  activeStudents: number;
  inactiveStudents: number;
  assignedStudents: number;
  unassignedStudents: number;
  schoolDistribution: {
    schoolName: string;
    totalStudents: number;
  }[];
}

export interface StudentDetails extends Student {
  assessmentSummary: {
    completionPercentage: number;
    latestAssessmentDate: string | null;
  };
  riskOverview: {
    learningDifficultiesRisk: string;
    dyslexiaIndicators: string;
    readingFluencyProblems: string;
    attentionInconsistency: string;
    concentrationProblems: string;
    cognitiveOverload: string;
    riskLevel: string;
  };
  learningJourneySummary: {
    currentJourney: string | null;
    completionPercentage: number;
    activitiesCompleted: number;
  };
}

export const studentService = {
  createStudent: async (data: Partial<Student>): Promise<Student> => {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.detail || 'Failed to create student');
    return result.student;
  },

  getStudents: async (filters?: StudentFilters): Promise<Student[]> => {
    let url = API_URL;
    if (filters) {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
      const queryString = params.toString();
      if (queryString) url += `?${queryString}`;
    }
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch students');
    return await response.json();
  },

  getStudentById: async (id: string): Promise<StudentDetails> => {
    const response = await fetch(`${API_URL}/${id}`);
    if (!response.ok) throw new Error('Failed to fetch student details');
    return await response.json();
  },

  getStudentStats: async (): Promise<StudentStats> => {
    const response = await fetch(`${API_URL}/stats`);
    if (!response.ok) throw new Error('Failed to fetch student stats');
    return await response.json();
  },

  getStudentsBySchool: async (schoolId: string): Promise<Student[]> => {
    const response = await fetch(`${API_URL}/school/${schoolId}`);
    if (!response.ok) throw new Error('Failed to fetch students for school');
    return await response.json();
  },

  updateStudent: async (id: string, data: Partial<Student>): Promise<Student> => {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.detail || 'Failed to update student');
    return result;
  },

  deactivateStudent: async (id: string): Promise<Student> => {
    const response = await fetch(`${API_URL}/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'inactive' })
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.detail || 'Failed to deactivate student');
    return result;
  }
};
