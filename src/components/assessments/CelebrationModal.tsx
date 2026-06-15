import React, { useEffect, useState } from 'react';
import { Award, Star, Trophy, X } from 'lucide-react';
import { RewardResult } from '../../services/rewards.service';

interface CelebrationModalProps {
  rewardResult: RewardResult;
  onClose: () => void;
}

export const CelebrationModal: React.FC<CelebrationModalProps> = ({ rewardResult, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Small delay for animation effect
    const t = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-500 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
      <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" onClick={onClose}></div>
      
      <div className={`bg-white rounded-3xl p-8 max-w-md w-full relative z-10 shadow-2xl transition-all duration-500 delay-100 transform ${isVisible ? 'translate-y-0 scale-100' : 'translate-y-12 scale-95'}`}>
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:bg-gray-100 rounded-full transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center">
          <div className="w-24 h-24 mx-auto bg-gradient-to-br from-yellow-300 to-yellow-500 rounded-full flex items-center justify-center mb-6 shadow-lg relative">
            <Trophy className="w-12 h-12 text-white" />
            <div className="absolute -bottom-2 -right-2 bg-primary-500 text-white text-sm font-bold px-3 py-1 rounded-full shadow border-2 border-white">
              +{rewardResult.totalXpEarned} XP
            </div>
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-2">🎉 Assessment Completed!</h2>
          <p className="text-gray-600 mb-8">Great job! Your XP has been updated.</p>

          {rewardResult.levelUp && (
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-4 rounded-2xl mb-6 shadow-md animate-bounce">
              <Star className="w-8 h-8 mx-auto mb-2 text-yellow-300" />
              <h3 className="font-bold text-lg mb-1">Level Up!</h3>
              <p className="text-indigo-100 text-sm">You are now Level {rewardResult.newLevel}</p>
            </div>
          )}

          {rewardResult.unlockedAchievements.length > 0 && (
            <div className="text-left bg-gray-50 p-4 rounded-2xl mb-6 border border-gray-100">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Achievements Unlocked</h3>
              <div className="space-y-3">
                {rewardResult.unlockedAchievements.map((achievement, idx) => (
                  <div key={idx} className="flex items-start gap-3 bg-white p-3 rounded-xl border border-primary-100 shadow-sm">
                    <div className="w-10 h-10 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center flex-shrink-0">
                      <Award className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 text-sm">{achievement.name}</h4>
                      <p className="text-xs text-gray-500">{achievement.description}</p>
                    </div>
                    <div className="ml-auto flex items-center text-xs font-bold text-warning-600">
                      +{achievement.xpAwarded}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <button 
            onClick={onClose}
            className="w-full py-3 bg-gray-900 hover:bg-gray-800 text-white font-bold rounded-xl transition-colors"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
};
