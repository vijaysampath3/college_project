export interface LearningProfile {
  visual: number;
  interactive: number;
  analytical: number;
  sequential: number;
  dominantProfile: string;
}

export interface LearningBehaviourScores {
  learningBehaviourScore: number;
  persistenceScore: number;
  adaptabilityScore: number;
  consistencyScore: number;
  processingStyleScore: number;
}

export interface PatternLearningMetrics {
  patternAccuracy: number;
  averageDecisionTimeMs: number;
  consistencyScore: number; // Low variance in response time = higher consistency
}

export interface RuleApplicationMetrics {
  ruleRetention: number;
  adaptationSpeedMs: number;
  ruleSwitchRecovery: number;
  instructionAccuracy: number;
}

export interface PersistenceMetrics {
  completionRate: number;
  retryRate: number;
  skipRate: number;
  timeSpentOnDifficultItemsMs: number;
  abandonmentRate: number;
  challengePersistence: number;
}

export interface LearningBehaviourRawMetrics {
  task1: PatternLearningMetrics;
  task2: RuleApplicationMetrics;
  task3: PersistenceMetrics;
}

export interface LearningBehaviourInsights {
  summary: string;
  strengths: string[];
  growthAreas: string[];
  recommendations: string[];
}

export interface LearningBehaviourResult {
  sessionId: string;
  attemptNumber: number;
  scores: LearningBehaviourScores;
  profile: LearningProfile;
  insights: LearningBehaviourInsights | null;
  rawMetrics: LearningBehaviourRawMetrics;
}
