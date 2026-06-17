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
}

const API_URL = 'http://127.0.0.1:8000/api/students';

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

  getStudents: async (): Promise<Student[]> => {
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error('Failed to fetch students');
    return await response.json();
  },

  getStudentById: async (id: string): Promise<Student> => {
    const response = await fetch(`${API_URL}/${id}`);
    if (!response.ok) throw new Error('Failed to fetch student details');
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
