import React from 'react';
import { Target, Activity, Clock, ArrowRight, Eye, Monitor, ShieldAlert, BarChart } from 'lucide-react';
import { Card, CardContent, Button } from '../../../components/ui';
import { FocusAssessmentResult } from '../../../types/FocusAssessmentResult';

interface Props {
  result: FocusAssessmentResult;
  onNext: () => void;
}

export const Step4Results: React.FC<Props> = ({ result, onNext }) => {
  const { scores } = result;

  const renderScoreCard = (title: string, value: string | number, description: string, icon: React.ReactNode, colorClass: string) => (
    <Card className={`border-l-4 ${colorClass} hover:shadow-md transition-all h-full`}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className={`p-3 rounded-xl ${colorClass.replace('border-l-', 'bg-').replace('-500', '-50')} ${colorClass.replace('border-l-', 'text-')}`}>
            {icon}
          </div>
          <div className="text-3xl font-bold text-gray-900">{value}</div>
        </div>
        <h3 className="text-lg font-bold text-gray-900 mb-1">{title}</h3>
        <p className="text-sm text-gray-600">{description}</p>
      </CardContent>
    </Card>
  );

  return (
    <div className="max-w-5xl mx-auto py-8">
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center p-3 bg-indigo-100 rounded-full mb-4">
          <Target className="w-8 h-8 text-indigo-600" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Focus & Engagement Results</h2>
        <p className="text-xl text-gray-600">A detailed breakdown of your webcam telemetry and behavioral focus metrics.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        <Card className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-xl">
          <CardContent className="p-8 flex flex-col sm:flex-row items-center justify-between gap-8 h-full">
            <div>
              <h3 className="text-2xl font-bold mb-2">Focus Score</h3>
              <p className="text-indigo-100 max-w-sm">
                A composite score reflecting your screen attention, face presence, and head stability.
              </p>
            </div>
            <div className="text-center">
              <div className="text-6xl font-bold mb-2">{scores.focusScore}%</div>
              <div className="text-indigo-100 font-medium">Overall Focus</div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-success-500 to-emerald-600 text-white shadow-xl">
          <CardContent className="p-8 flex flex-col sm:flex-row items-center justify-between gap-8 h-full">
            <div>
              <h3 className="text-2xl font-bold mb-2">Engagement Score</h3>
              <p className="text-success-100 max-w-sm">
                Based on your look-away patterns, face presence, and continuous interaction.
              </p>
            </div>
            <div className="text-center">
              <div className="text-6xl font-bold mb-2">{scores.engagementScore}%</div>
              <div className="text-success-100 font-medium">Overall Engagement</div>
            </div>
          </CardContent>
        </Card>
      </div>

      <h3 className="text-2xl font-bold text-gray-900 mb-6">Focus Metrics</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {renderScoreCard('Screen Focus', `${scores.screenFocusPercent.toFixed(1)}%`, 'Time spent looking at the screen.', <Monitor className="w-6 h-6" />, 'border-l-blue-500')}
        {renderScoreCard('Face Presence', `${scores.facePresencePercent.toFixed(1)}%`, 'Time your face was visible.', <Eye className="w-6 h-6" />, 'border-l-indigo-500')}
        {renderScoreCard('Look-Aways', scores.lookAwayCount, 'Total number of look-away events.', <Activity className="w-6 h-6" />, 'border-l-warning-500')}
        {renderScoreCard('Stability', `${scores.attentionStability}%`, 'Head posture and attention consistency.', <BarChart className="w-6 h-6" />, 'border-l-success-500')}
      </div>

      <h3 className="text-2xl font-bold text-gray-900 mb-6">Behavior Metrics</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        <Card className="border border-gray-200">
          <CardContent className="p-6">
            <h4 className="text-lg font-bold text-gray-900 mb-4 border-b pb-2">Telemetry Details</h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center"><span className="text-gray-600">Avg Look-Away Duration</span><span className="font-bold">{(scores.averageLookAwayDuration / 1000).toFixed(1)}s</span></div>
              <div className="flex justify-between items-center"><span className="text-gray-600">Face Lost Events</span><span className={`font-bold ${scores.faceLostEvents > 0 ? 'text-danger-600' : 'text-success-600'}`}>{scores.faceLostEvents}</span></div>
              <div className="flex justify-between items-center"><span className="text-gray-600">Head Stability Penalty</span><span className="font-bold text-warning-600">{scores.headMovementScore.toFixed(1)}</span></div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-gray-200">
          <CardContent className="p-6">
            <h4 className="text-lg font-bold text-gray-900 mb-4 border-b pb-2">Task Performance</h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center"><span className="text-gray-600">Interactive Accuracy</span><span className="font-bold">{scores.taskAccuracy.toFixed(1)}%</span></div>
              <div className="flex justify-between items-center"><span className="text-gray-600 text-sm">Task 3 & 4 combined completion score. High scores correlate strongly with engaged attention.</span></div>
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
