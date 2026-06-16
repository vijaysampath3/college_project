export interface FocusScores {
  focusScore: number;
  engagementScore: number;
  attentionStability: number;
  screenFocusPercent: number;
  facePresencePercent: number;
  lookAwayCount: number;
  averageLookAwayDuration: number;
  faceLostEvents: number;
  headMovementScore: number;
  taskAccuracy: number;
}

export interface FocusAIInsights {
  strengths: string[];
  areasForImprovement: string[];
  actionableRecommendations: string[];
}

export interface FocusAssessmentResult {
  sessionId: string;
  attemptNumber: number;
  scores: FocusScores;
  insights?: FocusAIInsights;
  rawMetrics: {
    gazeTrackingEnabled: boolean;
    gazeMetrics: any | null;
  };
}
