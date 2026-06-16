export interface RiskFactor {
  level: 'Low' | 'Moderate' | 'High';
  probability: number;
  confidence: number;
}

export interface ReportInsights {
  executiveSummary: string;
  strengths: string[];
  growthAreas: string[];
  recommendations: string[];
}

export interface StudentReport {
  id: string;
  student_id: string;
  report_version: number;
  readiness_score: number;
  learning_profile: string;
  risk_analysis: Record<string, RiskFactor>;
  ai_insights: ReportInsights;
  assessment_summary: Record<string, any>;
  assessment_snapshot: Record<string, any>;
  generated_from_assessments: number;
  created_at: string;
}
