import React, { useState, useEffect, useRef } from 'react';
import { Mic, Square, Play, Pause, AlertCircle, CheckCircle2, BookOpen } from 'lucide-react';
import { Button } from '../../../components/ui';
import { ReadingPassage } from '../../../services/passage.service';

interface Step3RecordingProps {
  passage: ReadingPassage;
  onNext: (blob: Blob, duration: number) => void;
}

export const Step3Recording: React.FC<Step3RecordingProps> = ({ passage, onNext }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [recordingFinished, setRecordingFinished] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);

  const MAX_DURATION = 300; // 5 minutes

  useEffect(() => {
    return () => {
      stopTimer();
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
    };
  }, []);

  useEffect(() => {
    if (timeElapsed >= MAX_DURATION && isRecording) {
      handleStopRecording();
    }
  }, [timeElapsed]);

  const startTimer = () => {
    timerRef.current = window.setInterval(() => {
      setTimeElapsed(prev => prev + 1);
    }, 1000);
  };

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const handleStartRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      
      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        stream.getTracks().forEach(track => track.stop());
      };

      chunksRef.current = [];
      mediaRecorderRef.current.start();
      setIsRecording(true);
      setIsPaused(false);
      startTimer();
    } catch (err) {
      console.error("Error accessing microphone:", err);
      alert("Could not access microphone. Please check permissions.");
    }
  };

  const handlePauseResume = () => {
    if (!mediaRecorderRef.current) return;

    if (isPaused) {
      mediaRecorderRef.current.resume();
      startTimer();
      setIsPaused(false);
    } else {
      mediaRecorderRef.current.pause();
      stopTimer();
      setIsPaused(true);
    }
  };

  const handleStopRecording = () => {
    if (!mediaRecorderRef.current || mediaRecorderRef.current.state === 'inactive') return;
    
    mediaRecorderRef.current.stop();
    stopTimer();
    setIsRecording(false);
    setIsPaused(false);
    setRecordingFinished(true);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Left: Passage Reminder */}
        <div className="lg:w-1/2 flex flex-col">
          <div className="mb-4 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-gray-500" />
            <h3 className="font-bold text-gray-900">Passage Text</h3>
          </div>
          <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 flex-1 overflow-y-auto max-h-96">
            <h4 className="font-bold mb-3 text-gray-900">{passage.title}</h4>
            <div className="text-gray-700 leading-relaxed text-lg space-y-4">
              {passage.text.split('\n\n').map((para, idx) => (
                <p key={idx}>{para}</p>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Recording Interface */}
        <div className="lg:w-1/2 flex flex-col items-center justify-center p-8 bg-gradient-to-b from-gray-50 to-white rounded-2xl border border-gray-100">
          
          <div className="mb-8 w-full">
            <div className="flex justify-between text-sm font-medium text-gray-500 mb-2">
              <span>Time Remaining</span>
              <span className={MAX_DURATION - timeElapsed <= 30 ? 'text-danger-600' : ''}>
                {formatTime(MAX_DURATION - timeElapsed)}
              </span>
            </div>
            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-1000 ${MAX_DURATION - timeElapsed <= 30 ? 'bg-danger-500' : 'bg-primary-500'}`}
                style={{ width: `${(timeElapsed / MAX_DURATION) * 100}%` }}
              />
            </div>
          </div>

          {/* Visualizer */}
          <div className="h-24 w-full flex items-center justify-center gap-1.5 mb-8">
            {Array.from({ length: 16 }).map((_, i) => (
              <div
                key={i}
                className={`w-2 rounded-full transition-all duration-150 ${
                  isRecording && !isPaused
                    ? 'bg-primary-500 animate-pulse'
                    : 'bg-gray-200 h-2'
                }`}
                style={{
                  height: isRecording && !isPaused ? `${Math.max(20, Math.random() * 100)}%` : '8px',
                  animationDelay: `${i * 0.05}s`
                }}
              />
            ))}
          </div>

          <div className="text-3xl font-mono font-bold text-gray-900 mb-8 tracking-wider">
            {formatTime(timeElapsed)}
          </div>

          <div className="flex items-center gap-4">
            {!isRecording && !recordingFinished ? (
              <Button size="lg" onClick={handleStartRecording} className="rounded-full w-20 h-20 shadow-lg shadow-primary-500/25">
                <Mic className="w-8 h-8" />
              </Button>
            ) : null}

            {isRecording && (
              <>
                <button
                  onClick={handlePauseResume}
                  className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors"
                >
                  {isPaused ? <Play className="w-6 h-6" /> : <Pause className="w-6 h-6" />}
                </button>
                <button
                  onClick={handleStopRecording}
                  className="w-20 h-20 rounded-full bg-danger-50 flex items-center justify-center text-danger-600 hover:bg-danger-100 transition-colors border-2 border-danger-100"
                >
                  <Square className="w-8 h-8" />
                </button>
              </>
            )}

            {recordingFinished && (
              <div className="flex flex-col items-center gap-4">
                <div className="flex items-center gap-2 text-success-600 font-medium">
                  <CheckCircle2 className="w-5 h-5" />
                  Recording Saved
                </div>
                <Button onClick={() => onNext(audioBlob!, timeElapsed)}>
                  Proceed to Review
                </Button>
              </div>
            )}
          </div>
          
          <div className="mt-8 text-center text-sm text-gray-500">
            {!isRecording && !recordingFinished && "Click the microphone to start recording"}
            {isRecording && !isPaused && "Recording in progress. Read clearly."}
            {isPaused && "Recording paused"}
          </div>

        </div>
      </div>
    </div>
  );
};


