export interface Task1Metrics {
  reactionTimes: number[];
  correctClicks: number;
  missedTargets: number;
  falseClicks: number;
}

export interface Task2Metrics {
  searchSpeed: number; // e.g. completion time
  accuracy: number;
  distractorClicks: number;
}

export interface Task3Metrics {
  decisionAccuracy: number;
  responseTimes: number[];
}

export interface Task4Metrics {
  reactionTimes: number[];
  missedTargets: number;
  falsePositives: number;
  accuracy: number;
}

export interface AttentionScores {
  overallAttention: number;
  visualSearch: number;
  processingSpeed: number;
  selectiveAttention: number;
  attentionConsistency: number;
}

export interface AttentionInsights {
  strengths: string[];
  areasForImprovement: string[];
  actionableRecommendations: string[];
}

export interface AttentionAssessmentResult {
  sessionId: string;
  attemptNumber: number;
  rawMetrics: {
    task1: Task1Metrics;
    task2: Task2Metrics;
    task3: Task3Metrics;
    task4: Task4Metrics;
  };
  scores: AttentionScores;
  insights?: AttentionInsights;
}
