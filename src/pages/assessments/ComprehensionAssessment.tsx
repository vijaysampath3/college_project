import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { passageService, ReadingPassage } from '../../services/passage.service';
import { assessmentService } from '../../services/assessment.service';
import { rewardsService, RewardResult } from '../../services/rewards.service';
import { ComprehensionAssessmentResult, ComprehensionMetrics, ComprehensionQuestionResult } from '../../types/ReadingAssessmentResult';
import { Button, Card, CardContent } from '../../components/ui';

import { Step1Overview } from '../../components/assessments/comprehension/Step1Overview';
import { Step2Passage } from '../../components/assessments/comprehension/Step2Passage';
import { Step3Questions } from '../../components/assessments/comprehension/Step3Questions';
import { Step4Results } from '../../components/assessments/comprehension/Step4Results';

export const ComprehensionAssessment: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [passage, setPassage] = useState<ReadingPassage | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  
  const [readingTimeSeconds, setReadingTimeSeconds] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [assessmentResult, setAssessmentResult] = useState<ComprehensionAssessmentResult | null>(null);
  const [rewardResult, setRewardResult] = useState<RewardResult | null>(null);

  const [showResumeModal, setShowResumeModal] = useState(false);
  const [unfinishedSession, setUnfinishedSession] = useState<any>(null);

  const [isInitializing, setIsInitializing] = useState(true);

  // Use refs to avoid continuous effect triggers during typing
  const stateRef = useRef({
    currentStep,
    readingTimeSeconds,
    answers,
    currentQuestionIndex
  });

  useEffect(() => {
    stateRef.current = { currentStep, readingTimeSeconds, answers, currentQuestionIndex };
  }, [currentStep, readingTimeSeconds, answers, currentQuestionIndex]);

  useEffect(() => {
    const initSession = async () => {
      if (!user) return;
      try {
        // Check for unfinished session
        const activeSession = await assessmentService.getActiveSession(user.id, 'comprehension');
        if (activeSession) {
          setUnfinishedSession(activeSession);
          setShowResumeModal(true);
        } else {
          await startNewAssessment();
        }
      } catch (err) {
        console.error("Failed to init assessment session", err);
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
      const p = await passageService.getRandomPassage(user.id);
      setPassage(p);
      
      const { id } = await assessmentService.startAssessment(user.id, 'comprehension', undefined, {
        id: p.id,
        category: p.category,
        difficulty: p.difficulty
      });
      setSessionId(id);
      setCurrentStep(1);
      setAnswers({});
      setCurrentQuestionIndex(0);
      setReadingTimeSeconds(0);
    } catch (err) {
      console.error("Failed to start new assessment session", err);
    }
  };

  const handleResumeAssessment = async () => {
    if (!user || !unfinishedSession) return;
    try {
      const p = await passageService.getPassageById(unfinishedSession.passage_id);
      if (p) {
        setPassage(p);
        setSessionId(unfinishedSession.id);
        
        const data = unfinishedSession.session_data || {};
        
        setCurrentStep(data.currentStep || 1);
        setReadingTimeSeconds(data.readingTimeSeconds || 0);
        setAnswers(data.answers || {});
        setCurrentQuestionIndex(data.currentQuestionIndex || 0);
      } else {
        // If passage is somehow missing, start over
        await startNewAssessment();
      }
    } catch (e) {
      console.error("Failed to resume", e);
      await startNewAssessment();
    } finally {
      setShowResumeModal(false);
    }
  };

  const handleAbandonAssessment = async () => {
    if (!unfinishedSession) return;
    try {
      await assessmentService.abandonSession(unfinishedSession.id);
      await startNewAssessment();
    } catch (e) {
      console.error("Failed to abandon session", e);
    } finally {
      setShowResumeModal(false);
    }
  };

  // Sync state to DB continuously
  useEffect(() => {
    if (!sessionId || currentStep === 4) return;
    
    const syncTimeout = setTimeout(() => {
      const data = {
        passageId: passage?.id,
        currentStep: stateRef.current.currentStep,
        readingTimeSeconds: stateRef.current.readingTimeSeconds,
        answers: stateRef.current.answers,
        currentQuestionIndex: stateRef.current.currentQuestionIndex,
        lastSavedAt: new Date().toISOString()
      };
      
      // Update DB
      assessmentService.updateSessionData(sessionId, data).catch(e => {
        console.error("Failed to sync session state", e);
      });
      
      // Update localStorage fallback
      if (user) {
        localStorage.setItem(`comprehension_session_${user.id}`, JSON.stringify(data));
      }
      
    }, 1000); // 1s debounce
    
    return () => clearTimeout(syncTimeout);
  }, [currentStep, readingTimeSeconds, answers, currentQuestionIndex, sessionId, passage, user]);

  const handleStartReading = () => {
    setCurrentStep(2);
  };

  const handleFinishReading = (seconds: number) => {
    setReadingTimeSeconds(seconds);
    setCurrentStep(3);
  };

  const handleAnswerChange = (questionId: string, answer: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  const handleCompleteQuestions = async () => {
    if (isSubmitting) return;
    
    console.log("[DEBUG] Submit clicked", { answers });
    if (!passage || !user || !sessionId) {
      console.error("[DEBUG] Missing required state", { passage: !!passage, user: !!user, sessionId });
      return;
    }
    
    setIsSubmitting(true);
    
    // Evaluate answers
    const questions = passage.comprehensionQuestions;
    const questionResults: ComprehensionQuestionResult[] = questions.map(q => {
      const selectedFull = answers[q.id] || '';
      
      // Extract the letter prefix (e.g., "A. " -> "A")
      const selectedLetter = selectedFull.charAt(0).toUpperCase();
      const correctLetter = q.correctAnswer.toUpperCase();
      
      const isCorrect = selectedLetter === correctLetter;
      
      console.log("[DEBUG] Scoring Question:", {
        questionId: q.id,
        selectedFull,
        selectedLetter,
        correctLetter,
        isCorrect
      });

      return {
        questionId: q.question, // Using the text itself or ID
        questionType: q.category,
        selectedAnswer: selectedFull,
        correctAnswer: q.correctAnswer,
        isCorrect
      };
    });

    let mainIdea = 0, vocabulary = 0, detailRecall = 0, inference = 0, criticalThinking = 0;
    
    questionResults.forEach(r => {
      const points = r.isCorrect ? 20 : 0;
      switch (r.questionType) {
        case 'Main Idea':
        case 'MainIdea':
          mainIdea += points; break;
        case 'Vocabulary in Context':
        case 'Vocabulary':
          vocabulary += points; break;
        case 'Detail Recall':
        case 'DetailRecall':
          detailRecall += points; break;
        case 'Inference':
          inference += points; break;
        case 'Critical Thinking':
        case 'CriticalThinking':
          criticalThinking += points; break;
      }
    });

    const totalScore = mainIdea + vocabulary + detailRecall + inference + criticalThinking;

    const metrics: ComprehensionMetrics = {
      mainIdea, vocabulary, detailRecall, inference, criticalThinking, totalScore
    };

    // Calculate Attempt Number
    let attemptNumber = 1;
    const history = await passageService.getStudentPassageHistory(user.id);
    attemptNumber += history.filter(id => id === passage.id).length;
    console.log("[DEBUG] Scoring complete", { attemptNumber, metrics, questionResults });

    // Fetch Insights
    let insights = undefined;
    let ai = undefined;
    try {
      const res = await fetch('http://localhost:8000/api/comprehension/insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ metrics })
      });
      if (res.ok) {
        const data = await res.json();
        insights = data.insights;
        ai = data.ai;
        console.log("[DEBUG] Insights generated", { insights, ai });
      } else {
        console.log("[DEBUG] API returned non-OK status", res.status);
      }
    } catch (e) {
      console.error("Failed to generate AI insights", e);
    }

    const finalResult: ComprehensionAssessmentResult = {
      attemptNumber,
      metrics,
      questionResults,
      readingTimeSeconds,
      passage: {
        id: passage.id,
        category: passage.category,
        difficulty: passage.difficulty
      },
      insights,
      ai
    };

    // Save Results
    console.log("[DEBUG] Saving results to DB...");
    await assessmentService.saveResults(user.id, 'comprehension', 'comprehension_v1', finalResult);
    await assessmentService.completeAssessment(user.id, 'comprehension', sessionId, readingTimeSeconds);
    await passageService.savePassageUsage(user.id, passage.id, passage.category);
    console.log("[DEBUG] Results saved successfully");

    // Clean up local storage
    localStorage.removeItem(`comprehension_session_${user.id}`);

    // Awards
    const rewards = await rewardsService.awardXP(
      user.id,
      'comprehension',
      metrics,
      attemptNumber > 1,
      !!insights
    );

    setAssessmentResult(finalResult);
    setRewardResult(rewards);
    console.log("[DEBUG] Step changed to results (Step 4)");
    setCurrentStep(4);
    setIsSubmitting(false);
  };

  if (isInitializing) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-secondary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (showResumeModal) {
    const questionNum = unfinishedSession?.session_data?.answers ? Object.keys(unfinishedSession.session_data.answers).length + 1 : 1;
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Resume Assessment?</h2>
            <p className="text-gray-600">You have an unfinished Reading Comprehension Assessment.</p>
            <div className="bg-gray-50 p-4 rounded-lg text-sm text-gray-700">
              <span className="font-semibold block mb-1">Progress:</span>
              {unfinishedSession?.session_data?.currentStep === 3 
                ? `Question ${Math.min(5, questionNum)} of 5`
                : unfinishedSession?.session_data?.currentStep === 2 
                  ? 'Reading Passage'
                  : 'Overview'}
            </div>
            <div className="flex flex-col gap-3">
              <Button size="lg" onClick={handleResumeAssessment} className="w-full">
                Resume Assessment
              </Button>
              <Button size="lg" variant="outline" onClick={handleAbandonAssessment} className="w-full text-error-600 border-error-200 hover:bg-error-50">
                Start New Assessment
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!passage) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-secondary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-8 px-4">
      <div className="mb-8">
        <div className="flex items-center gap-4 text-sm font-medium">
          <div className={`flex items-center gap-2 ${currentStep >= 1 ? 'text-secondary-600' : 'text-gray-400'}`}>
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${currentStep >= 1 ? 'bg-secondary-100' : 'bg-gray-100'}`}>1</div>
            Overview
          </div>
          <div className="w-12 h-px bg-gray-200" />
          <div className={`flex items-center gap-2 ${currentStep >= 2 ? 'text-secondary-600' : 'text-gray-400'}`}>
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${currentStep >= 2 ? 'bg-secondary-100' : 'bg-gray-100'}`}>2</div>
            Reading
          </div>
          <div className="w-12 h-px bg-gray-200" />
          <div className={`flex items-center gap-2 ${currentStep >= 3 ? 'text-secondary-600' : 'text-gray-400'}`}>
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${currentStep >= 3 ? 'bg-secondary-100' : 'bg-gray-100'}`}>3</div>
            Questions
          </div>
          <div className="w-12 h-px bg-gray-200" />
          <div className={`flex items-center gap-2 ${currentStep >= 4 ? 'text-secondary-600' : 'text-gray-400'}`}>
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${currentStep >= 4 ? 'bg-secondary-100' : 'bg-gray-100'}`}>4</div>
            Results
          </div>
        </div>
      </div>

      {currentStep === 1 && <Step1Overview passage={passage} onNext={handleStartReading} />}
      {currentStep === 2 && <Step2Passage passage={passage} onNext={handleFinishReading} />}
      {currentStep === 3 && (
        <Step3Questions 
          questions={passage.comprehensionQuestions} 
          answers={answers}
          currentIndex={currentQuestionIndex}
          isSubmitting={isSubmitting}
          onAnswerChange={handleAnswerChange}
          onIndexChange={setCurrentQuestionIndex}
          onComplete={handleCompleteQuestions} 
        />
      )}
      {currentStep === 4 && assessmentResult && (
        <Step4Results 
          result={assessmentResult} 
          rewardResult={rewardResult} 
          onFinish={() => navigate('/student/dashboard')} 
        />
      )}
    </div>
  );
};
