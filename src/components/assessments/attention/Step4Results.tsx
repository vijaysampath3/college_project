import React from 'react';
import { Target, Search, Clock, ArrowRight, Brain, AlertTriangle } from 'lucide-react';
import { Card, CardContent, Button } from '../../../components/ui';
import { AttentionAssessmentResult } from '../../../types/AttentionAssessmentResult';

interface Props {
  result: AttentionAssessmentResult;
  onNext: () => void;
}

export const Step4Results: React.FC<Props> = ({ result, onNext }) => {
  const { scores, rawMetrics } = result;

  const renderScoreCard = (title: string, score: number, description: string, icon: React.ReactNode, colorClass: string) => (
    <Card className={`border-l-4 ${colorClass} hover:shadow-md transition-all h-full`}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className={`p-3 rounded-xl ${colorClass.replace('border-l-', 'bg-').replace('-500', '-50')} ${colorClass.replace('border-l-', 'text-')}`}>
            {icon}
          </div>
          <div className="text-3xl font-bold text-gray-900">{score}%</div>
        </div>
        <h3 className="text-lg font-bold text-gray-900 mb-1">{title}</h3>
        <p className="text-sm text-gray-600">{description}</p>
      </CardContent>
    </Card>
  );

  return (
    <div className="max-w-5xl mx-auto py-8">
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center p-3 bg-primary-100 rounded-full mb-4">
          <Brain className="w-8 h-8 text-primary-600" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Attention Assessment Results</h2>
        <p className="text-xl text-gray-600">Here is a detailed breakdown of your visual attention performance.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        <div className="lg:col-span-3">
          <Card className="bg-gradient-to-br from-primary-500 to-secondary-600 text-white shadow-xl">
            <CardContent className="p-8 sm:p-10 flex flex-col sm:flex-row items-center justify-between gap-8">
              <div>
                <h3 className="text-2xl font-bold mb-2">Overall Attention Score</h3>
                <p className="text-primary-100 max-w-md">
                  A composite score reflecting your visual search accuracy, reaction speed, and distractor filtering consistency.
                </p>
              </div>
              <div className="text-center">
                <div className="text-6xl font-bold mb-2">{scores.overallAttention}%</div>
                <div className="text-primary-100 font-medium">Performance Level</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {renderScoreCard('Visual Search', scores.visualSearch, 'Ability to quickly scan and locate targets.', <Search className="w-6 h-6" />, 'border-l-blue-500')}
        {renderScoreCard('Processing Speed', scores.processingSpeed, 'How fast you react to visual stimuli.', <Clock className="w-6 h-6" />, 'border-l-warning-500')}
        {renderScoreCard('Selective Attention', scores.selectiveAttention, 'Ability to filter out distractors.', <Target className="w-6 h-6" />, 'border-l-success-500')}
        {renderScoreCard('Attention Consistency', scores.attentionConsistency, 'Maintaining stable reaction times.', <Brain className="w-6 h-6" />, 'border-l-purple-500')}
      </div>

      <h3 className="text-2xl font-bold text-gray-900 mb-6">Task Breakdown</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        <Card className="border border-gray-200">
          <CardContent className="p-6">
            <h4 className="text-lg font-bold text-gray-900 mb-4 border-b pb-2">Target Detection</h4>
            <div className="space-y-3">
              <div className="flex justify-between"><span className="text-gray-600">Correct Clicks</span><span className="font-bold">{rawMetrics.task1.correctClicks}</span></div>
              <div className="flex justify-between"><span className="text-gray-600">Missed Targets</span><span className="font-bold text-danger-600">{rawMetrics.task1.missedTargets}</span></div>
              <div className="flex justify-between"><span className="text-gray-600">False Clicks</span><span className="font-bold text-warning-600">{rawMetrics.task1.falseClicks}</span></div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-gray-200">
          <CardContent className="p-6">
            <h4 className="text-lg font-bold text-gray-900 mb-4 border-b pb-2">Symbol Search</h4>
            <div className="space-y-3">
              <div className="flex justify-between"><span className="text-gray-600">Accuracy</span><span className="font-bold">{rawMetrics.task2.accuracy.toFixed(1)}%</span></div>
              <div className="flex justify-between"><span className="text-gray-600">Search Time</span><span className="font-bold">{(rawMetrics.task2.searchSpeed / 1000).toFixed(2)}s</span></div>
              <div className="flex justify-between"><span className="text-gray-600">Distractor Clicks</span><span className="font-bold text-warning-600">{rawMetrics.task2.distractorClicks}</span></div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-gray-200">
          <CardContent className="p-6">
            <h4 className="text-lg font-bold text-gray-900 mb-4 border-b pb-2">Pattern Matching</h4>
            <div className="space-y-3">
              <div className="flex justify-between"><span className="text-gray-600">Decision Accuracy</span><span className="font-bold">{rawMetrics.task3.decisionAccuracy.toFixed(1)}%</span></div>
              <div className="flex justify-between"><span className="text-gray-600">Avg Response Time</span><span className="font-bold">{rawMetrics.task3.responseTimes.length > 0 ? (rawMetrics.task3.responseTimes.reduce((a,b)=>a+b,0)/rawMetrics.task3.responseTimes.length).toFixed(0) : 0}ms</span></div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-gray-200">
          <CardContent className="p-6">
            <h4 className="text-lg font-bold text-gray-900 mb-4 border-b pb-2">Rapid Scanning</h4>
            <div className="space-y-3">
              <div className="flex justify-between"><span className="text-gray-600">Accuracy</span><span className="font-bold">{rawMetrics.task4.accuracy.toFixed(1)}%</span></div>
              <div className="flex justify-between"><span className="text-gray-600">Missed Targets</span><span className="font-bold text-danger-600">{rawMetrics.task4.missedTargets}</span></div>
              <div className="flex justify-between"><span className="text-gray-600">False Positives</span><span className="font-bold text-warning-600">{rawMetrics.task4.falsePositives}</span></div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-center">
        <Button onClick={onNext} size="lg" className="px-8 py-4 text-lg rounded-xl shadow-lg">
          View AI Insights
          <ArrowRight className="w-5 h-5 ml-2" />
        </Button>
      </div>
    </div>
  );
};
