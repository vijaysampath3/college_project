import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Step1Overview } from '../../components/assessments/cpt/Step1Overview';
import { Step2Test } from '../../components/assessments/cpt/Step2Test';
import { StepProcessing } from '../../components/assessments/cpt/StepProcessing';
import { Step3Results } from '../../components/assessments/cpt/Step3Results';
import { Step4Insights } from '../../components/assessments/cpt/Step4Insights';
import { CPTAssessmentResult, CPTEvent } from '../../types/CPTAssessmentResult';
import { useAuth } from '../../context/AuthContext';
import { assessmentService } from '../../services/assessment.service';
import { rewardsService } from '../../services/rewards.service';

export const CPTAssessment: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [currentStep, setCurrentStep] = useState(1);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [attemptNumber, setAttemptNumber] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [assessmentResult, setAssessmentResult] = useState<CPTAssessmentResult | null>(null);
  const [debugError, setDebugError] = useState<string | null>(null);

  useEffect(() => {
    const initSession = async () => {
      if (!user) return;
      try {
        const { sessionId: newSessionId, attemptNumber: newAttemptNum } = await assessmentService.startAssessment(user.id, 'cpt');
        setSessionId(newSessionId);
        setAttemptNumber(newAttemptNum);
      } catch (error: any) {
        console.error("Failed to initialize CPT session", error);
        setDebugError("Init session failed: " + error.message);
      }
    };
    initSession();
  }, [user]);

  const handleCompleteTest = async (events: CPTEvent[], durationMinutes: number) => {
    const validSessionId = sessionId || "fallback-session-" + Date.now();
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    // Move to Processing Screen immediately
    setCurrentStep(3);

    try {
      console.log("[CPT Flow] Requesting metrics and model inference");
      // 1. Calculate metrics and run inference
      const scoreRes = await fetch('http://localhost:8000/api/adhd/score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ events, durationMinutes })
      });
      if (!scoreRes.ok) throw new Error("Failed to calculate CPT score");
      const { metrics, inference } = await scoreRes.json();

      console.log("[CPT Flow] Generating AI Insights");
      // 2. Generate insights
      let insights = null;
      try {
        const insightsRes = await fetch('http://localhost:8000/api/adhd/insights', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ metrics, inference })
        });
        if (insightsRes.ok) {
          const data = await insightsRes.json();
          insights = data.insights;
        }
      } catch (e) {
        console.error("Failed to fetch insights", e);
      }
      
      let finalSessionId = sessionId;
      let finalAttemptNumber = attemptNumber;

      if (!finalSessionId) {
        console.log("[CPT Flow] Session ID was missing, creating one now...");
        try {
          const res = await assessmentService.startAssessment(user.id, 'cpt');
          finalSessionId = res.id;
          finalAttemptNumber = res.attemptNumber;
          setSessionId(finalSessionId);
          setAttemptNumber(finalAttemptNumber);
        } catch (e) {
          console.error("Failed to create fallback session", e);
        }
      }

      const resultPayload: CPTAssessmentResult = {
        sessionId: finalSessionId || "fallback-session-" + Date.now(),
        attemptNumber: finalAttemptNumber,
        metrics,
        inference,
        insights
      };

      if (user && finalSessionId) {
        console.log("[CPT Flow] Saving results to DB with session:", finalSessionId);
        // 3. Mark complete and save results
        await assessmentService.completeAssessment(user.id, 'cpt', finalSessionId, durationMinutes * 60);
        await assessmentService.saveResults(user.id, 'cpt', 'cpt_v1', resultPayload);

        // 4. Award XP (Achievements for CPT to be added in rewards config)
        await rewardsService.awardXP(
          user.id, 
          'cpt', 
          {
            omissions: metrics["Raw Score Omissions"],
            commissions: metrics["Raw Score Commissions"],
            hitSE: metrics["Raw Score HitSE"]
          },
          attemptNumber > 1,
          !!insights
        );
      } else {
        console.warn("[CPT Flow] User or Session ID missing, skipping DB save");
      }

      setAssessmentResult(resultPayload);
      console.log("[CPT Flow] Flow complete. Transitioning to Results.");
      setCurrentStep(4);
      
    } catch (error) {
      console.error("[CPT Flow] Error processing CPT:", error);
      // Fallback
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Progress Header */}
        <div className="mb-8">
          <div className="flex items-center justify-center gap-4 sm:gap-8">
            <div className={`flex items-center gap-2 ${currentStep >= 1 ? 'text-primary-600 font-bold' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${currentStep >= 1 ? 'bg-primary-100' : 'bg-gray-100'}`}>1</div>
              <span className="hidden sm:inline">Overview</span>
            </div>
            <div className={`h-1 w-12 sm:w-24 rounded-full ${currentStep >= 2 ? 'bg-primary-600' : 'bg-gray-200'}`}></div>
            <div className={`flex items-center gap-2 ${currentStep >= 2 ? 'text-primary-600 font-bold' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${currentStep >= 2 ? 'bg-primary-100' : 'bg-gray-100'}`}>2</div>
              <span className="hidden sm:inline">CPT Test</span>
            </div>
            <div className={`h-1 w-12 sm:w-24 rounded-full ${currentStep >= 4 ? 'bg-primary-600' : 'bg-gray-200'}`}></div>
            <div className={`flex items-center gap-2 ${currentStep >= 4 ? 'text-primary-600 font-bold' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${currentStep >= 4 ? 'bg-primary-100' : 'bg-gray-100'}`}>3</div>
              <span className="hidden sm:inline">Results</span>
            </div>
            <div className={`h-1 w-12 sm:w-24 rounded-full ${currentStep >= 5 ? 'bg-primary-600' : 'bg-gray-200'}`}></div>
            <div className={`flex items-center gap-2 ${currentStep >= 5 ? 'text-primary-600 font-bold' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${currentStep >= 5 ? 'bg-primary-100' : 'bg-gray-100'}`}>4</div>
              <span className="hidden sm:inline">AI Feedback</span>
            </div>
          </div>
        </div>

        {/* Step Content */}
        {debugError && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <strong>Error:</strong> {debugError}
          </div>
        )}
        
        {currentStep === 1 && <Step1Overview onNext={() => setCurrentStep(2)} />}
        
        {currentStep === 2 && <Step2Test onComplete={handleCompleteTest} />}
        
        {currentStep === 3 && <StepProcessing />}
        
        {currentStep === 4 && assessmentResult && (
          <Step3Results 
            result={assessmentResult} 
            onViewInsights={() => setCurrentStep(5)} 
          />
        )}
        
        {currentStep === 5 && assessmentResult && (
          <Step4Insights 
            result={assessmentResult} 
            onFinish={() => navigate('/student/dashboard')} 
          />
        )}
      </div>
    </div>
  );
};
