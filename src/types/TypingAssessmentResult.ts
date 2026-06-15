export interface FocusLossEvent {
  type: 'tab_switch' | 'window_blur';
  timestamp: string;
  durationMs: number;
}

export interface KeystrokeLog {
  key: string;
  timestamp: string;
  expectedCharacter: string;
  isCorrect: boolean;
  timeSinceLastKeyMs: number;
}

export interface TypingMetrics {
  wpm: number;
  accuracy: number;
  totalKeystrokes: number;
  backspaceCount: number;
  errorCount: number;
  correctedErrors: number;
  uncorrectedErrors: number;
  completionTimeSeconds: number;
  pauseEvents: number;
  averagePauseDurationMs: number;
  longestPauseDurationMs: number;
  
  // Expanded error typology
  omissions: number;
  insertions: number;
  substitutions: number;
  transpositions: number;
  repeatedLetters: number;
  capitalizationErrors: number;
  punctuationErrors: number;
  wordBoundaryErrors: number;
}

export interface TypingInsights {
  summary: string;
  performanceLevel: string;
  typingRhythmAnalysis: string;
  pauseAnalysis: string;
  errorAnalysis: string;
  mostCommonErrorType: string;
  recommendations: string[];
}

export interface TypingAssessmentResult {
  sessionId?: string;
  attemptNumber: number;
  metrics: TypingMetrics;
  difficulty: 'easy' | 'medium' | 'hard';
  passage: {
    id: string;
    category: string;
    title: string;
  };
  insights?: TypingInsights;
  ai?: any;
  focusLossEvents: FocusLossEvent[];
  keystrokeLog: KeystrokeLog[]; // Raw timeline data
}
