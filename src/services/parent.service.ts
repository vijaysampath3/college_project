export interface Parent {
  id: string;
  user_id?: string;
  parent_id: string;
  parent_name: string;
  email?: string;
  phone?: string;
  occupation?: string;
  address?: string;
  status: 'active' | 'inactive';
  created_by_teacher?: string | null;
  created_at?: string;
  updated_at?: string;
  school_id?: string;
  school_name?: string;
  created_by_teacher_name?: string;
  linked_students?: {
    relationship: string;
    student_name: string;
    student_id: string;
    grade?: string;
    section?: string;
  }[];
}

export interface ParentFilters {
  school_id?: string;
  teacher_id?: string;
  student_id?: string;
  relationship?: string;
  status?: string;
  search?: string;
}

export interface ParentStats {
  totalParents: number;
  activeParents: number;
  inactiveParents: number;
  linkedParents: number;
  unlinkedParents: number;
  schoolDistribution: {
    schoolName: string;
    totalParents: number;
  }[];
  relationshipSummary: {
    Fathers: number;
    Mothers: number;
    Guardians: number;
    Others: number;
  };
}

export interface ParentDetails extends Parent {
  created_by_teacher_employee_id?: string;
  school_district?: string;
  school_status?: string;
  communicationSummary: {
    lastLogin: string | null;
    portalUsage: string;
    messagesSent: number;
    notificationsViewed: number;
  };
  linked_students?: {
    relationship: string;
    student_name: string;
    student_id: string;
    grade?: string;
    section?: string;
    assigned_teacher?: string | null;
    school_name?: string;
  }[];
}

const API_URL = `${import.meta.env.VITE_API_URL || `${import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}`}/parents`;

export const parentService = {
  getParents: async (filters?: ParentFilters): Promise<Parent[]> => {
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
    if (!response.ok) throw new Error('Failed to fetch parents');
    return await response.json();
  },

  getParentById: async (id: string): Promise<ParentDetails> => {
    const response = await fetch(`${API_URL}/${id}`);
    if (!response.ok) throw new Error('Failed to fetch parent details');
    return await response.json();
  },

  getParentStats: async (): Promise<ParentStats> => {
    const response = await fetch(`${API_URL}/stats`);
    if (!response.ok) throw new Error('Failed to fetch parent stats');
    return await response.json();
  },

  deactivateParent: async (id: string): Promise<Parent> => {
    const response = await fetch(`${API_URL}/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'inactive' })
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.detail || 'Failed to deactivate parent');
    return result;
  }
};
