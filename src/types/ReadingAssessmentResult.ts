export interface AlignmentChunk {
  type: 'equal' | 'substitute' | 'missing' | 'extra';
  expected: string;
  actual: string;
}

export interface WordAnalysis {
  matched: number;
  missing: number;
  extra: number;
  substituted: number;
  expected: number;
}

export interface ReadingMetrics {
  accuracy: number;
  wpm: number;
  wer: number;
  coverage: number;
  similarity: number;
}

export interface ComprehensionMetrics {
  mainIdea: number;
  vocabulary: number;
  detailRecall: number;
  inference: number;
  criticalThinking: number;
  totalScore: number;
}

export interface ComprehensionQuestionResult {
  questionId: string;
  questionType: string;
  selectedAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
}

export interface WhisperMetadata {
  model: string;
  confidence: number;
  processingTime: number;
}

export interface PassageMetadata {
  id: string;
  category: string;
  difficulty: string;
}

export interface AIMetadata {
  provider: string;
  model: string;
  generatedAt: string;
}

export interface ReadingAssessmentResult {
  attemptNumber: number;
  transcript: string;
  metrics: ReadingMetrics;
  wordAnalysis: WordAnalysis;
  passage: PassageMetadata;
  whisper: WhisperMetadata;
  alignment: AlignmentChunk[];
  insights?: {
    summary: string;
    recommendations: string[];
  };
  ai?: AIMetadata;
}

export interface ComprehensionAssessmentResult {
  attemptNumber: number;
  metrics: ComprehensionMetrics;
  questionResults: ComprehensionQuestionResult[];
  passage: PassageMetadata;
  readingTimeSeconds: number;
  insights?: {
    summary: string;
    recommendations: string[];
  };
  ai?: AIMetadata;
}
