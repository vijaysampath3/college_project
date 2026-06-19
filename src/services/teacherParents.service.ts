import { supabase } from '../lib/supabase';

const API_URL = import.meta.env.VITE_API_URL || `${import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}`;

const getAuthHeaders = async () => {
  const { data }: any = await supabase.auth.getSession();
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${data.session?.access_token || ''}`,
  };
};

export const teacherParentsService = {
  getStats: async (): Promise<any> => {
    const response = await fetch(`${API_URL}/teacher/parents/stats`, {
      headers: await getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch parent stats');
    return response.json();
  },

  getParents: async (): Promise<any[]> => {
    const response = await fetch(`${API_URL}/teacher/parents`, {
      headers: await getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch parents');
    return response.json();
  },

  createParent: async (parentData: any): Promise<any> => {
    const response = await fetch(`${API_URL}/teacher/parents`, {
      method: 'POST',
      headers: await getAuthHeaders(),
      body: JSON.stringify(parentData),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to create parent');
    }
    return response.json();
  },

  getParent: async (parentId: string): Promise<any> => {
    const response = await fetch(`${API_URL}/teacher/parents/${parentId}`, {
      headers: await getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch parent details');
    return response.json();
  },

  updateParent: async (parentId: string, parentData: any): Promise<any> => {
    const response = await fetch(`${API_URL}/teacher/parents/${parentId}`, {
      method: 'PUT',
      headers: await getAuthHeaders(),
      body: JSON.stringify(parentData),
    });
    if (!response.ok) throw new Error('Failed to update parent');
    return response.json();
  },

  deactivateParent: async (parentId: string): Promise<any> => {
    const response = await fetch(`${API_URL}/teacher/parents/${parentId}/status`, {
      method: 'PATCH',
      headers: await getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to deactivate parent');
    return response.json();
  },

  resetPassword: async (parentId: string, new_password: string): Promise<any> => {
    const response = await fetch(`${API_URL}/teacher/parents/${parentId}/reset-password`, {
      method: 'POST',
      headers: await getAuthHeaders(),
      body: JSON.stringify({ new_password }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to reset password');
    }
    return response.json();
  },

  getAvailableStudents: async (parentId?: string): Promise<any[]> => {
    const url = parentId 
      ? `${API_URL}/teacher/parents/available-students?parent_id=${parentId}`
      : `${API_URL}/teacher/parents/available-students`;
    const response = await fetch(url, {
      headers: await getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch available students');
    return response.json();
  },

  assignStudents: async (parentId: string, assignments: any[]): Promise<any> => {
    const response = await fetch(`${API_URL}/teacher/parents/${parentId}/assign-students`, {
      method: 'POST',
      headers: await getAuthHeaders(),
      body: JSON.stringify({ assignments }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to assign students');
    }
    return response.json();
  },
  
  removeRelationship: async (relationshipId: string): Promise<any> => {
    const response = await fetch(`${API_URL}/teacher/parents/relationship/${relationshipId}`, {
      method: 'DELETE',
      headers: await getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to remove relationship');
    return response.json();
  }
};
