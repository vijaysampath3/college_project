import { Student } from './student.service';

export interface TeacherStudentAssignment {
  id: string;
  teacher_id: string;
  student_id: string;
  assigned_at: string;
  assigned_by?: string;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
  student_profiles?: Student;
}

export interface TeacherStudentCount {
  teacher_id: string;
  count: number;
}

const API_URL = `${import.meta.env.VITE_API_URL || `${import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}`}/assignments`;

export const assignmentService = {
  assignStudents: async (teacherId: string, studentIds: string[], assignedBy?: string) => {
    const response = await fetch(`${API_URL}/teacher-students`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        teacher_id: teacherId,
        student_ids: studentIds,
        assigned_by: assignedBy
      })
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.detail || 'Failed to assign students');
    return result.assignments;
  },

  getStudentsForTeacher: async (teacherId: string): Promise<TeacherStudentAssignment[]> => {
    const response = await fetch(`${API_URL}/teacher/${teacherId}`);
    if (!response.ok) throw new Error('Failed to fetch assigned students');
    return await response.json();
  },

  reassignStudent: async (studentId: string, newTeacherId: string, assignedBy?: string) => {
    const response = await fetch(`${API_URL}/reassign`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        student_id: studentId,
        new_teacher_id: newTeacherId,
        assigned_by: assignedBy
      })
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.detail || 'Failed to reassign student');
    return result.assignment;
  },

  removeAssignment: async (assignmentId: string) => {
    const response = await fetch(`${API_URL}/${assignmentId}`, {
      method: 'DELETE'
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.detail || 'Failed to remove assignment');
    return result.assignment;
  },

  getTeachersStudentCount: async (schoolId?: string): Promise<TeacherStudentCount[]> => {
    const url = schoolId ? `${API_URL}/counts?school_id=${schoolId}` : `${API_URL}/counts`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch teacher student counts');
    return await response.json();
  }
};
