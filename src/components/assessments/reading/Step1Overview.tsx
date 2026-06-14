import React from 'react';
import { BookOpen, Target, Clock, ArrowRight } from 'lucide-react';
import { Button, Card, CardContent } from '../../../components/ui';
import { ReadingPassage } from '../../../services/passage.service';

interface Step1OverviewProps {
  passage: ReadingPassage;
  onNext: () => void;
}

export const Step1Overview: React.FC<Step1OverviewProps> = ({ passage, onNext }) => {
  const skills = [
    'Reading Accuracy',
    'Reading Fluency',
    'Reading Speed',
    'Word Recognition',
    'Pronunciation Consistency'
  ];

  return (
    <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
      <div className="w-20 h-20 rounded-2xl bg-primary-50 text-primary-600 flex items-center justify-center mb-6">
        <BookOpen className="w-10 h-10" />
      </div>
      
      <h1 className="text-3xl font-bold text-gray-900 mb-4">Reading Assessment</h1>
      <p className="text-lg text-gray-600 mb-8 max-w-2xl">
        This assessment evaluates reading fluency, reading accuracy, pronunciation quality, and reading speed. You will be asked to read a short academic passage aloud while being recorded.
      </p>

      <div className="grid md:grid-cols-2 gap-8 mb-8">
        <Card className="bg-gray-50 border-gray-100">
          <CardContent className="p-6">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-secondary-500" />
              Assessment Details
            </h3>
            <ul className="space-y-3">
              <li className="flex justify-between items-center pb-2 border-b border-gray-200">
                <span className="text-gray-600">Estimated Duration</span>
                <span className="font-medium text-gray-900">{Math.ceil(passage.expectedReadingTime / 60)} Minutes</span>
              </li>
              <li className="flex justify-between items-center pb-2 border-b border-gray-200">
                <span className="text-gray-600">Passage Topic</span>
                <span className="font-medium text-gray-900 capitalize">{passage.category} - {passage.difficulty}</span>
              </li>
              <li className="flex justify-between items-center">
                <span className="text-gray-600">Microphone Required</span>
                <span className="font-medium text-success-600">Yes</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card className="bg-primary-50 border-primary-100">
          <CardContent className="p-6">
            <h3 className="font-bold text-primary-900 mb-4 flex items-center gap-2">
              <Target className="w-5 h-5 text-primary-500" />
              Skills Measured
            </h3>
            <ul className="space-y-3">
              {skills.map((skill, idx) => (
                <li key={idx} className="flex items-center gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary-500 shrink-0" />
                  <span className="text-primary-800 font-medium">{skill}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end pt-6 border-t border-gray-100">
        <Button size="lg" onClick={onNext} className="group">
          Begin Assessment
          <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
        </Button>
      </div>
    </div>
  );
};
