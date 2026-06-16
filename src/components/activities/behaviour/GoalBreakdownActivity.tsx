import React, { useState, useEffect } from 'react';
import { Target, ArrowUp, ArrowDown, CheckCircle2, Clock } from 'lucide-react';
import { LearningActivity } from '../../../services/activity.service';

interface GoalBreakdownActivityProps {
  activity: LearningActivity;
  onComplete: (payload: { score: number; accuracy_percentage: number; time_spent_seconds: number; metrics: any }) => void;
}

export const GoalBreakdownActivity: React.FC<GoalBreakdownActivityProps> = ({ activity, onComplete }) => {
  const [tasks, setTasks] = useState<{ id: string; text: string; correctOrder: number }[]>([]);
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  useEffect(() => {
    // Generate mock tasks based on activity level
    const initialTasks = [
      { id: '1', text: 'Brainstorm topic ideas', correctOrder: 1 },
      { id: '2', text: 'Create an outline', correctOrder: 2 },
      { id: '3', text: 'Write the first draft', correctOrder: 3 },
      { id: '4', text: 'Review and edit', correctOrder: 4 },
      { id: '5', text: 'Submit final assignment', correctOrder: 5 },
    ];
    // Shuffle them
    const shuffled = [...initialTasks].sort(() => Math.random() - 0.5);
    setTasks(shuffled);
    setStartTime(Date.now());
  }, [activity.activity_level]);

  const moveTask = (index: number, direction: 'up' | 'down') => {
    if (isSubmitted) return;
    const newTasks = [...tasks];
    if (direction === 'up' && index > 0) {
      [newTasks[index - 1], newTasks[index]] = [newTasks[index], newTasks[index - 1]];
    } else if (direction === 'down' && index < newTasks.length - 1) {
      [newTasks[index + 1], newTasks[index]] = [newTasks[index], newTasks[index + 1]];
    }
    setTasks(newTasks);
  };

  const handleSubmit = () => {
    setIsSubmitted(true);
    const endTime = Date.now();
    const timeSpent = Math.floor((endTime - startTime) / 1000);

    // Calculate score
    let correctCount = 0;
    tasks.forEach((task, idx) => {
      if (task.correctOrder === idx + 1) correctCount++;
    });

    const calculatedScore = Math.floor((correctCount / tasks.length) * 100);
    setScore(calculatedScore);

    onComplete({
      score: calculatedScore,
      accuracy_percentage: calculatedScore,
      time_spent_seconds: timeSpent,
      metrics: { mistake_count: tasks.length - correctCount }
    });
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-2xl shadow-sm border border-gray-100">
      <div className="text-center mb-8">
        <Target className="w-12 h-12 text-primary-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{activity.title}</h2>
        <p className="text-gray-600">Rearrange these micro-tasks into the correct logical sequence.</p>
      </div>

      <div className="space-y-3 mb-8">
        {tasks.map((task, index) => (
          <div key={task.id} className={`flex items-center gap-4 p-4 rounded-xl border ${isSubmitted ? (task.correctOrder === index + 1 ? 'bg-success-50 border-success-200' : 'bg-danger-50 border-danger-200') : 'bg-gray-50 border-gray-200'} transition-all`}>
            <div className="flex flex-col gap-1">
              <button 
                onClick={() => moveTask(index, 'up')}
                disabled={index === 0 || isSubmitted}
                className="p-1 text-gray-400 hover:text-primary-600 disabled:opacity-30 disabled:hover:text-gray-400 transition-colors"
              >
                <ArrowUp className="w-5 h-5" />
              </button>
              <button 
                onClick={() => moveTask(index, 'down')}
                disabled={index === tasks.length - 1 || isSubmitted}
                className="p-1 text-gray-400 hover:text-primary-600 disabled:opacity-30 disabled:hover:text-gray-400 transition-colors"
              >
                <ArrowDown className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 font-medium text-gray-900">
              {task.text}
            </div>
            {isSubmitted && task.correctOrder === index + 1 && (
              <CheckCircle2 className="w-6 h-6 text-success-500" />
            )}
          </div>
        ))}
      </div>

      {!isSubmitted ? (
        <button
          onClick={handleSubmit}
          className="w-full py-4 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-700 transition-colors text-lg"
        >
          Submit Sequence
        </button>
      ) : (
        <div className="text-center p-6 bg-gray-50 rounded-xl border border-gray-100">
          <div className="text-4xl font-black text-primary-600 mb-2">{score}% Match</div>
          <p className="text-gray-600 font-medium">Activity Completed!</p>
        </div>
      )}
    </div>
  );
};
