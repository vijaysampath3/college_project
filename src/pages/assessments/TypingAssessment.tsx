import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { typingPassageService, TypingPassage } from '../../services/typing-passage.service';
import { assessmentService } from '../../services/assessment.service';
import { rewardsService, RewardResult } from '../../services/rewards.service';
import { Step1Overview } from '../../components/assessments/typing/Step1Overview';
import { Step2TypingTest } from '../../components/assessments/typing/Step2TypingTest';
import { StepProcessing } from '../../components/assessments/typing/StepProcessing';
import { Step3Results } from '../../components/assessments/typing/Step3Results';
import { Step4Insights } from '../../components/assessments/typing/Step4Insights';
import { 
  TypingAssessmentResult, 
  KeystrokeLog, 
  FocusLossEvent, 
  TypingMetrics,
  TypingInsights
} from '../../types/TypingAssessmentResult';

export const TypingAssessment: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [passage, setPassage] = useState<TypingPassage | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [attemptNum, setAttemptNum] = useState<number>(1);
  
  const [isInitializing, setIsInitializing] = useState(true);
  
  const [assessmentResult, setAssessmentResult] = useState<TypingAssessmentResult | null>(null);
  const [rewardResult, setRewardResult] = useState<RewardResult | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGeneratingInsights, setIsGeneratingInsights] = useState(false);

  useEffect(() => {
    const initSession = async () => {
      if (!user) return;
      try {
        await startNewAssessment();
      } catch (err) {
        console.error("Failed to init typing session", err);
      } finally {
        setIsInitializing(false);
      }
    };
    initSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const startNewAssessment = async () => {
    if (!user) return;
    try {
      const p = await typingPassageService.getRandomPassage();
      setPassage(p);
      
      const { id, attemptNumber } = await assessmentService.startAssessment(user.id, 'typing', undefined, {
        id: p.id,
        category: p.category,
        difficulty: p.difficulty
      });
      setSessionId(id);
      setAttemptNum(attemptNumber);
      setCurrentStep(1);
    } catch (err) {
      console.error("Failed to start new assessment session", err);
    }
  };

  // calculateMetrics moved to backend

  const handleCompleteTest = async (
    keystrokes: KeystrokeLog[], 
    focusLossEvents: FocusLossEvent[], 
    startTime: number, 
    endTime: number
  ) => {
    if (!passage || !user || !sessionId || isSubmitting) return;
    console.log("[Typing Flow] Typing test completed");
    setIsSubmitting(true);

    let metricsToUse = null;

    try {
      console.log("[Typing Flow] Fetching metrics from backend...");
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}/typing/score`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          keystrokes,
          focusLossEvents,
          startTime,
          endTime,
          expectedText: passage.text
        })
      });

      if (!res.ok) throw new Error("Failed to calculate score");
      const { metrics } = await res.json();
      metricsToUse = metrics;
      console.log("[Typing Flow] Metrics calculated successfully", metrics);
      
      await assessmentService.completeAssessment(user.id, 'typing', sessionId, metrics.completionTimeSeconds);
      console.log("[Typing Flow] Assessment marked complete in DB");
      
    } catch (e) {
      console.error("[Typing Flow] Error completing typing test", e);
      // Fallback metrics if backend failed
      if (!metricsToUse) {
         console.log("[Typing Flow] Using fallback metrics due to error");
         metricsToUse = {
            wpm: 0, accuracy: 0, totalKeystrokes: keystrokes.length,
            backspaceCount: 0, errorCount: 0, correctedErrors: 0, uncorrectedErrors: 0,
            completionTimeSeconds: 60, pauseEvents: 0, averagePauseDurationMs: 0, longestPauseDurationMs: 0,
            omissions: 0, insertions: 0, substitutions: 0, transpositions: 0,
            repeatedLetters: 0, capitalizationErrors: 0, punctuationErrors: 0, wordBoundaryErrors: 0
         };
      }
    } finally {
      if (metricsToUse) {
        const prelimResult: TypingAssessmentResult = {
          sessionId,
          attemptNumber: attemptNum,
          metrics: metricsToUse,
          difficulty: passage.difficulty,
          passage: { id: passage.id, category: passage.category, title: passage.title },
          focusLossEvents,
          keystrokes: [] 
        };
        setAssessmentResult(prelimResult);
        setCurrentStep(3);
        console.log("[Typing Flow] Step changed to Results (Step 3)");
      }
      setIsSubmitting(false);
    }
  };

  const handleGenerateInsights = async () => {
    if (!assessmentResult || !user) return;
    console.log("[Typing Flow] Typing insights request started");
    setIsGeneratingInsights(true);
    setCurrentStep(4);

    let updatedResult = { ...assessmentResult };

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}/typing/insights`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ metrics: assessmentResult.metrics, difficulty: assessmentResult.difficulty })
      });
      
      if (res.ok) {
        const data = await res.json();
        console.log("[Typing Flow] Typing insights response received");
        updatedResult.insights = data.insights;
        updatedResult.ai = data.ai;
      } else {
         console.warn("[Typing Flow] Insights fetch failed, using fallback insights.");
      }
    } catch (e) {
      console.error("[Typing Flow] Failed to fetch typing insights", e);
    }

    try {
      console.log("[Typing Flow] Saving results to Supabase...");
      await assessmentService.saveResults(user.id, 'typing', 'typing_v1', updatedResult);
      console.log("[Typing Flow] Results saved to Supabase");

      const rewards = await rewardsService.awardXP(user.id, 'typing', {
        metrics: {
          accuracy: updatedResult.metrics.accuracy,
          wpm: updatedResult.metrics.wpm,
          pauses: updatedResult.metrics.pauseEvents
        },
        aiFeedbackReceived: !!updatedResult.insights,
        attemptNumber: attemptNum,
        difficulty: passage.difficulty
      });

      console.log("[Typing Flow] Results state set with Insights");
      setAssessmentResult(updatedResult);
      setRewardResult(rewards);

    } catch (e) {
      console.error("[Typing Flow] Error in insight saving flow", e);
    } finally {
      setIsGeneratingInsights(false);
    }
  };

  if (isInitializing) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!passage) return <div>Failed to load passage.</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-16">
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
            <span className="hidden sm:inline">Typing Test</span>
          </div>
          <div className={`h-1 w-12 sm:w-24 rounded-full ${currentStep >= 3 ? 'bg-primary-600' : 'bg-gray-200'}`}></div>
          <div className={`flex items-center gap-2 ${currentStep >= 3 ? 'text-primary-600 font-bold' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${currentStep >= 3 ? 'bg-primary-100' : 'bg-gray-100'}`}>3</div>
            <span className="hidden sm:inline">Results</span>
          </div>
          <div className={`h-1 w-12 sm:w-24 rounded-full ${currentStep >= 4 ? 'bg-primary-600' : 'bg-gray-200'}`}></div>
          <div className={`flex items-center gap-2 ${currentStep >= 4 ? 'text-primary-600 font-bold' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${currentStep >= 4 ? 'bg-primary-100' : 'bg-gray-100'}`}>4</div>
            <span className="hidden sm:inline">AI Feedback</span>
          </div>
        </div>
      </div>

      <div className="min-h-[500px]">
        {currentStep === 1 && (
          <Step1Overview passage={passage} onNext={() => setCurrentStep(2)} />
        )}
        
        {currentStep === 2 && !isSubmitting && (
          <Step2TypingTest 
            passage={passage} 
            onComplete={handleCompleteTest}
          />
        )}

        {currentStep === 2 && isSubmitting && (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
          </div>
        )}
        
        {currentStep === 3 && assessmentResult && (
          <Step3Results 
            result={assessmentResult} 
            rewardResult={null} 
            onNext={handleGenerateInsights} 
          />
        )}

        {currentStep === 4 && isGeneratingInsights && (
          <StepProcessing />
        )}

        {currentStep === 4 && !isGeneratingInsights && assessmentResult && (
          <Step4Insights 
            result={assessmentResult}
            onFinish={() => navigate('/student/dashboard')}
          />
        )}
      </div>
    </div>
  );
};
