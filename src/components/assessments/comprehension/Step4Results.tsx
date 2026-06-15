import React, { useState } from 'react';
import { Target, ArrowRight, Brain, Clock, ChevronRight, CheckCircle2, XCircle } from 'lucide-react';
import { Button, Card, CardContent } from '../../../components/ui';
import { ComprehensionAssessmentResult } from '../../../types/ReadingAssessmentResult';
import { CelebrationModal } from '../CelebrationModal';
import { RewardResult } from '../../../services/rewards.service';

interface Step4ResultsProps {
  result: ComprehensionAssessmentResult;
  rewardResult: RewardResult | null;
  onFinish: () => void;
}

export const Step4Results: React.FC<Step4ResultsProps> = ({ result, rewardResult, onFinish }) => {
  const [showCelebration, setShowCelebration] = useState(true);
  const { metrics, insights, questionResults, readingTimeSeconds } = result;

  const categories = [
    { label: 'Main Idea', score: metrics.mainIdea },
    { label: 'Vocabulary', score: metrics.vocabulary },
    { label: 'Detail Recall', score: metrics.detailRecall },
    { label: 'Inference', score: metrics.inference },
    { label: 'Critical Thinking', score: metrics.criticalThinking }
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12 relative">
      {rewardResult && showCelebration && <CelebrationModal rewardResult={rewardResult} onClose={() => setShowCelebration(false)} />}
      
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Assessment Complete!</h2>
        <p className="text-xl text-gray-600">Great job finishing the comprehension check.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <Card className="bg-primary-50 border-primary-100 col-span-2">
          <CardContent className="p-8">
            <h3 className="font-bold text-primary-900 mb-6 flex items-center gap-2">
              <Target className="w-6 h-6 text-primary-500" />
              Comprehension Breakdown
            </h3>
            <div className="space-y-6">
              {categories.map((cat, idx) => (
                <div key={idx}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium text-primary-900">{cat.label}</span>
                    <span className="font-bold text-primary-700">{cat.score} / 20</span>
                  </div>
                  <div className="h-3 bg-white rounded-full overflow-hidden border border-primary-100">
                    <div 
                      className="h-full bg-primary-500 transition-all duration-1000 ease-out"
                      style={{ width: `${(cat.score / 20) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-8 pt-6 border-t border-primary-200 flex justify-between items-center">
              <span className="font-bold text-xl text-primary-900">Total Score</span>
              <span className="font-bold text-3xl text-primary-600">{metrics.totalScore}%</span>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="bg-white border-gray-200">
            <CardContent className="p-6">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-gray-400" />
                Reading Time
              </h3>
              <div className="text-3xl font-bold text-gray-900">
                {Math.floor(readingTimeSeconds / 60)}m {readingTimeSeconds % 60}s
              </div>
            </CardContent>
          </Card>
          
          {insights && (
            <Card className="bg-secondary-50 border-secondary-100 h-full">
              <CardContent className="p-6">
                <h3 className="font-bold text-secondary-900 mb-4 flex items-center gap-2">
                  <Brain className="w-5 h-5 text-secondary-500" />
                  AI Insights
                </h3>
                <p className="text-secondary-800 mb-4 text-sm leading-relaxed">
                  {insights.summary}
                </p>
                <div className="space-y-3">
                  {insights.recommendations.map((rec, i) => (
                    <div key={i} className="flex gap-3 text-sm text-secondary-700 items-start">
                      <ChevronRight className="w-4 h-4 mt-0.5 text-secondary-400 shrink-0" />
                      <span>{rec}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <Card className="bg-white border-gray-200">
        <CardContent className="p-8">
          <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2">
            Question Review
          </h3>
          <div className="space-y-4">
            {questionResults.map((q, idx) => (
              <div key={q.questionId} className={`p-4 rounded-xl border ${q.isCorrect ? 'bg-success-50 border-success-100' : 'bg-error-50 border-error-100'}`}>
                <div className="flex gap-4 items-start">
                  <div className="shrink-0 mt-1">
                    {q.isCorrect ? <CheckCircle2 className="text-success-500 w-6 h-6" /> : <XCircle className="text-error-500 w-6 h-6" />}
                  </div>
                  <div>
                    <div className="text-sm font-medium mb-1 text-gray-500">Question {idx + 1} • {q.questionType}</div>
                    <div className="text-gray-900 mb-3">{q.questionId}</div>
                    <div className="space-y-2 text-sm">
                      <div className="flex gap-2">
                        <span className="font-medium text-gray-700 w-24">Your Answer:</span>
                        <span className={q.isCorrect ? 'text-success-700 font-medium' : 'text-error-700 line-through'}>{q.selectedAnswer}</span>
                      </div>
                      {!q.isCorrect && (
                        <div className="flex gap-2">
                          <span className="font-medium text-gray-700 w-24">Correct:</span>
                          <span className="text-success-700 font-medium">{q.correctAnswer}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end pt-8">
        <Button size="lg" onClick={onFinish} className="group">
          Return to Dashboard
          <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
        </Button>
      </div>
    </div>
  );
};
