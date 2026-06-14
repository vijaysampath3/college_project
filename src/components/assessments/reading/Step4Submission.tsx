import React, { useState, useEffect, useRef } from 'react';
import { Headphones, RotateCcw, Send, Play, Pause } from 'lucide-react';
import { Button } from '../../../components/ui';

interface Step4SubmissionProps {
  audioBlob?: Blob | null;
  onRetake: () => void;
  onSubmit: () => void;
}

export const Step4Submission: React.FC<Step4SubmissionProps> = ({ audioBlob, onRetake, onSubmit }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  useEffect(() => {
    if (audioBlob) {
      const url = URL.createObjectURL(audioBlob);
      setAudioUrl(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [audioBlob]);

  const togglePlayback = () => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleEnded = () => {
    setIsPlaying(false);
  };

  return (
    <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm max-w-2xl mx-auto text-center">
      <div className="w-20 h-20 mx-auto rounded-full bg-success-50 text-success-600 flex items-center justify-center mb-6">
        <Headphones className="w-10 h-10" />
      </div>
      
      <h2 className="text-3xl font-bold text-gray-900 mb-4">Review Your Recording</h2>
      <p className="text-gray-600 mb-8">
        Listen to your reading to ensure the audio is clear before submitting. If there was background noise or you made significant mistakes, you can retake the assessment.
      </p>

      {audioUrl && (
        <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 mb-8">
          <audio 
            ref={audioRef} 
            src={audioUrl} 
            onEnded={handleEnded} 
            className="hidden" 
          />
          
          <div className="flex items-center justify-center gap-6">
            <button
              onClick={togglePlayback}
              className="w-14 h-14 rounded-full bg-primary-500 text-white flex items-center justify-center hover:bg-primary-600 transition-colors shadow-lg shadow-primary-500/25"
            >
              {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-1" />}
            </button>
            <div className="text-left">
              <p className="font-medium text-gray-900">Your Reading Audio</p>
              <p className="text-sm text-gray-500">{isPlaying ? 'Playing...' : 'Ready to play'}</p>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button variant="secondary" size="lg" onClick={onRetake} className="w-full sm:w-auto">
          <RotateCcw className="w-5 h-5 mr-2" />
          Retake Assessment
        </Button>
        <Button size="lg" onClick={onSubmit} className="w-full sm:w-auto">
          Submit Assessment
          <Send className="w-5 h-5 ml-2" />
        </Button>
      </div>
    </div>
  );
};
