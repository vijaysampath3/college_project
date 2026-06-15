import React, { useEffect, useState } from 'react';
import { Clock, ArrowRight } from 'lucide-react';
import { Button, Card } from '../../../components/ui';
import { ReadingPassage } from '../../../services/passage.service';

interface Step2PassageProps {
  passage: ReadingPassage;
  onNext: (readingTimeSeconds: number) => void;
}

export const Step2Passage: React.FC<Step2PassageProps> = ({ passage, onNext }) => {
  const [startTime] = useState(Date.now());
  const [readingTimeSeconds, setReadingTimeSeconds] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setReadingTimeSeconds(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    return () => clearInterval(timer);
  }, [startTime]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const handleFinishReading = () => {
    onNext(readingTimeSeconds);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{passage.title}</h2>
          <p className="text-gray-500 capitalize">{passage.category} • {passage.difficulty} difficulty</p>
        </div>
        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full border border-gray-200 shadow-sm">
          <Clock className="w-5 h-5 text-gray-400" />
          <span className="font-medium text-gray-700 font-mono text-lg">
            {formatTime(readingTimeSeconds)}
          </span>
        </div>
      </div>

      <Card className="bg-white border-gray-200">
        <div className="p-8 prose prose-lg max-w-none text-gray-800 leading-relaxed">
          {passage.text.split('\n').map((paragraph, idx) => (
            <p key={idx} className="mb-4 last:mb-0">
              {paragraph}
            </p>
          ))}
        </div>
      </Card>

      <div className="flex justify-between items-center bg-gray-50 p-6 rounded-2xl border border-gray-100">
        <div className="text-gray-600">
          Read the passage carefully. You cannot return to the passage once you begin the questions.
        </div>
        <Button size="lg" onClick={handleFinishReading} className="group">
          I'm Ready for Questions
          <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
        </Button>
      </div>
    </div>
  );
};
