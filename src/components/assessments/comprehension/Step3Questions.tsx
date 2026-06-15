import React, { useState } from 'react';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import { Button, Card, CardContent } from '../../../components/ui';
import { ComprehensionQuestion } from '../../../services/passage.service';

interface Step3QuestionsProps {
  questions: ComprehensionQuestion[];
  answers: Record<string, string>;
  currentIndex: number;
  isSubmitting?: boolean;
  onAnswerChange: (questionId: string, answer: string) => void;
  onIndexChange: (index: number) => void;
  onComplete: () => void;
}

export const Step3Questions: React.FC<Step3QuestionsProps> = ({ 
  questions, 
  answers,
  currentIndex,
  isSubmitting = false,
  onAnswerChange,
  onIndexChange,
  onComplete 
}) => {

  const currentQuestion = questions[currentIndex];

  const handleSelectOption = (option: string) => {
    onAnswerChange(currentQuestion.id, option);
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      onIndexChange(currentIndex + 1);
    } else {
      onComplete();
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      onIndexChange(currentIndex - 1);
    }
  };

  const isAnswered = !!answers[currentQuestion.id];

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Question {currentIndex + 1} of {questions.length}</h2>
        <div className="flex gap-1">
          {questions.map((q, idx) => (
            <div 
              key={q.id}
              className={`w-3 h-3 rounded-full ${
                idx === currentIndex ? 'bg-secondary-500' :
                answers[q.id] ? 'bg-secondary-200' : 'bg-gray-200'
              }`}
            />
          ))}
        </div>
      </div>

      <Card className="bg-white border-gray-200">
        <CardContent className="p-8">
          <h3 className="text-xl font-medium text-gray-900 mb-6">
            {currentQuestion.question}
          </h3>

          <div className="space-y-4">
            {currentQuestion.options.map((option, idx) => {
              const isSelected = answers[currentQuestion.id] === option;
              return (
                <button
                  key={idx}
                  onClick={() => handleSelectOption(option)}
                  className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                    isSelected 
                      ? 'border-secondary-500 bg-secondary-50 text-secondary-900' 
                      : 'border-gray-100 hover:border-secondary-200 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 ${
                      isSelected ? 'border-secondary-500' : 'border-gray-300'
                    }`}>
                      {isSelected && <div className="w-3 h-3 rounded-full bg-secondary-500" />}
                    </div>
                    <span className="text-lg">{option}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between pt-6 border-t border-gray-100">
        <Button 
          variant="outline" 
          onClick={handlePrev} 
          disabled={currentIndex === 0}
          className="group"
        >
          <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
          Previous
        </Button>
        <Button 
          size="lg" 
          onClick={handleNext} 
          disabled={!isAnswered || isSubmitting}
          className="group"
        >
          {currentIndex === questions.length - 1 ? (isSubmitting ? 'Submitting...' : 'Submit Assessment') : 'Next Question'}
          {currentIndex !== questions.length - 1 && (
            <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
          )}
        </Button>
      </div>
    </div>
  );
};
