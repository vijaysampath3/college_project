import React, { useState } from 'react';
import { Step2Task1TargetDetection } from './Step2Task1TargetDetection';
import { Step2Task2SymbolSearch } from './Step2Task2SymbolSearch';
import { Step2Task3PatternMatching } from './Step2Task3PatternMatching';
import { Step2Task4RapidScanning } from './Step2Task4RapidScanning';
import { 
  Task1Metrics, 
  Task2Metrics, 
  Task3Metrics, 
  Task4Metrics 
} from '../../../types/AttentionAssessmentResult';

interface Props {
  onComplete: (metrics: {
    task1: Task1Metrics;
    task2: Task2Metrics;
    task3: Task3Metrics;
    task4: Task4Metrics;
  }) => void;
}

export const Step2Assessment: React.FC<Props> = ({ onComplete }) => {
  const [currentTask, setCurrentTask] = useState<1 | 2 | 3 | 4>(1);
  const [metrics, setMetrics] = useState<{
    task1?: Task1Metrics;
    task2?: Task2Metrics;
    task3?: Task3Metrics;
    task4?: Task4Metrics;
  }>({});

  const handleTask1Complete = (m: Task1Metrics) => {
    setMetrics(prev => ({ ...prev, task1: m }));
    setCurrentTask(2);
  };

  const handleTask2Complete = (m: Task2Metrics) => {
    setMetrics(prev => ({ ...prev, task2: m }));
    setCurrentTask(3);
  };

  const handleTask3Complete = (m: Task3Metrics) => {
    setMetrics(prev => ({ ...prev, task3: m }));
    setCurrentTask(4);
  };

  const handleTask4Complete = (m: Task4Metrics) => {
    const finalMetrics = {
      task1: metrics.task1!,
      task2: metrics.task2!,
      task3: metrics.task3!,
      task4: m
    };
    onComplete(finalMetrics);
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Internal Task Progress */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
            Assessment Progress
          </span>
          <span className="text-sm font-bold text-primary-600">
            Task {currentTask} of 4
          </span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden flex">
          {[1, 2, 3, 4].map(step => (
            <div 
              key={step}
              className={`h-full flex-1 border-r border-white/50 transition-all duration-500
                ${step < currentTask ? 'bg-primary-500' : step === currentTask ? 'bg-primary-300' : 'bg-transparent'}
              `}
            />
          ))}
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 sm:p-10">
        {currentTask === 1 && <Step2Task1TargetDetection onComplete={handleTask1Complete} />}
        {currentTask === 2 && <Step2Task2SymbolSearch onComplete={handleTask2Complete} />}
        {currentTask === 3 && <Step2Task3PatternMatching onComplete={handleTask3Complete} />}
        {currentTask === 4 && <Step2Task4RapidScanning onComplete={handleTask4Complete} />}
      </div>
    </div>
  );
};
