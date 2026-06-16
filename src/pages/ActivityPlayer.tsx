import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { activityService, LearningActivity } from '../services/activity.service';
import { ActivityRegistry } from '../components/activities/ActivityRegistry';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, Loader2, Trophy } from 'lucide-react';
import { GenericActivityPlayer } from '../components/activities/GenericActivityPlayer';
import { rewardsService } from '../services/rewards.service';

export const ActivityPlayer = () => {
  const { activityCode } = useParams<{ activityCode: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  
  const [activity, setActivity] = useState<LearningActivity | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [isCompleted, setIsCompleted] = useState(false);
  const [attemptResult, setAttemptResult] = useState<any>(null);

  // If we came from a recommendation, we might have passed it in state
  const recommendationId = location.state?.recommendationId;

  useEffect(() => {
    const fetchActivity = async () => {
      if (!activityCode) return;
      try {
        const data = await activityService.getActivity(activityCode);
        setActivity(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchActivity();
  }, [activityCode]);

  const handleActivityComplete = async (payload: any) => {
    if (!user || !activity) return;
    try {
      const result = await activityService.saveAttempt({
        student_id: user.id,
        activity_code: activity.activity_code,
        recommendation_id: recommendationId,
        score: payload.score || 0,
        accuracy_percentage: payload.accuracy_percentage || 0,
        time_spent_seconds: payload.time_spent_seconds || 0,
        reaction_time_ms: payload.metrics?.reaction_time_ms,
        mistake_count: payload.metrics?.mistake_count,
        metrics: payload.metrics,
        difficulty: activity.difficulty,
        activity_type: activity.activity_type
      });
      
      // Update local UI
      setAttemptResult(result);
      setIsCompleted(true);
      
      // Add XP & Check Achievements
      await rewardsService.awardActivityXPAndCheckAchievements(user.id, result.xp_earned, activity.category);
      
    } catch (err: any) {
      console.error("Failed to save attempt:", err);
      setError("Failed to save your progress. Please try again.");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
      </div>
    );
  }

  if (error || !activity) {
    return (
      <div className="p-8">
        <div className="bg-red-50 text-red-600 p-4 rounded-xl">
          {error || "Activity not found"}
        </div>
        <button 
          onClick={() => navigate(-1)}
          className="mt-4 text-indigo-600 hover:text-indigo-800 flex items-center space-x-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Go Back</span>
        </button>
      </div>
    );
  }

  // Lookup player component from registry, fallback to Generic
  const PlayerComponent = ActivityRegistry[activity.activity_type] || GenericActivityPlayer;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <button 
          onClick={() => navigate(-1)}
          className="inline-flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Activities</span>
        </button>
      </div>
      
      {!isCompleted ? (
        <PlayerComponent activity={activity} onComplete={handleActivityComplete} />
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 flex flex-col items-center justify-center text-center animate-fade-in">
          <div className="w-20 h-20 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center mb-6">
            <Trophy className="w-10 h-10" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Activity Completed!</h2>
          <p className="text-gray-600 mb-8 max-w-md">
            Great job completing {activity.title}. You performed with a <span className="font-bold text-indigo-600">{attemptResult?.quality}</span> quality!
          </p>
          
          <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-6 flex flex-col items-center mb-8 w-full max-w-sm">
            <span className="text-sm text-indigo-600 font-medium uppercase tracking-wider mb-1">XP Earned</span>
            <span className="text-4xl font-black text-indigo-700">+{attemptResult?.xp_earned} XP</span>
          </div>
          
          {attemptResult?.recommendation_completed && (
            <div className="bg-green-50 text-green-700 p-4 rounded-xl mb-8 w-full max-w-sm border border-green-200">
              <span className="font-bold block">Goal Reached!</span>
              You have fully completed the recommendation for this activity.
            </div>
          )}

          <div className="flex space-x-4">
            <button
              onClick={() => navigate('/student/recommendations')}
              className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors"
            >
              View Action Plan
            </button>
            <button
              onClick={() => navigate('/student/activities')}
              className="px-6 py-3 bg-white border-2 border-gray-200 text-gray-700 rounded-xl font-medium hover:border-indigo-600 hover:text-indigo-600 transition-colors"
            >
              More Activities
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
