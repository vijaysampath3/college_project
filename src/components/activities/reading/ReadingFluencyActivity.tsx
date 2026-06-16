import React, { useState, useEffect, useRef } from 'react';
import { BookOpen, PlayCircle, CheckCircle2 } from 'lucide-react';
import { LearningActivity } from '../../../services/activity.service';

interface ReadingActivityProps {
  activity: LearningActivity;
  onComplete: (payload: { score: number; accuracy_percentage: number; time_spent_seconds: number; metrics: any }) => void;
}

const PASSAGES = {
  Easy: "The sun was shining brightly in the clear blue sky. A small dog barked happily as it ran across the green grass. Two children were playing with a red ball near a large oak tree. It was a perfect day for a picnic.",
  Medium: "Photosynthesis is the process by which green plants and some other organisms use sunlight to synthesize foods from carbon dioxide and water. Photosynthesis in plants generally involves the green pigment chlorophyll and generates oxygen as a byproduct.",
  Hard: "The macroeconomic implications of rapid inflation often necessitate swift intervention by central banking authorities. By manipulating interest rates and reserve requirements, policymakers attempt to cool economic overheating without precipitating a severe recessionary environment."
};

const QUESTIONS = {
  Easy: [
    { q: "What color was the sky?", options: ["Blue", "Red", "Green", "Grey"], answer: "Blue" },
    { q: "What were the children playing with?", options: ["A dog", "A red ball", "A kite", "A tree"], answer: "A red ball" }
  ],
  Medium: [
    { q: "What is the primary energy source for photosynthesis?", options: ["Water", "Soil", "Sunlight", "Oxygen"], answer: "Sunlight" },
    { q: "What is generated as a byproduct?", options: ["Carbon dioxide", "Chlorophyll", "Oxygen", "Glucose"], answer: "Oxygen" }
  ],
  Hard: [
    { q: "What do central banks manipulate to control inflation?", options: ["Stock prices", "Interest rates", "Income tax", "Trade tariffs"], answer: "Interest rates" },
    { q: "What is a potential negative consequence of cooling the economy too quickly?", options: ["Hyperinflation", "Recessionary environment", "Increased consumer spending", "Deficit spending"], answer: "Recessionary environment" }
  ]
};

export const ReadingFluencyActivity: React.FC<ReadingActivityProps> = ({ activity, onComplete }) => {
  const [phase, setPhase] = useState<'intro' | 'reading' | 'questions' | 'done'>('intro');
  const [startTime, setStartTime] = useState<number>(0);
  const [readingTimeMs, setReadingTimeMs] = useState<number>(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  
  const difficulty = (activity.difficulty as 'Easy' | 'Medium' | 'Hard') || 'Easy';
  const passage = PASSAGES[difficulty];
  const questions = QUESTIONS[difficulty];

  const startReading = () => {
    setStartTime(Date.now());
    setPhase('reading');
  };

  const finishReading = () => {
    setReadingTimeMs(Date.now() - startTime);
    setPhase('questions');
  };

  const handleAnswer = (qIndex: number, option: string) => {
    setAnswers(prev => ({ ...prev, [qIndex]: option }));
  };

  const submitActivity = () => {
    let correctCount = 0;
    questions.forEach((q, idx) => {
      if (answers[idx] === q.answer) correctCount++;
    });

    const accuracy = Math.round((correctCount / questions.length) * 100);
    const timeSpentSeconds = Math.round(readingTimeMs / 1000);
    
    // WPM Calculation
    const words = passage.split(' ').length;
    const wpm = Math.round((words / timeSpentSeconds) * 60) || 0;

    // Final score combines WPM base and accuracy
    let baseScore = Math.min(100, Math.round((wpm / (difficulty === 'Easy' ? 100 : difficulty === 'Medium' ? 150 : 200)) * 100));
    const finalScore = Math.round((baseScore * 0.4) + (accuracy * 0.6));

    setPhase('done');
    onComplete({
      score: finalScore,
      accuracy_percentage: accuracy,
      time_spent_seconds: timeSpentSeconds,
      metrics: {
        wpm,
        reading_time_ms: readingTimeMs,
        correct_answers: correctCount,
        total_questions: questions.length
      }
    });
  };

  return (
    <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="bg-primary-50 p-6 border-b border-primary-100 flex items-center gap-4">
        <BookOpen className="w-8 h-8 text-primary-600" />
        <div>
          <h2 className="text-xl font-bold text-gray-900">{activity.title}</h2>
          <p className="text-primary-700 text-sm">Difficulty: {difficulty}</p>
        </div>
      </div>

      <div className="p-8">
        {phase === 'intro' && (
          <div className="text-center py-12">
            <h3 className="text-2xl font-bold mb-4">Ready to read?</h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">Read the following passage as quickly and accurately as you can. Afterwards, you will answer a few comprehension questions.</p>
            <button onClick={startReading} className="px-8 py-4 bg-primary-600 text-white font-bold rounded-xl hover:bg-primary-700 flex items-center gap-2 mx-auto">
              <PlayCircle className="w-6 h-6" /> Start Reading
            </button>
          </div>
        )}

        {phase === 'reading' && (
          <div className="space-y-8 text-center">
            <div className="p-8 bg-gray-50 rounded-2xl text-left border border-gray-100 shadow-inner">
              <p className="text-2xl leading-relaxed text-gray-800 font-medium">{passage}</p>
            </div>
            <button onClick={finishReading} className="px-8 py-4 bg-success-600 text-white font-bold rounded-xl hover:bg-success-700">
              I'm Done Reading
            </button>
          </div>
        )}

        {phase === 'questions' && (
          <div className="space-y-8">
            <h3 className="text-xl font-bold">Comprehension Questions</h3>
            <div className="space-y-6">
              {questions.map((q, qIndex) => (
                <div key={qIndex} className="bg-gray-50 p-6 rounded-xl border border-gray-100">
                  <p className="font-bold text-gray-900 mb-4">{qIndex + 1}. {q.q}</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {q.options.map(opt => (
                      <button
                        key={opt}
                        onClick={() => handleAnswer(qIndex, opt)}
                        className={`p-3 text-left rounded-lg border font-medium transition-all ${answers[qIndex] === opt ? 'bg-primary-100 border-primary-500 text-primary-800' : 'bg-white border-gray-200 hover:border-primary-300 text-gray-700'}`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <button 
              onClick={submitActivity}
              disabled={Object.keys(answers).length < questions.length}
              className="w-full py-4 bg-primary-600 text-white font-bold rounded-xl hover:bg-primary-700 disabled:opacity-50"
            >
              Submit Answers
            </button>
          </div>
        )}

        {phase === 'done' && (
          <div className="text-center py-12">
            <CheckCircle2 className="w-16 h-16 text-success-500 mx-auto mb-4" />
            <h3 className="text-2xl font-bold mb-2">Great Job!</h3>
            <p className="text-gray-600">Your results have been recorded.</p>
          </div>
        )}
      </div>
    </div>
  );
};
