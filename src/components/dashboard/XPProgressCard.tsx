import React from 'react';
import { Star, Trophy } from 'lucide-react';
import { Progress } from '../ui/Progress';
import { XPProgress } from '../../services/dashboard.service';

export const XPProgressCard: React.FC<{ xpProgress: XPProgress | null }> = ({ xpProgress }) => {
  if (!xpProgress) return null;

  return (
    <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg mb-8 relative overflow-hidden">
      <div className="absolute top-0 right-0 opacity-10 pointer-events-none transform translate-x-4 -translate-y-4">
        <Trophy className="w-32 h-32" />
      </div>
      
      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
            <Star className="w-6 h-6 text-yellow-300 fill-yellow-300" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Level {xpProgress.level}</h2>
            <p className="text-indigo-100 text-sm">Keep up the great work!</p>
          </div>
        </div>

        <div className="mb-2 flex justify-between items-end">
          <div>
            <span className="text-3xl font-bold">{xpProgress.currentXP}</span>
            <span className="text-indigo-200 ml-1">XP</span>
          </div>
          {xpProgress.nextLevelXP && (
            <div className="text-sm text-indigo-100 mb-1">
              {xpProgress.nextLevelXP - xpProgress.currentXP} XP to Level {xpProgress.level + 1}
            </div>
          )}
        </div>

        <div className="w-full bg-black/20 rounded-full h-3 mb-1 overflow-hidden">
          <div 
            className="bg-yellow-400 h-full rounded-full transition-all duration-1000 ease-out relative"
            style={{ width: `${xpProgress.progressPercent}%` }}
          >
            <div className="absolute inset-0 bg-white/20 w-full animate-[shimmer_2s_infinite]"></div>
          </div>
        </div>
      </div>
    </div>
  );
};
