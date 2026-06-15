import React from 'react';
import { Target, Clock, AlertTriangle, Zap, Activity, CheckCircle, XCircle } from 'lucide-react';
import { Button, Card, CardContent } from '../../../components/ui';
import { CelebrationModal } from '../CelebrationModal';
import { RewardResult } from '../../../services/rewards.service';
import { TypingAssessmentResult } from '../../../types/TypingAssessmentResult';

interface Step3ResultsProps {
  result: TypingAssessmentResult;
  rewardResult: RewardResult | null;
  onNext: () => void;
}

export const Step3Results: React.FC<Step3ResultsProps> = ({ result, rewardResult, onNext }) => {
  const { metrics, focusLossEvents } = result;

  const performanceLevel = metrics.wpm > 60 && metrics.accuracy >= 95 ? 'Expert' :
                           metrics.wpm > 40 && metrics.accuracy >= 90 ? 'Proficient' :
                           metrics.wpm > 25 ? 'Intermediate' : 'Beginner';

  const mostCommonError = Object.entries({
    'Capitalization': metrics.capitalizationErrors,
    'Punctuation': metrics.punctuationErrors,
    'Word Boundaries': metrics.wordBoundaryErrors,
    'Substitutions': metrics.substitutions
  }).sort((a, b) => b[1] - a[1])[0];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900">Assessment Complete!</h2>
        <p className="text-gray-600">Here is your typing performance breakdown.</p>
      </div>

      <div className="grid md:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-primary-50 to-primary-100 border-primary-200">
          <CardContent className="p-6 text-center">
            <Zap className="w-8 h-8 text-primary-600 mx-auto mb-2" />
            <div className="text-4xl font-bold text-gray-900">{metrics.wpm}</div>
            <div className="text-sm font-medium text-gray-600">Words per Minute</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-success-50 to-success-100 border-success-200">
          <CardContent className="p-6 text-center">
            <Target className="w-8 h-8 text-success-600 mx-auto mb-2" />
            <div className="text-4xl font-bold text-gray-900">{metrics.accuracy}%</div>
            <div className="text-sm font-medium text-gray-600">Accuracy</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-warning-50 to-warning-100 border-warning-200">
          <CardContent className="p-6 text-center">
            <Clock className="w-8 h-8 text-warning-600 mx-auto mb-2" />
            <div className="text-4xl font-bold text-gray-900">{metrics.completionTimeSeconds}s</div>
            <div className="text-sm font-medium text-gray-600">Completion Time</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-secondary-50 to-secondary-100 border-secondary-200">
          <CardContent className="p-6 text-center">
            <Activity className="w-8 h-8 text-secondary-600 mx-auto mb-2" />
            <div className="text-4xl font-bold text-gray-900">{performanceLevel}</div>
            <div className="text-sm font-medium text-gray-600">Performance Level</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Error Analysis */}
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-error-500" />
              Error Analysis
            </h3>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-2 border-b">
                <span className="text-gray-600 flex items-center gap-2"><CheckCircle className="w-4 h-4 text-success-500" /> Corrected Errors</span>
                <span className="font-bold">{metrics.correctedErrors}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b">
                <span className="text-gray-600 flex items-center gap-2"><XCircle className="w-4 h-4 text-error-500" /> Uncorrected Errors</span>
                <span className="font-bold">{metrics.uncorrectedErrors}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b">
                <span className="text-gray-600">Total Backspaces</span>
                <span className="font-bold">{metrics.backspaceCount}</span>
              </div>
              <div className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
                <span className="text-gray-700 font-medium">Most Common Error</span>
                <span className="font-bold text-error-600">{mostCommonError[1] > 0 ? mostCommonError[0] : 'None!'}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Rhythm & Focus Analysis */}
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary-500" />
              Rhythm & Focus
            </h3>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-2 border-b">
                <span className="text-gray-600">Pause Events (&gt;1.5s)</span>
                <span className="font-bold">{metrics.pauseEvents}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b">
                <span className="text-gray-600">Average Pause Duration</span>
                <span className="font-bold">{metrics.averagePauseDurationMs} ms</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b">
                <span className="text-gray-600">Longest Pause</span>
                <span className="font-bold">{metrics.longestPauseDurationMs} ms</span>
              </div>
              <div className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
                <span className="text-gray-700 font-medium">Focus Loss Events</span>
                <span className={`font-bold ${focusLossEvents.length > 0 ? 'text-warning-600' : 'text-success-600'}`}>
                  {focusLossEvents.length}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-center pt-6">
        <Button size="lg" onClick={onNext} className="px-10 py-6 text-lg rounded-2xl shadow-xl shadow-primary-500/20">
          View AI Insights
          <Target className="w-6 h-6 ml-2" />
        </Button>
      </div>

      {rewardResult && <CelebrationModal rewardResult={rewardResult} onClose={() => {}} />}
    </div>
  );
};
