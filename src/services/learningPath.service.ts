const API_URL = `${import.meta.env.VITE_API_URL || `${import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}`}/learning-paths`;

export interface LearningPathItem {
  id: string;
  path_id: string;
  week_number: number;
  order_index: number;
  activity_code: string;
  activity_title: string;
  activity_category: string;
  difficulty: string;
  completed: boolean;
  completed_at: string | null;
  score: number | null;
}

export interface LearningPath {
  id: string;
  student_id: string;
  path_name: string;
  journey_type: string;
  primary_focus_area: string;
  status: string;
  current_week: number;
  completion_percentage: number;
}

export interface LearningPathProgress {
  completion_percentage: number;
  completed: number;
  remaining: number;
  current_week: number;
}

export interface CoachMessage {
  message: string;
  reflection: string;
}

export interface ActivePathResponse {
  success: boolean;
  path: LearningPath | null;
  items: LearningPathItem[];
  progress: LearningPathProgress;
  coach_message: CoachMessage | null;
}

export const learningPathService = {
  async generatePath(studentId: string, reportId?: string): Promise<{ success: boolean; path_id: string }> {
    const response = await fetch(`${API_URL}/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ student_id: studentId, report_id: reportId })
    });
    if (!response.ok) throw new Error('Failed to generate learning path');
    return response.json();
  },

  async getActivePath(studentId: string): Promise<ActivePathResponse> {
    const response = await fetch(`${API_URL}/${studentId}`);
    if (!response.ok) throw new Error('Failed to fetch active learning path');
    return response.json();
  },

  async adaptPath(studentId: string): Promise<{ success: boolean }> {
    const response = await fetch(`${API_URL}/${studentId}/adapt`, { method: 'POST' });
    if (!response.ok) throw new Error('Failed to adapt path');
    return response.json();
  }
};
