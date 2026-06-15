import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../../components/layout';
import { useAuth } from '../../context/AuthContext';
import { assessmentService } from '../../services/assessment.service';
import { passageService, ReadingPassage } from '../../services/passage.service';
import { Step1Overview } from '../../components/assessments/reading/Step1Overview';
import { Step2Passage } from '../../components/assessments/reading/Step2Passage';
import { Step3Recording } from '../../components/assessments/reading/Step3Recording';
import { Step4Submission } from '../../components/assessments/reading/Step4Submission';
import { Step5Results } from '../../components/assessments/reading/Step5Results';
import { backendService } from '../../services/backend.service';
import { rewardsService, RewardResult } from '../../services/rewards.service';

export type AssessmentStep = 1 | 2 | 3 | 4 | 5;

export interface SessionData {
  startedAt: string | null;
  completedAt: string | null;
  duration: number | null;
  status: 'Not Started' | 'In Progress' | 'Completed';
  sessionId: string | null;
  attemptNumber: number | null;
  passage: ReadingPassage | null;
  blob?: Blob | null;
  blobDuration?: number;
  transcriptData?: any;
  metricsData?: any;
  processingTime?: number;
  insightsData?: any;
  aiData?: any;
  rewardResult?: RewardResult;
}

const ReadingAssessment: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<AssessmentStep>(1);
  const [session, setSession] = useState<SessionData>({
    startedAt: null,
    completedAt: null,
    duration: null,
    status: 'Not Started',
    sessionId: null,
    attemptNumber: null,
    passage: null,
    blob: null,
    blobDuration: 0,
    transcriptData: null,
    metricsData: null
  });
  
  const [isProcessing, setIsProcessing] = useState(false);

  const { user } = useAuth();

  useEffect(() => {
    // When assessment mounts, log start time
    const initAssessment = async () => {
      if (!session.startedAt && user) {
        try {
          const passage = await passageService.getRandomPassage(user.id);
          const sessionMeta = await assessmentService.startAssessment(user.id, 'reading', undefined, {
            id: passage.id,
            category: passage.category,
            difficulty: passage.difficulty
          });
          setSession(prev => ({ 
            ...prev, 
            startedAt: new Date().toISOString(), 
            status: 'In Progress', 
            sessionId: sessionMeta.id,
            attemptNumber: sessionMeta.attemptNumber,
            passage: passage 
          }));
        } catch (error) {
          console.error("Failed to start assessment:", error);
          // Fallback to local only if network fails
          setSession(prev => ({ ...prev, startedAt: new Date().toISOString(), status: 'In Progress' }));
        }
      }
    };
    initAssessment();
  }, [user]);

  const handleNextStep = (nextStep: AssessmentStep, additionalData?: Partial<SessionData>) => {
    if (additionalData) {
      setSession(prev => ({ ...prev, ...additionalData }));
    }
    setStep(nextStep);
  };

  const handleComplete = async () => {
    if (!user || !session.sessionId || !session.passage || !session.blob) return;

    setIsProcessing(true);

    try {
      const completedAt = new Date().toISOString();
      const start = new Date(session.startedAt || completedAt).getTime();
      const end = new Date(completedAt).getTime();
      const durationSeconds = Math.round((end - start) / 1000);

      // Process audio via backend Whisper service
      const processStart = performance.now();
      const backendResult = await backendService.processAudio(
        session.blob, 
        session.passage.text, 
        session.blobDuration || durationSeconds || 60,
        session.passage.category,
        session.passage.difficulty
      );
      const processingTime = parseFloat(((performance.now() - processStart) / 1000).toFixed(2));

      const finalSession = {
        ...session,
        completedAt,
        duration: durationSeconds,
        status: 'Completed' as const,
        transcriptData: backendResult.transcript,
        metricsData: backendResult.metrics,
        insightsData: backendResult.insights,
        aiData: backendResult.ai,
        processingTime
      };

      setSession(finalSession);

      // Save to Supabase
      await assessmentService.completeAssessment(user.id, 'reading', session.sessionId, durationSeconds);
      
      await passageService.savePassageUsage(user.id, session.passage.id, session.passage.category);

      const payload = {
        attemptNumber: session.attemptNumber || 1,
        transcript: backendResult.transcript.text,
        metrics: {
          accuracy: backendResult.metrics.accuracy,
          wpm: backendResult.metrics.wpm,
          wer: backendResult.metrics.wer,
          coverage: backendResult.metrics.coverage,
          similarity: backendResult.metrics.similarity
        },
        wordAnalysis: {
          matched: backendResult.metrics.details.matchedWords,
          missing: backendResult.metrics.details.missingWords,
          extra: backendResult.metrics.details.extraWords,
          substituted: backendResult.metrics.details.substitutedWords,
          expected: backendResult.metrics.details.expectedWords
        },
        passage: {
          id: session.passage.id,
          category: session.passage.category,
          difficulty: session.passage.difficulty
        },
        whisper: {
          model: 'faster-whisper-base',
          confidence: backendResult.transcript.confidence,
          processingTime: processingTime
        },
        alignment: backendResult.metrics.details.alignment,
        insights: backendResult.insights,
        ai: backendResult.ai
      };

      await assessmentService.saveResults(user.id, 'reading', 'reading_v1', payload);

      // Award XP
      const isRetake = (session.attemptNumber || 1) > 1;
      const hasInsights = !!backendResult.insights;
      const rewardResult = await rewardsService.awardXP(
        user.id, 
        'reading', 
        { accuracy: backendResult.metrics.accuracy }, 
        isRetake, 
        hasInsights
      );

      finalSession.rewardResult = rewardResult;
      setSession(finalSession);

      // Save to localStorage for UI state
      const savedStatus = localStorage.getItem('neurolearn_assessment_status');
      let parsedStatus: Record<string, any> = {};
      if (savedStatus) {
        try {
          parsedStatus = JSON.parse(savedStatus);
        } catch (e) {}
      }
      
      parsedStatus['reading'] = { status: 'Completed', progress: 100 };
      localStorage.setItem('neurolearn_assessment_status', JSON.stringify(parsedStatus));

      localStorage.setItem('neurolearn_reading_session', JSON.stringify({
        assessment: 'reading',
        startedAt: finalSession.startedAt,
        completedAt: finalSession.completedAt,
        duration: finalSession.duration,
        status: finalSession.status,
        audioDuration: finalSession.blobDuration
      }));

      handleNextStep(5);
    } catch (error) {
      console.error("Failed to complete assessment:", error);
      alert("Error processing audio. Make sure the backend server is running.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReturnToHub = () => {
    navigate('/student/assessments');
  };

  if (!session.passage) {
    return (
      <DashboardLayout role="student" title="Reading Assessment">
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500">Loading assessment...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="student" title="Reading Assessment">
      <div className="max-w-4xl mx-auto pb-12">
        {step === 1 && <Step1Overview passage={session.passage} onNext={() => handleNextStep(2)} />}
        {step === 2 && <Step2Passage passage={session.passage} onNext={() => handleNextStep(3)} />}
        {step === 3 && <Step3Recording passage={session.passage} onNext={(blob, duration) => handleNextStep(4, { blob, blobDuration: duration })} />}
        {step === 4 && <Step4Submission audioBlob={session.blob} isProcessing={isProcessing} onRetake={() => handleNextStep(3)} onSubmit={handleComplete} />}
        {step === 5 && <Step5Results session={session} onReturn={handleReturnToHub} />}
      </div>
    </DashboardLayout>
  );
};

export default ReadingAssessment;
