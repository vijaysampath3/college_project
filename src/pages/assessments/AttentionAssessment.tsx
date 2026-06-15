import React, { useState, useEffect } from 'react';
import { Target, FileText, Activity, Brain, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { assessmentService } from '../../services/assessment.service';
import { rewardsService } from '../../services/rewards.service';
import { AttentionAssessmentResult, Task1Metrics, Task2Metrics, Task3Metrics, Task4Metrics } from '../../types/AttentionAssessmentResult';

import { Step1Overview } from '../../components/assessments/attention/Step1Overview';
import { Step2Assessment } from '../../components/assessments/attention/Step2Assessment';
import { Step3Processing } from '../../components/assessments/attention/Step3Processing';
import { Step4Results } from '../../components/assessments/attention/Step4Results';
import { Step5Insights } from '../../components/assessments/attention/Step5Insights';

export const AttentionAssessment: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [attemptNumber, setAttemptNumber] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [assessmentResult, setAssessmentResult] = useState<AttentionAssessmentResult | null>(null);

  const steps = [
    { id: 1, title: 'Overview', icon: <FileText className="w-5 h-5" /> },
    { id: 2, title: 'Assessment', icon: <Target className="w-5 h-5" /> },
    { id: 3, title: 'Processing', icon: <Activity className="w-5 h-5" /> },
    { id: 4, title: 'Results', icon: <Brain className="w-5 h-5" /> },
    { id: 5, title: 'AI Feedback', icon: <Brain className="w-5 h-5" /> }
  ];

  useEffect(() => {
    const initSession = async () => {
      if (!user) return;
      try {
        const { id: newSessionId, attemptNumber: newAttemptNum } = await assessmentService.startAssessment(user.id, 'attention');
        setSessionId(newSessionId);
        setAttemptNumber(newAttemptNum);
      } catch (error: any) {
        console.error("Failed to initialize Attention session", error);
      }
    };
    initSession();
  }, [user]);

  const handleAssessmentComplete = async (rawMetrics: { task1: Task1Metrics, task2: Task2Metrics, task3: Task3Metrics, task4: Task4Metrics }) => {
    let validSessionId = sessionId;
    let validAttempt = attemptNumber;

    if (!validSessionId && user) {
      try {
        const res = await assessmentService.startAssessment(user.id, 'attention');
        validSessionId = res.id;
        validAttempt = res.attemptNumber;
      } catch (e) {
        console.error("Fallback session creation failed", e);
      }
    }

    if (isSubmitting) return;
    setIsSubmitting(true);
    setCurrentStep(3); // Move to Processing immediately

    try {
      // Send raw metrics to scoring engine
      const scoreRes = await fetch('http://localhost:8000/api/attention/score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(rawMetrics)
      });

      if (!scoreRes.ok) {
        throw new Error("Failed to score attention assessment");
      }

      const scoreData = await scoreRes.json();
      
      const resultPayload: AttentionAssessmentResult = {
        sessionId: validSessionId || 'fallback-' + Date.now(),
        attemptNumber: validAttempt,
        rawMetrics,
        scores: scoreData.scores,
        insights: scoreData.insights
      };

      if (user && validSessionId) {
        // Assume overall test took around 3-4 minutes (240s)
        await assessmentService.completeAssessment(user.id, 'attention', validSessionId, 240);
        await assessmentService.saveResults(user.id, 'attention', 'attention_v1', resultPayload);
        
        await rewardsService.awardXP(
          user.id,
          'attention',
          {
            score: scoreData.scores.overallAttention,
            accuracy: (rawMetrics.task1.correctClicks / (rawMetrics.task1.correctClicks + rawMetrics.task1.missedTargets)) * 100,
            avgRT: (rawMetrics.task1.reactionTimes.concat(rawMetrics.task4.reactionTimes).reduce((a, b) => a + b, 0) / 
                   (rawMetrics.task1.reactionTimes.length + rawMetrics.task4.reactionTimes.length)) || 1000,
            falseClicks: rawMetrics.task1.falseClicks + rawMetrics.task2.distractorClicks + rawMetrics.task4.falsePositives
          },
          validAttempt > 1,
          !!scoreData.insights
        );
      }

      setAssessmentResult(resultPayload);
      setCurrentStep(4); // Move to Results
    } catch (error) {
      console.error("Error processing attention assessment:", error);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <button 
          onClick={() => navigate('/student/assessments')}
          className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Assessments
        </button>

        {/* Custom 5-Step Stepper */}
        <div className="mb-12">
          <div className="flex justify-between items-center relative">
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-gray-200 -z-10 rounded-full"></div>
            <div 
              className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-primary-500 -z-10 rounded-full transition-all duration-500"
              style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
            ></div>

            {steps.map((step) => {
              const isCompleted = step.id < currentStep;
              const isCurrent = step.id === currentStep;
              
              return (
                <div key={step.id} className="flex flex-col items-center gap-2 bg-gray-50 px-2">
                  <div className={`
                    w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300
                    ${isCompleted ? 'bg-primary-500 text-white' : 
                      isCurrent ? 'bg-white border-4 border-primary-500 text-primary-600 shadow-md scale-110' : 
                      'bg-white border-2 border-gray-200 text-gray-400'}
                  `}>
                    {step.icon}
                  </div>
                  <span className={`text-sm font-medium ${isCurrent ? 'text-primary-700' : isCompleted ? 'text-gray-900' : 'text-gray-400'}`}>
                    {step.title}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Step Content */}
        <div className="animate-fade-in">
          {currentStep === 1 && <Step1Overview onNext={() => setCurrentStep(2)} />}
          {currentStep === 2 && <Step2Assessment onComplete={handleAssessmentComplete} />}
          {currentStep === 3 && <Step3Processing />}
          {currentStep === 4 && assessmentResult && <Step4Results result={assessmentResult} onNext={() => setCurrentStep(5)} />}
          {currentStep === 5 && assessmentResult && <Step5Insights result={assessmentResult} onFinish={() => navigate('/student/dashboard')} />}
        </div>
      </div>
    </div>
  );
};
