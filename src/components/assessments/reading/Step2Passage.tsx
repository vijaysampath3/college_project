import React from 'react';
import { BookOpen, AlertCircle, Clock, ArrowRight } from 'lucide-react';
import { Button } from '../../../components/ui';
import { ReadingPassage } from '../../../services/passage.service';

interface Step2PassageProps {
  passage: ReadingPassage;
  onNext: () => void;
}

export const Step2Passage: React.FC<Step2PassageProps> = ({ passage, onNext }) => {

  return (
    <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
      <div className="flex items-center gap-3 mb-6 pb-6 border-b border-gray-100">
        <div className="w-12 h-12 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center shrink-0">
          <BookOpen className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Reading Passage</h2>
          <p className="text-gray-500">Read the passage below silently to familiarize yourself, then proceed.</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-4 mb-6">
        <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-lg text-sm font-medium text-gray-700">
          <BookOpen className="w-4 h-4 text-gray-400" />
          Word Count: {passage.wordCount}
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-lg text-sm font-medium text-gray-700">
          <AlertCircle className="w-4 h-4 text-gray-400" />
          Difficulty: <span className="capitalize">{passage.difficulty}</span>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-lg text-sm font-medium text-gray-700">
          <Clock className="w-4 h-4 text-gray-400" />
          Estimated Time: {Math.ceil(passage.expectedReadingTime / 60)} mins
        </div>
      </div>

      <div className="bg-gray-50 rounded-2xl p-8 border border-gray-100 mb-8">
        <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">{passage.title}</h3>
        <div className="prose prose-lg text-gray-700 leading-relaxed max-w-none">
          {passage.text.split('\n\n').map((paragraph, idx) => (
            <p key={idx} className="mb-4">{paragraph}</p>
          ))}
        </div>
      </div>

      <div className="flex justify-between items-center pt-6 border-t border-gray-100">
        <p className="text-sm text-gray-500 font-medium">Ready to record yourself reading?</p>
        <Button size="lg" onClick={onNext} className="group">
          Proceed to Recording
          <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
        </Button>
      </div>
    </div>
  );
};
