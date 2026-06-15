import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { DashboardLayout } from '../components/layout';
import { BookOpen, Keyboard, Target, Brain, Activity, Clock, CheckCircle2, ArrowLeft, PlayCircle } from 'lucide-react';
import { Button, Card, CardContent } from '../components/ui';
import ReadingAssessment from './assessments/ReadingAssessment';
import { ComprehensionAssessment } from './assessments/ComprehensionAssessment';
import { TypingAssessment } from './assessments/TypingAssessment';
import { CPTAssessment } from './assessments/CPTAssessment';
import { AttentionAssessment } from './assessments/AttentionAssessment';

// Shared config with Hub (in a real app this would come from an API/context)
const assessmentDetails: Record<string, any> = {
  'reading': {
    title: 'Reading Assessment',
    description: 'Evaluate your reading fluency, accuracy, and comprehension through interactive text passages.',
    duration: '15 mins',
    icon: <BookOpen className="w-8 h-8" />,
    skills: ['Phonemic Awareness', 'Reading Fluency', 'Vocabulary Comprehension', 'Visual Tracking'],
    instructions: [
      'Ensure you are in a quiet environment.',
      'Read the passage presented on the screen aloud.',
      'Answer the multiple-choice questions that follow each passage.',
      'Do not pause the timer once started.'
    ]
  },
  'typing': {
    title: 'Typing Assessment',
    description: 'Measure your typing speed and accuracy to assess motor skills and coordination.',
    duration: '10 mins',
    icon: <Keyboard className="w-8 h-8" />,
    skills: ['Fine Motor Skills', 'Hand-Eye Coordination', 'Processing Speed', 'Keyboard Familiarity'],
    instructions: [
      'Place your fingers on the home row.',
      'Type the words exactly as they appear on the screen.',
      'Accuracy is more important than speed.',
      'The assessment will automatically end after 10 minutes.'
    ]
  },
  'attention': {
    title: 'Attention Assessment',
    description: 'Track your sustained attention and focus through continuous performance tasks.',
    duration: '20 mins',
    icon: <Target className="w-8 h-8" />,
    skills: ['Sustained Attention', 'Impulse Control', 'Reaction Time', 'Selective Attention'],
    instructions: [
      'Focus on the center of the screen.',
      'Press the spacebar ONLY when you see the target symbol.',
      'Do not press any keys for non-target symbols.',
      'Stay as focused as possible for the entire duration.'
    ]
  },
  'comprehension': {
    title: 'Reading Comprehension',
    description: 'Advanced assessment of your ability to understand and interpret complex text.',
    duration: '25 mins',
    icon: <Brain className="w-8 h-8" />,
    skills: ['Inferential Thinking', 'Working Memory', 'Syntactic Processing', 'Semantic Memory'],
    instructions: [
      'Read the provided texts carefully.',
      'You may re-read the text before answering the questions.',
      'Some questions have multiple correct answers.',
      'Take your time to understand the context.'
    ]
  },
  'learning-behaviour': {
    title: 'Learning Behaviour',
    description: 'Identify your preferred learning styles and behavioural patterns in educational settings.',
    duration: '15 mins',
    icon: <Activity className="w-8 h-8" />,
    skills: ['Self-Regulation', 'Learning Preferences', 'Metacognition', 'Task Persistence'],
    instructions: [
      'There are no right or wrong answers in this section.',
      'Answer honestly based on how you usually behave.',
      'Select the option that best describes you.',
      'Complete all questions to get an accurate profile.'
    ]
  },
  'cpt': {
    title: 'CPT Assessment (ADHD Risk)',
    description: 'Continuous Performance Test designed to measure sustained attention and impulsivity.',
    duration: '2 mins',
    icon: <Brain className="w-8 h-8" />,
    skills: ['Sustained Attention', 'Impulse Control', 'Reaction Time', 'Selective Attention'],
    instructions: [
      'Focus on the center of the screen.',
      'Press the spacebar ONLY when you see the target symbol.',
      'Do not press any keys for non-target symbols (X).',
      'Stay as focused as possible for the entire 2 minutes.'
    ]
  }
};

const AssessmentPlaceholder: React.FC = () => {
  const { type } = useParams<{ type: string }>();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'Not Started' | 'In Progress' | 'Completed'>('Not Started');
  
  const details = type ? assessmentDetails[type] : null;

  useEffect(() => {
    if (type && type !== 'reading') {
      const savedStatus = localStorage.getItem('neurolearn_assessment_status');
      if (savedStatus) {
        try {
          const parsedStatus = JSON.parse(savedStatus);
          if (parsedStatus[type]) {
            setStatus(parsedStatus[type].status);
          }
        } catch (e) {
          console.error(e);
        }
      }
    }
  }, [type]);

  if (type === 'reading') {
    return <ReadingAssessment />;
  }

  if (type === 'comprehension') {
    return <ComprehensionAssessment />;
  }

  if (type === 'typing') {
    return <TypingAssessment />;
  }

  if (type === 'cpt') {
    return <CPTAssessment />;
  }

  if (type === 'attention') {
    return <AttentionAssessment />;
  }

  if (!details) {
    return (
      <DashboardLayout role="student" title="Assessment Not Found">
        <div className="flex flex-col items-center justify-center h-full">
          <h2 className="text-2xl font-bold mb-4">Assessment Not Found</h2>
          <Button onClick={() => navigate('/student/assessments')}>Go Back</Button>
        </div>
      </DashboardLayout>
    );
  }

  const handleStartOrComplete = () => {
    let newStatus: 'In Progress' | 'Completed' = 'In Progress';
    
    // For demo purposes, if it's already in progress, mark it complete.
    // If it's not started, mark it in progress.
    if (status === 'Not Started') {
      newStatus = 'In Progress';
    } else if (status === 'In Progress') {
      newStatus = 'Completed';
    } else {
      // If completed, maybe reset or just go back
      navigate('/student/assessments');
      return;
    }

    setStatus(newStatus);
    
    const savedStatus = localStorage.getItem('neurolearn_assessment_status');
    let parsedStatus: Record<string, any> = {};
    if (savedStatus) {
      try {
        parsedStatus = JSON.parse(savedStatus);
      } catch (e) {}
    }
    
    parsedStatus[type!] = { 
      status: newStatus, 
      progress: newStatus === 'Completed' ? 100 : 50 
    };
    
    localStorage.setItem('neurolearn_assessment_status', JSON.stringify(parsedStatus));
    
    if (newStatus === 'Completed') {
      navigate('/student/assessments');
    }
  };

  return (
    <DashboardLayout role="student" title={details.title}>
      <div className="max-w-4xl mx-auto">
        <Link 
          to="/student/assessments" 
          className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Assessments
        </Link>

        <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm mb-8">
          <div className="flex flex-col md:flex-row gap-8 items-start">
            <div className="w-20 h-20 rounded-2xl bg-primary-50 text-primary-600 flex items-center justify-center shrink-0">
              {details.icon}
            </div>
            
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-4 mb-3">
                <h1 className="text-3xl font-bold text-gray-900">{details.title}</h1>
                {status === 'Completed' ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-success-50 text-success-700 text-sm font-medium">
                    <CheckCircle2 className="w-4 h-4" /> Completed
                  </span>
                ) : status === 'In Progress' ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-warning-50 text-warning-700 text-sm font-medium">
                    <Activity className="w-4 h-4" /> In Progress
                  </span>
                ) : null}
              </div>
              
              <p className="text-lg text-gray-600 mb-6">{details.description}</p>
              
              <div className="flex items-center gap-6 text-gray-500 mb-8 pb-8 border-b border-gray-100">
                <div className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-lg">
                  <Clock className="w-5 h-5 text-gray-400" />
                  <span className="font-medium text-gray-900">Estimated Duration:</span>
                  <span>{details.duration}</span>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-8 mb-8">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Target className="w-5 h-5 text-primary-500" />
                    Skills Measured
                  </h3>
                  <ul className="space-y-3">
                    {details.skills.map((skill: string, index: number) => (
                      <li key={index} className="flex items-start gap-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary-400 mt-2 shrink-0" />
                        <span className="text-gray-600">{skill}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-secondary-500" />
                    Instructions
                  </h3>
                  <ul className="space-y-3">
                    {details.instructions.map((inst: string, index: number) => (
                      <li key={index} className="flex items-start gap-3">
                        <span className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-sm font-medium text-gray-600 shrink-0">
                          {index + 1}
                        </span>
                        <span className="text-gray-600 pt-0.5">{inst}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="bg-primary-50 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-6 border border-primary-100">
                <div>
                  <h4 className="font-bold text-primary-900 mb-1">Ready to begin?</h4>
                  <p className="text-sm text-primary-700">Ensure you have {details.duration} of uninterrupted time.</p>
                </div>
                <Button size="lg" onClick={handleStartOrComplete} className="w-full sm:w-auto shrink-0 shadow-lg shadow-primary-500/25">
                  <span className="flex items-center gap-2">
                    {status === 'Not Started' ? 'Start Assessment' : status === 'In Progress' ? 'Simulate Completion' : 'Back to Hub'}
                    <PlayCircle className="w-5 h-5" />
                  </span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AssessmentPlaceholder;
