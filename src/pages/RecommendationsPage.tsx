import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { recommendationsService } from '../services/recommendations.service';
import { rewardsService } from '../services/rewards.service';
import { Recommendation, RecommendationAIMessage, WeeklyPlan } from '../types/Recommendation';
import { ArrowLeft, Loader2, Target, Zap, Clock, Brain, CheckCircle2, Star, Target as TargetIcon } from 'lucide-react';

export const RecommendationsPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [aiMessage, setAiMessage] = useState<RecommendationAIMessage | null>(null);
  const [weeklyPlan, setWeeklyPlan] = useState<WeeklyPlan | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCompleting, setIsCompleting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    if (!user) return;
    try {
      setIsLoading(true);
      const [recsResp, planResp] = await Promise.all([
        recommendationsService.getRecommendations(user.id),
        recommendationsService.getActionPlan(user.id)
      ]);
      setRecommendations(recsResp.recommendations);
      setAiMessage(recsResp.ai_message);
      setWeeklyPlan(planResp.plan);
    } catch (err: any) {
      setError(err.message || 'Failed to load recommendations');
    } finally {
      setIsLoading(false);
    }
  };

  const handleComplete = async (rec: Recommendation) => {
    if (!user) return;
    
    // If it's a linked activity, route to the Activity Player
    if (rec.activity_data?.activityCode) {
      navigate(`/student/activity/${rec.activity_data.activityCode}`, {
        state: { recommendationId: rec.id }
      });
      return;
    }

    // Fallback for generic recommendations without activities
    try {
      setIsCompleting(rec.id);
      await recommendationsService.completeRecommendation(rec.id);
      
      // Update local state to remove completed
      setRecommendations(prev => prev.filter(r => r.id !== rec.id));
      
      // Update weekly plan local state
      if (weeklyPlan) {
        setWeeklyPlan({
          week1: weeklyPlan.week1.filter(r => r.id !== rec.id),
          week2: weeklyPlan.week2.filter(r => r.id !== rec.id),
          week3: weeklyPlan.week3.filter(r => r.id !== rec.id),
          week4: weeklyPlan.week4.filter(r => r.id !== rec.id),
        });
      }

      // Award XP via rewards service
      if (rewardsService.awardRecommendationXP) {
        await rewardsService.awardRecommendationXP(user.id, rec.category);
      }
    } catch (err: any) {
      alert("Failed to complete recommendation: " + err.message);
    } finally {
      setIsCompleting(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
      </div>
    );
  }

  const todaysFocus = recommendations.length > 0 ? recommendations[0] : null;

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Action Plan</h1>
          <p className="text-gray-600">Your personalized roadmap to cognitive growth</p>
        </div>
        <button
          onClick={() => navigate('/student')}
          className="flex items-center gap-2 px-6 py-2.5 bg-white text-gray-700 border border-gray-200 rounded-xl font-bold hover:bg-gray-50 transition-colors shadow-sm"
        >
          <ArrowLeft className="w-5 h-5" />
          Dashboard
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-danger-50 border border-danger-200 text-danger-700 rounded-xl">
          {error}
        </div>
      )}

      {recommendations.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-gray-100">
          <CheckCircle2 className="w-16 h-16 text-success-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No Action Plan Available</h2>
          <p className="text-gray-500 mb-6">You either haven't generated an intelligence report yet, or you've completed all assigned activities!</p>
          <div className="flex justify-center gap-4">
            <button
              onClick={async () => {
                if (!user) return;
                try {
                  setIsLoading(true);
                  await recommendationsService.resetActionPlan(user.id);
                  await loadData();
                } catch (err: any) {
                  setError("Failed to reset action plan: " + err.message);
                  setIsLoading(false);
                }
              }}
              className="px-6 py-3 bg-white border-2 border-primary-200 text-primary-700 rounded-xl font-bold hover:border-primary-600 hover:text-primary-600 transition-colors"
            >
              Redo Action Plan
            </button>
            <button
              onClick={() => navigate('/student/reports')}
              className="px-6 py-3 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-700 transition-colors"
            >
              Go to Reports
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          
          {/* AI Coach Message */}
          {aiMessage && (
            <div className="bg-primary-900 text-white p-6 rounded-2xl shadow-md relative overflow-hidden flex items-start gap-6">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -translate-y-1/2 translate-x-1/3"></div>
              <div className="p-4 bg-white/10 rounded-xl shrink-0 z-10">
                <Brain className="w-10 h-10 text-primary-200" />
              </div>
              <div className="z-10 flex-1">
                <h3 className="text-2xl font-bold mb-2">Your AI Coach</h3>
                <p className="text-primary-100 mb-3">{aiMessage.coach_message}</p>
                <div className="bg-black/20 p-4 rounded-xl border border-white/10 mb-3">
                  <p className="text-sm">{aiMessage.strategy_explanation}</p>
                </div>
                <p className="font-medium text-warning-400 italic">"{aiMessage.motivation}"</p>
              </div>
            </div>
          )}

          <div className="grid md:grid-cols-3 gap-8">
            {/* Main Content (Today's Focus + Pending) */}
            <div className="md:col-span-2 space-y-8">
              
              {/* Today's Focus */}
              {todaysFocus && (
                <section>
                  <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Target className="w-6 h-6 text-warning-500" />
                    Today's Focus
                  </h2>
                  <div className="bg-gradient-to-br from-warning-50 to-white p-6 rounded-2xl border border-warning-200 shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <span className="px-3 py-1 bg-warning-100 text-warning-800 rounded-full text-xs font-bold uppercase tracking-wider mb-3 inline-block">
                          Highest Priority • {todaysFocus.impact_score} Impact
                        </span>
                        <h3 className="text-2xl font-bold text-gray-900">{todaysFocus.title}</h3>
                        <div className="flex items-center gap-2 text-sm text-gray-500 mt-2">
                          <Clock className="w-4 h-4" />
                          {todaysFocus.estimated_minutes} minutes
                        </div>
                      </div>
                      <div className="p-3 bg-white rounded-xl shadow-sm">
                        <Zap className="w-8 h-8 text-warning-500" />
                      </div>
                    </div>
                    <p className="text-gray-700 mb-6">{todaysFocus.description}</p>
                    <button
                      onClick={() => handleComplete(todaysFocus)}
                      disabled={isCompleting === todaysFocus.id}
                      className="w-full py-3 bg-warning-500 text-white rounded-xl font-bold hover:bg-warning-600 transition-colors flex items-center justify-center gap-2"
                    >
                      {isCompleting === todaysFocus.id ? <Loader2 className="w-5 h-5 animate-spin" /> : todaysFocus.activity_data?.activityCode ? <Zap className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
                      {todaysFocus.activity_data?.activityCode ? 'Start Activity' : 'Complete Activity'}
                    </button>
                  </div>
                </section>
              )}

              {/* Other Recommendations */}
              <section>
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Star className="w-6 h-6 text-primary-500" />
                  Recommended Activities
                </h2>
                <div className="space-y-4">
                  {recommendations.slice(1).map(rec => (
                    <div key={rec.id} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <h4 className="font-bold text-gray-900 text-lg">{rec.title}</h4>
                          <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${
                            rec.priority === 'High' ? 'bg-danger-50 text-danger-700 border-danger-200' :
                            rec.priority === 'Medium' ? 'bg-warning-50 text-warning-700 border-warning-200' :
                            'bg-success-50 text-success-700 border-success-200'
                          } border`}>
                            {rec.priority}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{rec.description}</p>
                        <div className="flex items-center gap-4 text-xs font-medium text-gray-400">
                          <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {rec.estimated_minutes} min</span>
                          <span className="capitalize text-primary-600 bg-primary-50 px-2 py-0.5 rounded">{rec.category}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleComplete(rec)}
                        disabled={isCompleting === rec.id}
                        className="shrink-0 p-3 bg-gray-50 text-gray-600 rounded-xl hover:bg-success-50 hover:text-success-600 border border-gray-200 hover:border-success-200 transition-colors"
                        title={rec.activity_data?.activityCode ? "Start Activity" : "Mark Complete"}
                      >
                        {isCompleting === rec.id ? <Loader2 className="w-6 h-6 animate-spin" /> : rec.activity_data?.activityCode ? <Zap className="w-6 h-6" /> : <CheckCircle2 className="w-6 h-6" />}
                      </button>
                    </div>
                  ))}
                </div>
              </section>

            </div>

            {/* Sidebar (Weekly Plan) */}
            <div className="md:col-span-1">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Weekly Plan</h2>
              <div className="bg-white rounded-2xl border border-gray-200 p-5 space-y-6">
                {[1, 2, 3, 4].map(weekNum => {
                  const items = weeklyPlan ? (weeklyPlan as any)[`week${weekNum}`] as Recommendation[] : [];
                  return (
                    <div key={weekNum} className="relative">
                      {weekNum < 4 && <div className="absolute left-4 top-10 bottom-[-24px] w-0.5 bg-gray-100"></div>}
                      <div className="flex items-start gap-4">
                        <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold shrink-0 relative z-10">
                          {weekNum}
                        </div>
                        <div className="flex-1 pb-2">
                          <h4 className="font-bold text-gray-900 mb-2">Week {weekNum}</h4>
                          {items.length === 0 ? (
                            <p className="text-sm text-gray-400 italic">No specific tasks</p>
                          ) : (
                            <ul className="space-y-2 text-sm text-gray-600">
                              {items.map(i => (
                                <li key={i.id} className="flex items-start gap-2">
                                  <span className="w-1.5 h-1.5 rounded-full bg-primary-400 mt-1.5 shrink-0"></span>
                                  <span>{i.title}</span>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
