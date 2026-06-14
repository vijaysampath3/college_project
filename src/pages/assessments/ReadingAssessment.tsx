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

export type AssessmentStep = 1 | 2 | 3 | 4 | 5;

export interface SessionData {
  startedAt: string | null;
  completedAt: string | null;
  duration: number | null;
  status: 'Not Started' | 'In Progress' | 'Completed';
  sessionId: string | null;
  passage: ReadingPassage | null;
  blob?: Blob | null;
  blobDuration?: number;
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
    passage: null,
    blob: null,
    blobDuration: 0,
  });

  const { user } = useAuth();

  useEffect(() => {
    // When assessment mounts, log start time
    const initAssessment = async () => {
      if (!session.startedAt && user) {
        try {
          const passage = await passageService.getRandomPassage(user.id);
          const sid = await assessmentService.startAssessment(user.id, 'reading', undefined, {
            id: passage.id,
            category: passage.category,
            difficulty: passage.difficulty
          });
          setSession(prev => ({ 
            ...prev, 
            startedAt: new Date().toISOString(), 
            status: 'In Progress', 
            sessionId: sid,
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
    const completedAt = new Date().toISOString();
    const start = new Date(session.startedAt || completedAt).getTime();
    const end = new Date(completedAt).getTime();
    const durationSeconds = Math.round((end - start) / 1000);

    const finalSession = {
      ...session,
      completedAt,
      duration: durationSeconds,
      status: 'Completed' as const
    };

    setSession(finalSession);

    if (user && session.sessionId) {
      // Supabase persist
      try {
        await assessmentService.completeAssessment(user.id, 'reading', session.sessionId, durationSeconds);
        
        let passageMeta = {};
        if (session.passage) {
          passageMeta = {
            passageId: session.passage.id,
            category: session.passage.category,
          };
          await passageService.savePassageUsage(user.id, session.passage.id, session.passage.category);
        }

        await assessmentService.saveResults(user.id, 'reading', 'reading_v1', {
          ...passageMeta,
          metrics: {
            accuracy: 88,
            wpm: 110,
            pronunciation: 84,
            wordErrors: 3
          },
          risk: {
            level: 'Moderate',
            confidence: 91
          },
          recommendations: [
            'Practice guided reading',
            'Increase reading fluency exercises'
          ]
        });
      } catch (error) {
        console.error("Failed to save to Supabase:", error);
      }
    }

    // Save to localStorage
    const savedStatus = localStorage.getItem('neurolearn_assessment_status');
    let parsedStatus: Record<string, any> = {};
    if (savedStatus) {
      try {
        parsedStatus = JSON.parse(savedStatus);
      } catch (e) {}
    }
    
    // Update basic Hub tracking
    parsedStatus['reading'] = { 
      status: 'Completed', 
      progress: 100 
    };
    localStorage.setItem('neurolearn_assessment_status', JSON.stringify(parsedStatus));

    // Save detailed session metadata
    localStorage.setItem('neurolearn_reading_session', JSON.stringify({
      assessment: 'reading',
      startedAt: finalSession.startedAt,
      completedAt: finalSession.completedAt,
      duration: finalSession.duration,
      status: finalSession.status,
      audioDuration: finalSession.blobDuration
    }));
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
        {step === 4 && <Step4Submission audioBlob={session.blob} onRetake={() => handleNextStep(3)} onSubmit={() => { handleComplete(); handleNextStep(5); }} />}
        {step === 5 && <Step5Results onReturn={handleReturnToHub} />}
      </div>
    </DashboardLayout>
  );
};

export default ReadingAssessment;
