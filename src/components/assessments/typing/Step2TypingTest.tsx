import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, RotateCcw, AlertTriangle } from 'lucide-react';
import { Button, Card, CardContent } from '../../../components/ui';
import { TypingPassage } from '../../../services/typing-passage.service';
import { KeystrokeLog, FocusLossEvent } from '../../../types/TypingAssessmentResult';

interface Step2TypingTestProps {
  passage: TypingPassage;
  onComplete: (
    keystrokes: KeystrokeLog[], 
    focusLossEvents: FocusLossEvent[], 
    startTime: number, 
    endTime: number
  ) => void;
}

const WARMUP_TEXT = "The quick brown fox jumps over the lazy dog. This is a thirty second warmup to get your fingers ready for the actual assessment. Focus on accuracy and rhythm.";
const WARMUP_DURATION_SEC = 30;

export const Step2TypingTest: React.FC<Step2TypingTestProps> = ({ passage, onComplete }) => {
  const [phase, setPhase] = useState<'idle' | 'warmup' | 'warmup_done' | 'test' | 'done'>('idle');
  const [textToType, setTextToType] = useState(WARMUP_TEXT);
  const [typedText, setTypedText] = useState("");
  const [startTime, setStartTime] = useState<number | null>(null);
  
  const [timeLeft, setTimeLeft] = useState(WARMUP_DURATION_SEC);
  
  // Analytics
  const [keystrokes, setKeystrokes] = useState<KeystrokeLog[]>([]);
  const [focusLossEvents, setFocusLossEvents] = useState<FocusLossEvent[]>([]);
  
  const lastKeyTimeRef = useRef<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [isFocused, setIsFocused] = useState(true);
  const blurTimeRef = useRef<number | null>(null);

  // Focus tracking
  useEffect(() => {
    const handleFocus = () => {
      setIsFocused(true);
      if (blurTimeRef.current && (phase === 'warmup' || phase === 'test')) {
        const duration = Date.now() - blurTimeRef.current;
        setFocusLossEvents(prev => [...prev, {
          type: 'window_blur',
          timestamp: new Date().toISOString(),
          durationMs: duration
        }]);
      }
      blurTimeRef.current = null;
      inputRef.current?.focus();
    };

    const handleBlur = () => {
      setIsFocused(false);
      if (phase === 'warmup' || phase === 'test') {
        blurTimeRef.current = Date.now();
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        handleBlur();
      } else {
        handleFocus();
      }
    };

    window.addEventListener('focus', handleFocus);
    window.addEventListener('blur', handleBlur);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('blur', handleBlur);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [phase]);

  // Warmup Timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (phase === 'warmup' && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    } else if (phase === 'warmup' && timeLeft === 0) {
      setPhase('warmup_done');
    }
    return () => clearInterval(timer);
  }, [phase, timeLeft]);

  // Auto focus input
  useEffect(() => {
    if (phase === 'warmup' || phase === 'test') {
      inputRef.current?.focus();
    }
  }, [phase]);

  const startWarmup = () => {
    setTextToType(WARMUP_TEXT);
    setTypedText("");
    setTimeLeft(WARMUP_DURATION_SEC);
    setPhase('warmup');
  };

  const startTest = () => {
    setTextToType(passage.text);
    setTypedText("");
    setKeystrokes([]);
    setFocusLossEvents([]);
    setStartTime(Date.now());
    lastKeyTimeRef.current = Date.now();
    setPhase('test');
  };

  const finishTest = useCallback(() => {
    setPhase('done');
    if (startTime) {
      onComplete(keystrokes, focusLossEvents, startTime, Date.now());
    }
  }, [startTime, keystrokes, focusLossEvents, onComplete]);

  // Handle typing
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (phase !== 'warmup' && phase !== 'test') return;
    
    // Ignore meta keys
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    if (e.key.length > 1 && e.key !== 'Backspace') return;

    e.preventDefault();

    const now = Date.now();
    const timeSinceLast = lastKeyTimeRef.current ? now - lastKeyTimeRef.current : 0;
    lastKeyTimeRef.current = now;

    if (e.key === 'Backspace') {
      if (typedText.length > 0) {
        setTypedText(prev => prev.slice(0, -1));
        
        if (phase === 'test') {
          setKeystrokes(prev => [...prev, {
            key: 'Backspace',
            timestamp: new Date(now).toISOString(),
            expectedCharacter: textToType[typedText.length - 1] || '',
            isCorrect: false,
            timeSinceLastKeyMs: timeSinceLast
          }]);
        }
      }
    } else {
      const expectedChar = textToType[typedText.length];
      if (!expectedChar) return; // Reached end

      const isCorrect = e.key === expectedChar;
      const newTyped = typedText + e.key;
      setTypedText(newTyped);

      if (phase === 'test') {
        setKeystrokes(prev => [...prev, {
          key: e.key,
          timestamp: new Date(now).toISOString(),
          expectedCharacter: expectedChar,
          isCorrect,
          timeSinceLastKeyMs: timeSinceLast
        }]);

        // Check if finished
        if (newTyped.length === textToType.length) {
          finishTest();
        }
      } else if (phase === 'warmup') {
        if (newTyped.length === textToType.length) {
          setPhase('warmup_done');
        }
      }
    }
  };

  const renderText = () => {
    return textToType.split('').map((char, index) => {
      let className = "text-2xl font-mono relative transition-colors duration-75 ";
      
      if (index < typedText.length) {
        if (typedText[index] === char) {
          className += "text-success-600 bg-success-50";
        } else {
          className += "text-error-600 bg-error-50";
          // If space was expected but wrong char typed
          if (char === ' ') {
            className += " underline decoration-error-500 decoration-4";
          }
        }
      } else if (index === typedText.length) {
        className += "text-primary-600 bg-primary-50 relative";
        return (
          <span key={index} className={className}>
            <span className="absolute left-0 top-0 bottom-0 w-[3px] bg-primary-500 animate-pulse"></span>
            {char}
          </span>
        );
      } else {
        className += "text-gray-400";
      }

      return (
        <span key={index} className={className}>
          {char}
        </span>
      );
    });
  };

  return (
    <div className="max-w-5xl mx-auto">
      {phase === 'idle' && (
        <div className="text-center py-20">
          <Button size="lg" onClick={startWarmup} className="px-10 py-6 text-xl rounded-2xl">
            Start Warmup (30s)
            <Play className="w-6 h-6 ml-2" />
          </Button>
        </div>
      )}

      {phase === 'warmup_done' && (
        <div className="text-center py-20">
          <div className="w-20 h-20 bg-success-100 text-success-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertTriangle className="w-10 h-10" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Warmup Complete</h2>
          <p className="text-gray-600 mb-8">Your fingers should be ready. The real assessment begins now. Metrics will be recorded.</p>
          <Button size="lg" onClick={startTest} className="px-10 py-6 text-xl rounded-2xl shadow-xl shadow-primary-500/25">
            Start Scored Assessment
            <Play className="w-6 h-6 ml-2" />
          </Button>
        </div>
      )}

      {(phase === 'warmup' || phase === 'test') && (
        <Card className={`border-2 transition-all duration-300 ${isFocused ? 'border-primary-200 shadow-xl' : 'border-error-300 shadow-none opacity-50'}`}>
          <CardContent className="p-10 relative">
            
            <div className="flex justify-between items-center mb-8">
              <div className="flex items-center gap-3">
                <span className={`px-4 py-1.5 rounded-full text-sm font-bold uppercase tracking-wider ${phase === 'warmup' ? 'bg-warning-100 text-warning-700' : 'bg-error-100 text-error-700 animate-pulse'}`}>
                  {phase === 'warmup' ? 'Warmup Phase' : 'Scoring Active'}
                </span>
                {phase === 'warmup' && (
                  <span className="text-gray-500 font-mono font-medium">{timeLeft}s remaining</span>
                )}
              </div>
              
              <div className="text-gray-400 font-medium font-mono text-sm">
                {Math.round((typedText.length / textToType.length) * 100)}% Complete
              </div>
            </div>

            {!isFocused && (
              <div className="absolute inset-0 z-10 bg-white/80 backdrop-blur-sm flex items-center justify-center rounded-2xl">
                <div className="text-center">
                  <AlertTriangle className="w-12 h-12 text-warning-500 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Click to Resume</h3>
                  <p className="text-gray-600">The assessment is paused because the window lost focus.</p>
                </div>
              </div>
            )}

            <div 
              ref={containerRef}
              className="relative rounded-xl p-8 bg-gray-50/50 min-h-[300px] cursor-text select-none outline-none"
              onClick={() => inputRef.current?.focus()}
            >
              <input
                ref={inputRef}
                type="text"
                className="opacity-0 absolute top-0 left-0 w-full h-full cursor-text z-0"
                onKeyDown={handleKeyDown}
                onBlur={() => setIsFocused(false)}
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck="false"
              />
              
              <div className="relative z-10 leading-relaxed tracking-wide pointer-events-none whitespace-pre-wrap">
                {renderText()}
              </div>
            </div>
            
          </CardContent>
        </Card>
      )}
    </div>
  );
};
