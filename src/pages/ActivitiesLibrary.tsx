import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { activityService, LearningActivity } from '../services/activity.service';
import { BookOpen, Brain, Keyboard, Activity, Target, Loader2, Play } from 'lucide-react';

export const ActivitiesLibrary = () => {
  const [activities, setActivities] = useState<LearningActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const data = await activityService.getActivities();
        setActivities(data);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAll();
  }, []);

  const getIconForCategory = (category: string) => {
    switch(category.toLowerCase()) {
      case 'reading': return <BookOpen className="w-5 h-5" />;
      case 'comprehension': return <Brain className="w-5 h-5" />;
      case 'attention': return <Target className="w-5 h-5" />;
      case 'focus': return <Target className="w-5 h-5" />;
      case 'typing': return <Keyboard className="w-5 h-5" />;
      case 'behaviour': return <Activity className="w-5 h-5" />;
      default: return <Brain className="w-5 h-5" />;
    }
  };

  const getColorForDifficulty = (difficulty: string) => {
    switch(difficulty.toLowerCase()) {
      case 'easy': return 'bg-green-100 text-green-700 border-green-200';
      case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'hard': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const groupedActivities = activities.reduce((acc, act) => {
    if (!acc[act.category]) acc[act.category] = [];
    acc[act.category].push(act);
    return acc;
  }, {} as Record<string, LearningActivity[]>);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Learning Activities</h1>
          <p className="text-gray-600 mt-1">Explore and practice targeted cognitive skills.</p>
        </div>
      </div>

      {Object.entries(groupedActivities).map(([category, acts]) => (
        <div key={category} className="space-y-4">
          <div className="flex items-center space-x-2 border-b pb-2">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
              {getIconForCategory(category)}
            </div>
            <h2 className="text-xl font-bold text-gray-900 capitalize">{category}</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {acts.map((activity) => (
              <div key={activity.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div className={`px-2.5 py-1 rounded-full text-xs font-bold border ${getColorForDifficulty(activity.difficulty)}`}>
                    {activity.difficulty}
                  </div>
                  <div className="flex items-center space-x-1 text-sm font-medium text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full">
                    <span>Lvl {activity.activity_level}</span>
                  </div>
                </div>
                
                <h3 className="text-lg font-bold text-gray-900 mb-2">{activity.title}</h3>
                <p className="text-gray-600 text-sm mb-6 flex-grow">{activity.description}</p>
                
                <div className="flex items-center justify-between border-t border-gray-50 pt-4 mt-auto">
                  <div className="text-sm text-gray-500 font-medium">
                    {activity.estimated_minutes} min • {activity.xp_reward} XP
                  </div>
                  <button 
                    onClick={() => navigate(`/student/activity/${activity.activity_code}`)}
                    className="p-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-600 hover:text-white transition-colors"
                  >
                    <Play className="w-5 h-5 ml-0.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};
