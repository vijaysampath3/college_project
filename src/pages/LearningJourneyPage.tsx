import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { learningPathService, ActivePathResponse } from '../services/learningPath.service';
import { Loader2, ArrowLeft, Brain, CheckCircle2, Lock, Target, PlayCircle, Zap, Star } from 'lucide-react';

export const LearningJourneyPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState<ActivePathResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadPath();
    }
  }, [user]);

  const loadPath = async () => {
    if (!user) return;
    try {
      setIsLoading(true);
      const resp = await learningPathService.getActivePath(user.id);
      
      // If no active path, let's try to auto-generate a starter path based on whatever we have
      if (!resp.path) {
        await learningPathService.generatePath(user.id);
        const newResp = await learningPathService.getActivePath(user.id);
        setData(newResp);
      } else {
        setData(resp);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load learning journey');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="bg-danger-50 text-danger-700 p-4 rounded-xl border border-danger-200">
          {error}
        </div>
      </div>
    );
  }

  if (!data?.path) {
    return (
      <div className="max-w-4xl mx-auto py-8 px-4 text-center">
        <h2 className="text-2xl font-bold mb-4">No Learning Journey Available</h2>
        <p className="text-gray-600">Complete assessments to unlock your personalized learning journey.</p>
        <button onClick={() => navigate('/student')} className="mt-4 px-6 py-2 bg-primary-600 text-white rounded-xl">Go Home</button>
      </div>
    );
  }

  const { path, items, progress, coach_message } = data;

  const getWeekStatus = (weekNum: number) => {
    if (weekNum < path.current_week) return 'completed';
    if (weekNum === path.current_week) return 'current';
    return 'locked';
  };

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Learning Journey</h1>
          <p className="text-gray-600">Your personalized path to cognitive growth</p>
        </div>
        <button
          onClick={() => navigate('/student')}
          className="flex items-center gap-2 px-6 py-2.5 bg-white text-gray-700 border border-gray-200 rounded-xl font-bold hover:bg-gray-50 transition-colors shadow-sm"
        >
          <ArrowLeft className="w-5 h-5" />
          Dashboard
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left Column: Progress & Coach */}
        <div className="space-y-6">
          {/* Journey Card */}
          <div className="bg-gradient-to-br from-primary-600 to-primary-800 rounded-2xl p-6 text-white shadow-md relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-white opacity-5 rounded-full -translate-y-1/2 translate-x-1/3"></div>
            <span className="px-3 py-1 bg-white/20 text-white rounded-full text-xs font-bold uppercase tracking-wider mb-4 inline-block backdrop-blur-sm">
              {path.journey_type} Path
            </span>
            <h2 className="text-2xl font-bold mb-1">{path.path_name}</h2>
            <p className="text-primary-100 text-sm mb-6">Focus: {path.primary_focus_area}</p>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm font-medium">
                <span>Week {path.current_week} of 4</span>
                <span>{progress.completion_percentage}%</span>
              </div>
              <div className="w-full bg-black/20 rounded-full h-2">
                <div 
                  className="bg-white rounded-full h-2 transition-all duration-1000 ease-out"
                  style={{ width: `${progress.completion_percentage}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-xs text-primary-200 pt-2">
                <span>{progress.completed} Completed</span>
                <span>{progress.remaining} Remaining</span>
              </div>
            </div>
          </div>

          {/* AI Coach */}
          {coach_message && (
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm relative overflow-hidden">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-primary-50 rounded-xl shrink-0">
                  <Brain className="w-6 h-6 text-primary-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-2">AI Coach</h3>
                  <p className="text-gray-700 text-sm mb-3">{coach_message.message}</p>
                  <p className="text-xs font-medium text-warning-600 italic">"{coach_message.reflection}"</p>
                </div>
              </div>
            </div>
          )}

          {/* Weekly Roadmap Tracker */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-4">Roadmap</h3>
            <div className="space-y-4">
              {[1, 2, 3, 4].map(week => {
                const status = getWeekStatus(week);
                return (
                  <div key={week} className={`flex items-center gap-3 p-3 rounded-xl border ${status === 'current' ? 'border-primary-200 bg-primary-50' : 'border-transparent'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                      status === 'completed' ? 'bg-success-100 text-success-600' :
                      status === 'current' ? 'bg-primary-600 text-white shadow-md' :
                      'bg-gray-100 text-gray-400'
                    }`}>
                      {status === 'completed' ? <CheckCircle2 className="w-5 h-5" /> : 
                       status === 'locked' ? <Lock className="w-4 h-4" /> : 
                       <Target className="w-4 h-4" />}
                    </div>
                    <div className="flex-1">
                      <div className={`font-bold ${status === 'locked' ? 'text-gray-400' : 'text-gray-900'}`}>
                        Week {week}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Activities */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Zap className="w-6 h-6 text-warning-500" />
            Current Week Activities
          </h2>
          
          <div className="space-y-4">
            {items.filter(i => i.week_number === path.current_week).map((item, idx) => (
              <div 
                key={item.id} 
                className={`bg-white rounded-2xl p-5 border shadow-sm flex flex-col sm:flex-row items-center gap-4 transition-all duration-300 ${item.completed ? 'border-success-200 bg-success-50/30 opacity-75 hover:opacity-100' : 'border-gray-100 hover:border-primary-300 hover:shadow-md'}`}
              >
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${item.completed ? 'bg-success-100 text-success-600' : 'bg-primary-50 text-primary-600'}`}>
                  {item.completed ? <CheckCircle2 className="w-7 h-7" /> : <PlayCircle className="w-7 h-7" />}
                </div>
                
                <div className="flex-1 text-center sm:text-left w-full">
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1">
                    <h3 className="font-bold text-lg text-gray-900">{item.activity_title}</h3>
                    {item.completed && <span className="px-2 py-0.5 bg-success-100 text-success-700 text-xs font-bold rounded uppercase tracking-wider">Completed</span>}
                  </div>
                  <div className="flex items-center justify-center sm:justify-start gap-3 text-sm text-gray-500">
                    <span className="capitalize">{item.activity_category}</span>
                    <span>•</span>
                    <span className={`font-medium ${
                      item.difficulty === 'Hard' ? 'text-danger-600' : 
                      item.difficulty === 'Medium' ? 'text-warning-600' : 
                      'text-success-600'
                    }`}>
                      {item.difficulty}
                    </span>
                    {item.score !== null && (
                      <>
                        <span>•</span>
                        <span className="font-medium text-gray-700">Score: {item.score}</span>
                      </>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => navigate(`/student/activity/${item.activity_code}`, { state: { learningPathItemId: item.id } })}
                  className={`w-full sm:w-auto px-6 py-3 rounded-xl font-bold transition-colors ${
                    item.completed 
                      ? 'bg-white border-2 border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50' 
                      : 'bg-primary-600 text-white hover:bg-primary-700 shadow-sm shadow-primary-200'
                  }`}
                >
                  {item.completed ? 'Play Again' : 'Start'}
                </button>
              </div>
            ))}

            {items.filter(i => i.week_number === path.current_week).length === 0 && (
              <div className="p-8 text-center text-gray-500 bg-white rounded-2xl border border-gray-100">
                No activities mapped for this week.
              </div>
            )}
          </div>
          
          {/* Upcoming Preview */}
          {path.current_week < 4 && (
            <div className="mt-12 opacity-60 pointer-events-none grayscale">
              <h3 className="text-lg font-bold text-gray-700 mb-4 flex items-center gap-2">
                <Lock className="w-5 h-5" />
                Next Week Preview
              </h3>
              <div className="space-y-4">
                {items.filter(i => i.week_number === path.current_week + 1).slice(0, 2).map((item) => (
                  <div key={item.id} className="bg-gray-50 rounded-2xl p-4 border border-gray-100 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gray-200 flex items-center justify-center shrink-0">
                      <Lock className="w-5 h-5 text-gray-400" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-700">{item.activity_title}</h4>
                      <p className="text-sm text-gray-500 capitalize">{item.activity_category} • {item.difficulty}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
