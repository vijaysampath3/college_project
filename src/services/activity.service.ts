export interface LearningActivity {
  id: string;
  activity_code: string;
  category: string;
  title: string;
  description: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  activity_level: number;
  prerequisite_activity_code: string | null;
  estimated_minutes: number;
  xp_reward: number;
  activity_type: string;
  config: any;
}

export interface ActivityAttemptPayload {
  student_id: string;
  activity_code: string;
  recommendation_id?: string;
  score: number;
  accuracy_percentage?: number;
  time_spent_seconds: number;
  reaction_time_ms?: number;
  mistake_count?: number;
  difficulty?: string;
  activity_type?: string;
  metrics?: any;
}

export interface AttemptResponse {
  success: boolean;
  xp_earned: number;
  quality: string;
  recommendation_completed: boolean;
}

const API_URL = `${import.meta.env.VITE_API_URL || `${import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}`}/activities`;

export const activityService = {
  async getActivities(): Promise<LearningActivity[]> {
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error('Failed to fetch activities');
    const data = await response.json();
    return data.activities;
  },

  async getActivity(activityCode: string): Promise<LearningActivity> {
    const response = await fetch(`${API_URL}/${activityCode}`);
    if (!response.ok) throw new Error('Failed to fetch activity');
    const data = await response.json();
    return data.activity;
  },

  async saveAttempt(payload: ActivityAttemptPayload): Promise<AttemptResponse> {
    const response = await fetch(`${API_URL}/attempt`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!response.ok) throw new Error('Failed to save attempt');
    return response.json();
  }
};
