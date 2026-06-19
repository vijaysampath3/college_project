import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Compass, Target, Activity, Brain } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { assessmentService } from '../../services/assessment.service';
import { rewardsService } from '../../services/rewards.service';
import { LearningBehaviourResult, LearningBehaviourRawMetrics } from '../../types/LearningBehaviourResult';

import { Step1Overview } from '../../components/assessments/learning-behaviour/Step1Overview';
import { Step2Assessment } from '../../components/assessments/learning-behaviour/Step2Assessment';
import { Step3Processing } from '../../components/assessments/learning-behaviour/Step3Processing';
import { Step4Results } from '../../components/assessments/learning-behaviour/Step4Results';
import { Step5Insights } from '../../components/assessments/learning-behaviour/Step5Insights';

export const LearningBehaviourAssessment: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [attemptNumber, setAttemptNumber] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [assessmentResult, setAssessmentResult] = useState<LearningBehaviourResult | null>(null);
  const [processingError, setProcessingError] = useState<string | null>(null);

  const steps = [
    { id: 1, title: 'Overview', icon: <Compass className="w-5 h-5" /> },
    { id: 2, title: 'Assessment', icon: <Target className="w-5 h-5" /> },
    { id: 4, title: 'Results', icon: <Activity className="w-5 h-5" /> },
    { id: 5, title: 'AI Profile', icon: <Brain className="w-5 h-5" /> }
  ];

  useEffect(() => {
    const initSession = async () => {
      if (!user) return;
      try {
        const { id: newSessionId, attemptNumber: newAttemptNum } = await assessmentService.startAssessment(user.id, 'learning-behaviour');
        setSessionId(newSessionId);
        setAttemptNumber(newAttemptNum);
      } catch (error) {
        console.error("Failed to initialize session", error);
      }
    };
    initSession();
  }, [user]);

  const handleAssessmentComplete = async (telemetry: LearningBehaviourRawMetrics) => {
    let validSessionId = sessionId;
    let validAttempt = attemptNumber;

    if (!validSessionId && user) {
      try {
        const res = await assessmentService.startAssessment(user.id, 'learning-behaviour');
        validSessionId = res.id;
        validAttempt = res.attemptNumber;
      } catch (e) {
        console.error("Fallback session creation failed", e);
      }
    }

    if (isSubmitting) return;
    setIsSubmitting(true);
    setProcessingError(null);
    setCurrentStep(3); // Move to Processing

    try {
      const scoreRes = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}/learning-behaviour/score`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(telemetry)
      });

      if (!scoreRes.ok) {
        throw new Error("Failed to process learning behaviour assessment");
      }

      const data = await scoreRes.json();
      
      const resultPayload: LearningBehaviourResult = {
        sessionId: validSessionId || 'fallback-' + Date.now(),
        attemptNumber: validAttempt,
        scores: data.scores,
        profile: data.profile,
        insights: data.insights,
        rawMetrics: telemetry
      };

      if (user && validSessionId) {
        await assessmentService.completeAssessment(user.id, 'learning-behaviour', validSessionId, 300); // approx 5 mins
        await assessmentService.saveResults(user.id, 'learning-behaviour', 'lb_v1', resultPayload as any);
        
        await rewardsService.awardXP(
          user.id,
          'learning-behaviour',
          { ...data.scores, ...telemetry }, // merge scores and raw telemetry for rewards conditions
          validAttempt > 1,
          !!data.insights
        );
      }

      setAssessmentResult(resultPayload);
      
      // Delay to allow processing animation to finish (at least 6 seconds)
      setTimeout(() => {
        setCurrentStep(4);
      }, 6500);

    } catch (error: any) {
      console.error("Error processing assessment:", error);
      setProcessingError(error.message || "An error occurred while processing your results.");
      setIsSubmitting(false);
    }
  };

  // Determine current active step for the top stepper (map processing to assessment)
  const getDisplayStep = () => {
    if (currentStep === 3) return 2;
    return currentStep;
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

        {/* Custom Stepper */}
        <div className="mb-12">
          <div className="flex justify-between items-center relative">
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-gray-200 -z-10 rounded-full"></div>
            
            {/* Dynamic Progress Line calculation mapping real steps to display steps */}
            <div 
              className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-primary-500 -z-10 rounded-full transition-all duration-500"
              style={{ width: `${
                getDisplayStep() === 1 ? 0 :
                getDisplayStep() === 2 ? 33.3 :
                getDisplayStep() === 4 ? 66.6 : 100
              }%` }}
            ></div>

            {steps.map((step) => {
              const isCompleted = step.id < getDisplayStep();
              const isCurrent = step.id === getDisplayStep();
              
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
