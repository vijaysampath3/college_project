import React, { useState, useRef } from 'react';
import { Task1PatternLearning } from './Task1PatternLearning';
import { Task2RuleApplication } from './Task2RuleApplication';
import { Task3PersistenceChallenge } from './Task3PersistenceChallenge';
import { LearningBehaviourRawMetrics } from '../../../types/LearningBehaviourResult';

interface Props {
  onComplete: (metrics: LearningBehaviourRawMetrics) => void;
}

export const Step2Assessment: React.FC<Props> = ({ onComplete }) => {
  const [currentTask, setCurrentTask] = useState(1);
  
  const telemetryRef = useRef<LearningBehaviourRawMetrics>({
    task1: null as any,
    task2: null as any,
    task3: null as any
  });

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden min-h-[500px] flex flex-col relative">
        
        {/* Internal Progress Bar (hidden from top-level stepper) */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gray-100 z-10">
          <div 
            className="h-full bg-primary-500 transition-all duration-500"
            style={{ width: `${((currentTask - 1) / 3) * 100}%` }}
          />
        </div>

        <div className="flex-1 p-6 flex flex-col">
          {currentTask === 1 && (
            <Task1PatternLearning 
              onComplete={(metrics) => {
                telemetryRef.current.task1 = metrics;
                setCurrentTask(2);
              }} 
            />
          )}

          {currentTask === 2 && (
            <Task2RuleApplication 
              onComplete={(metrics) => {
                telemetryRef.current.task2 = metrics;
                setCurrentTask(3);
              }} 
            />
          )}

          {currentTask === 3 && (
            <Task3PersistenceChallenge 
              onComplete={(metrics) => {
                telemetryRef.current.task3 = metrics;
                onComplete(telemetryRef.current);
              }} 
            />
          )}
        </div>
      </div>
    </div>
  );
};
