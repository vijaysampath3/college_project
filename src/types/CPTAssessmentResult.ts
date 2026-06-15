export interface CPTEvent {
  trial: number;
  stimulus: string;
  isTarget: boolean;
  responded: boolean;
  reactionTime: number;
  timestamp: number;
  block: number;
  isi: number;
}

export interface CPTMetrics {
  "Assessment Duration": number;
  "Raw Score Omissions": number;
  "Raw Score Commissions": number;
  "Raw Score HitRT": number;
  "Raw Score HitSE": number;
  "Raw Score VarSE": number;
  "Raw Score DPrime": number;
  "Raw Score Beta": number;
  "Raw Score Perseverations": number;
  "Raw Score HitRTBlock": number;
  "Raw Score HitSEBlock": number;
  "Raw Score HitRTIsi": number;
  "Raw Score HitSEIsi": number;
  "Adhd Confidence Index": number;
}

export interface ADHDModelInference {
  predictionClass: number; // 0 or 1
  predictionProbability: number; // 0.0 to 1.0
  adhdModelVersion: string;
  featuresUsed: string[];
}

export interface ADHDInsights {
  strengths: string[];
  areasForImprovement: string[];
  actionableRecommendations: string[];
}

export interface CPTAssessmentResult {
  sessionId: string;
  attemptNumber: number;
  metrics: CPTMetrics;
  inference: ADHDModelInference;
  insights?: ADHDInsights;
}
