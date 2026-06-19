import { RecommendationResponse, WeeklyPlan } from '../types/Recommendation';

const API_URL = `${import.meta.env.VITE_API_URL || `${import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}`}/recommendations`;

export const recommendationsService = {
  async generateRecommendations(studentId: string, reportId: string): Promise<{ success: boolean; batch_id: string }> {
    const response = await fetch(`${API_URL}/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ student_id: studentId, report_id: reportId })
    });
    if (!response.ok) throw new Error('Failed to generate recommendations');
    return response.json();
  },

  async getRecommendations(studentId: string): Promise<RecommendationResponse> {
    const response = await fetch(`${API_URL}/${studentId}`);
    if (!response.ok) throw new Error('Failed to fetch recommendations');
    return response.json();
  },

  async completeRecommendation(recId: string): Promise<{ success: boolean }> {
    const response = await fetch(`${API_URL}/${recId}/complete`, { method: 'PATCH' });
    if (!response.ok) throw new Error('Failed to complete recommendation');
    return response.json();
  },

  async getActionPlan(studentId: string): Promise<{ success: boolean; plan: WeeklyPlan }> {
    const response = await fetch(`${API_URL}/${studentId}/action-plan`);
    if (!response.ok) throw new Error('Failed to fetch action plan');
    return response.json();
  },

  async resetActionPlan(studentId: string): Promise<{ success: boolean }> {
    const response = await fetch(`${API_URL}/${studentId}/reset`, { method: 'POST' });
    if (!response.ok) throw new Error('Failed to reset action plan');
    return response.json();
  }
};
