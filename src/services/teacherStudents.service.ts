import { supabase } from '../lib/supabase';

const API_URL = import.meta.env.VITE_API_URL || `${import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}`;

const getAuthHeaders = async () => {
  const { data }: any = await supabase.auth.getSession();
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${data.session?.access_token || ''}`,
  };
};

export const teacherStudentsService = {
  getNextStudentId: async (): Promise<string> => {
    const response = await fetch(`${API_URL}/teacher/students/next-id`, {
      headers: await getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch next student ID');
    const data = await response.json();
    return data.next_id;
  },

  getStudents: async (): Promise<any[]> => {
    const response = await fetch(`${API_URL}/teacher/students/`, {
      headers: await getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch students');
    return response.json();
  },

  createStudent: async (studentData: any): Promise<any> => {
    const response = await fetch(`${API_URL}/teacher/students/`, {
      method: 'POST',
      headers: await getAuthHeaders(),
      body: JSON.stringify(studentData),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to create student');
    }
    return response.json();
  },

  getStudent: async (studentId: string): Promise<any> => {
    const response = await fetch(`${API_URL}/teacher/students/${studentId}`, {
      headers: await getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch student details');
    return response.json();
  },

  updateStudent: async (studentId: string, studentData: any): Promise<any> => {
    const response = await fetch(`${API_URL}/teacher/students/${studentId}`, {
      method: 'PUT',
      headers: await getAuthHeaders(),
      body: JSON.stringify(studentData),
    });
    if (!response.ok) throw new Error('Failed to update student');
    return response.json();
  },

  deactivateStudent: async (studentId: string, status: string): Promise<any> => {
    const response = await fetch(`${API_URL}/teacher/students/${studentId}/status`, {
      method: 'PATCH',
      headers: await getAuthHeaders(),
      body: JSON.stringify({ status }),
    });
    if (!response.ok) throw new Error('Failed to change student status');
    return response.json();
  },

  resetPassword: async (studentId: string, password: string): Promise<any> => {
    const response = await fetch(`${API_URL}/teacher/students/${studentId}/reset-password`, {
      method: 'POST',
      headers: await getAuthHeaders(),
      body: JSON.stringify({ password }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to reset password');
    }
    return response.json();
  }
};
