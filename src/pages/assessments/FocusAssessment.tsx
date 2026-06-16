import React, { useState, useEffect } from 'react';
import { Camera, Eye, Activity, Target, Brain, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { assessmentService } from '../../services/assessment.service';
import { rewardsService } from '../../services/rewards.service';
import { FocusAssessmentResult } from '../../types/FocusAssessmentResult';

import { Step1Overview } from '../../components/assessments/focus/Step1Overview';
import { Step2Assessment, FocusRawTelemetry } from '../../components/assessments/focus/Step2Assessment';
import { Step3Processing } from '../../components/assessments/focus/Step3Processing';
import { Step4Results } from '../../components/assessments/focus/Step4Results';
import { Step5Insights } from '../../components/assessments/focus/Step5Insights';

export const FocusAssessment: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [attemptNumber, setAttemptNumber] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [assessmentResult, setAssessmentResult] = useState<FocusAssessmentResult | null>(null);
  const [processingError, setProcessingError] = useState<string | null>(null);

  const steps = [
    { id: 1, title: 'Overview', icon: <Eye className="w-5 h-5" /> },
    { id: 2, title: 'Tracking', icon: <Camera className="w-5 h-5" /> },
    { id: 3, title: 'Processing', icon: <Activity className="w-5 h-5" /> },
    { id: 4, title: 'Results', icon: <Target className="w-5 h-5" /> },
    { id: 5, title: 'AI Feedback', icon: <Brain className="w-5 h-5" /> }
  ];

  useEffect(() => {
    const initSession = async () => {
      if (!user) return;
      try {
        const { id: newSessionId, attemptNumber: newAttemptNum } = await assessmentService.startAssessment(user.id, 'focus');
        setSessionId(newSessionId);
        setAttemptNumber(newAttemptNum);
      } catch (error: any) {
        console.error("Failed to initialize Focus session", error);
      }
    };
    initSession();
  }, [user]);

  const handleAssessmentComplete = async (telemetry: FocusRawTelemetry) => {
    let validSessionId = sessionId;
    let validAttempt = attemptNumber;

    if (!validSessionId && user) {
      try {
        const res = await assessmentService.startAssessment(user.id, 'focus');
        validSessionId = res.id;
        validAttempt = res.attemptNumber;
      } catch (e) {
        console.error("Fallback session creation failed", e);
      }
    }

    if (isSubmitting) return;
    setIsSubmitting(true);
    setProcessingError(null);
    setCurrentStep(3); // Move to Processing immediately

    try {
      // Calculate derived metrics from raw telemetry
      const screenFocusPercent = telemetry.totalFrames > 0 
        ? ((telemetry.totalFrames - telemetry.lookAwayFrames) / telemetry.totalFrames) * 100 
        : 0;
      
      const facePresencePercent = telemetry.totalFrames > 0
        ? (telemetry.faceVisibleFrames / telemetry.totalFrames) * 100
        : 0;
        
      const averageLookAwayDuration = telemetry.lookAwayCount > 0
        ? telemetry.totalLookAwayDurationMs / telemetry.lookAwayCount
        : 0;
        
      const headMovementScore = telemetry.totalFrames > 0
        ? Math.max(0, 100 - (telemetry.headStabilityAccumulator / telemetry.totalFrames) * 100)
        : 100;

      const payload = {
        facePresencePercent,
        screenFocusPercent,
        lookAwayCount: telemetry.lookAwayCount,
        averageLookAwayDuration,
        headMovementScore,
        taskAccuracy: telemetry.taskAccuracy,
        faceLostEvents: telemetry.faceLostEvents,
        gazeTrackingEnabled: false,
        gazeMetrics: null
      };

      // Send metrics to scoring engine
      const scoreRes = await fetch('http://localhost:8000/api/focus/score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!scoreRes.ok) {
        throw new Error("Failed to score focus assessment");
      }

      const scoreData = await scoreRes.json();
      
      const resultPayload: FocusAssessmentResult = {
        sessionId: validSessionId || 'fallback-' + Date.now(),
        attemptNumber: validAttempt,
        scores: scoreData.scores,
        insights: scoreData.insights,
        rawMetrics: {
          gazeTrackingEnabled: false,
          gazeMetrics: null
        }
      };

      if (user && validSessionId) {
        // Assume overall test took around 3 minutes (180s)
        await assessmentService.completeAssessment(user.id, 'focus', validSessionId, 180);
        await assessmentService.saveResults(user.id, 'focus', 'focus_v1', resultPayload as any);
        
        await rewardsService.awardXP(
          user.id,
          'focus',
          scoreData.scores,
          validAttempt > 1,
          !!scoreData.insights
        );
      }

      setAssessmentResult(resultPayload);
      
      // Add a small artificial delay so the user sees the processing animation complete
      setTimeout(() => {
        setCurrentStep(4); // Move to Results
      }, 5000);
      
    } catch (error: any) {
      console.error("Error processing focus assessment:", error);
      setProcessingError(error.message || "An error occurred while processing your results.");
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
          {processingError && currentStep === 3 && (
            <div className="max-w-md mx-auto p-4 mb-6 bg-danger-50 border border-danger-200 text-danger-700 rounded-xl">
              <h4 className="font-bold mb-1">Processing Failed</h4>
              <p className="text-sm">{processingError}</p>
              <button 
                onClick={() => setCurrentStep(2)}
                className="mt-3 px-4 py-2 bg-white border border-danger-200 rounded-lg text-sm font-medium hover:bg-danger-50"
              >
                Try Again
              </button>
            </div>
          )}
          
          {currentStep === 1 && <Step1Overview onNext={() => setCurrentStep(2)} />}
          {currentStep === 2 && <Step2Assessment onComplete={handleAssessmentComplete} />}
          {currentStep === 3 && !processingError && <Step3Processing />}
          {currentStep === 4 && assessmentResult && <Step4Results result={assessmentResult} onNext={() => setCurrentStep(5)} />}
          {currentStep === 5 && assessmentResult && <Step5Insights result={assessmentResult} onFinish={() => navigate('/student/dashboard')} />}
        </div>
      </div>
    </div>
  );
};
