import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent } from '../../../components/ui';
import { CPTEvent } from '../../../types/CPTAssessmentResult';

interface Step2TestProps {
  onComplete: (events: CPTEvent[], durationMinutes: number) => void;
}

const TOTAL_MINUTES = 2;
const BLOCKS = 4;
const SECONDS_PER_BLOCK = (TOTAL_MINUTES * 60) / BLOCKS; // 30 seconds
const STIMULUS_DURATION_MS = 250;
const ISIS = [1000, 2000, 4000];
const NON_TARGET_CHAR = 'X';
const TARGET_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWYZ'; // No X

type TestPhase = 'idle' | 'running' | 'done';
type DisplayState = 'cross' | 'stimulus' | 'blank';

export const Step2Test: React.FC<Step2TestProps> = ({ onComplete }) => {
  const [phase, setPhase] = useState<TestPhase>('idle');
  const [displayState, setDisplayState] = useState<DisplayState>('cross');
  const [currentLetterState, setCurrentLetterState] = useState<string>('');
  const [progressPercent, setProgressPercent] = useState(0);

  const eventsRef = useRef<CPTEvent[]>([]);
  const currentTrialRef = useRef<number>(0);
  const blockRef = useRef<number>(1);
  const stimulusShownAtRef = useRef<number>(0);
  const respondedRef = useRef<boolean>(false);
  const isTargetRef = useRef<boolean>(true);
  const currentIsiRef = useRef<number>(0);
  const currentLetterRef = useRef<string>('');

  const testStartTimeRef = useRef<number>(0);
  const timeoutRefs = useRef<NodeJS.Timeout[]>([]);

  const clearAllTimeouts = useCallback(() => {
    timeoutRefs.current.forEach(clearTimeout);
    timeoutRefs.current = [];
  }, []);

  const finishTest = useCallback(() => {
    setPhase('done');
    clearAllTimeouts();
    onComplete(eventsRef.current, TOTAL_MINUTES);
  }, [clearAllTimeouts, onComplete]);

  const scheduleNextTrial = useCallback(() => {
    const now = performance.now();
    const elapsedSecs = (now - testStartTimeRef.current) / 1000;
    
    if (elapsedSecs >= TOTAL_MINUTES * 60) {
      finishTest();
      return;
    }
    
    // Update progress
    setProgressPercent(Math.min(100, (elapsedSecs / (TOTAL_MINUTES * 60)) * 100));

    // Determine current block
    blockRef.current = Math.min(BLOCKS, Math.floor(elapsedSecs / SECONDS_PER_BLOCK) + 1);

    // Determine target vs non-target (15% non-target)
    const isTarget = Math.random() > 0.15;
    const letter = isTarget 
      ? TARGET_CHARS[Math.floor(Math.random() * TARGET_CHARS.length)]
      : NON_TARGET_CHAR;

    isTargetRef.current = isTarget;
    respondedRef.current = false;
    currentTrialRef.current += 1;
    currentIsiRef.current = ISIS[Math.floor(Math.random() * ISIS.length)];

    currentLetterRef.current = letter;
    setCurrentLetterState(letter);

    // Flow: Cross (500ms) -> Blank (250ms) -> Stimulus (250ms) -> Blank (ISI)
    setDisplayState('cross');
    
    timeoutRefs.current.push(setTimeout(() => {
      setDisplayState('blank');
      
      timeoutRefs.current.push(setTimeout(() => {
        setDisplayState('stimulus');
        stimulusShownAtRef.current = performance.now();
        
        timeoutRefs.current.push(setTimeout(() => {
          setDisplayState('blank');
          
          // Wait for ISI, then schedule next
          timeoutRefs.current.push(setTimeout(() => {
            // Log omission if not responded and it was a target
            if (!respondedRef.current) {
               eventsRef.current.push({
                 trial: currentTrialRef.current,
                 stimulus: letter,
                 isTarget: isTarget,
                 responded: false,
                 reactionTime: 0,
                 timestamp: Date.now(),
                 block: blockRef.current,
                 isi: currentIsiRef.current
               });
            }
            scheduleNextTrial();
          }, currentIsiRef.current));
          
        }, STIMULUS_DURATION_MS));
        
      }, 250)); // blank before stimulus
      
    }, 500)); // cross duration

  }, [finishTest]);

  const startTest = () => {
    setPhase('running');
    testStartTimeRef.current = performance.now();
    eventsRef.current = [];
    currentTrialRef.current = 0;
    scheduleNextTrial();
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (phase !== 'running') return;
      if (e.code === 'Space') {
        e.preventDefault();
        
        // Prevent multiple logs per trial
        if (respondedRef.current) return;
        respondedRef.current = true;
        
        const rt = performance.now() - stimulusShownAtRef.current;
        
        // Even if they respond during the fixation cross of the *next* trial, 
        // we attribute it to the current trial if we haven't scheduled next yet,
        // or just log it. For simplicity, we capture the RT from the last stimulus.
        // If RT is huge, it's a late response. If very small, it's perseveration.
        
        eventsRef.current.push({
          trial: currentTrialRef.current,
          stimulus: currentLetterRef.current,
          isTarget: isTargetRef.current,
          responded: true,
          reactionTime: rt,
          timestamp: Date.now(),
          block: blockRef.current,
          isi: currentIsiRef.current
        });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [phase]);

  if (phase === 'idle') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px]">
        <button 
          onClick={startTest}
          className="px-8 py-4 bg-primary-600 text-white text-2xl font-bold rounded-xl shadow-lg hover:bg-primary-700 transition"
        >
          Begin Test
        </button>
        <p className="mt-4 text-gray-500">Press SPACEBAR for every letter except X</p>
      </div>
    );
  }

  return (
    <Card className="max-w-4xl mx-auto border-2 border-primary-100 shadow-xl overflow-hidden">
      <div className="h-2 bg-gray-100 w-full">
        <div 
          className="h-full bg-primary-500 transition-all duration-1000 ease-linear"
          style={{ width: `${progressPercent}%` }}
        />
      </div>
      <CardContent className="p-0 flex flex-col items-center justify-center h-[500px] relative bg-white">
        {displayState === 'cross' && (
          <div className="text-8xl text-gray-400 font-light select-none">+</div>
        )}
        {displayState === 'stimulus' && (
          <div className="text-9xl font-bold text-gray-900 select-none tracking-tighter">
            {currentLetterState}
          </div>
        )}
        {displayState === 'blank' && (
          <div className="text-9xl text-transparent select-none">.</div>
        )}
      </CardContent>
    </Card>
  );
};
