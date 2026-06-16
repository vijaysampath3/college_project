export interface Recommendation {
  id: string;
  student_id: string;
  recommendation_batch_id: string;
  category: string;
  recommendation_type: string;
  priority: 'High' | 'Medium' | 'Low';
  impact_score: number;
  title: string;
  description: string;
  estimated_minutes: number;
  activity_data: any;
  status: 'pending' | 'completed';
  generated_from_report: string;
  completed: boolean;
  completed_at: string | null;
  created_at: string;
  generated_at: string;
}

export interface RecommendationAIMessage {
  coach_message: string;
  motivation: string;
  strategy_explanation: string;
}

export interface RecommendationResponse {
  success: boolean;
  recommendations: Recommendation[];
  ai_message: RecommendationAIMessage | null;
}

export interface WeeklyPlan {
  week1: Recommendation[];
  week2: Recommendation[];
  week3: Recommendation[];
  week4: Recommendation[];
}
