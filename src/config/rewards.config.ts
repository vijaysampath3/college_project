export const REWARDS_CONFIG = {
  xp: {
    COMPLETION: 50,
    RETAKE: 20,
    HIGH_ACCURACY: 25, // >= 90
    AI_INSIGHT: 10
  },
  levels: [
    { level: 1, requiredXP: 0 },
    { level: 2, requiredXP: 100 },
    { level: 3, requiredXP: 250 },
    { level: 4, requiredXP: 500 },
    { level: 5, requiredXP: 1000 }
  ],
  achievements: {
    FIRST_ASSESSMENT: {
      code: 'FIRST_ASSESSMENT',
      name: 'First Assessment',
      description: 'Complete your first assessment',
      icon: 'PlayCircle',
      xp_awarded: 50
    },
    READING_EXPLORER: {
      code: 'READING_EXPLORER',
      name: 'Reading Explorer',
      description: 'Complete 3 reading assessments',
      icon: 'BookOpen',
      xp_awarded: 100
    },
    READING_MASTER: {
      code: 'READING_MASTER',
      name: 'Reading Master',
      description: 'Score 90% or higher accuracy',
      icon: 'Target',
      xp_awarded: 150
    },
    AI_FEEDBACK: {
      code: 'AI_FEEDBACK',
      name: 'AI Feedback Received',
      description: 'Receive your first AI-generated insight',
      icon: 'Brain',
      xp_awarded: 50
    },
    PERSISTENT_LEARNER: {
      code: 'PERSISTENT_LEARNER',
      name: 'Persistent Learner',
      description: 'Complete 5 total assessments',
      icon: 'Clock',
      xp_awarded: 200
    },
    COMPREHENSION_STARTER: {
      code: 'COMPREHENSION_STARTER',
      name: 'Comprehension Starter',
      description: 'Complete your first comprehension assessment',
      icon: 'BookOpen',
      xp_awarded: 50
    },
    DEEP_THINKER: {
      code: 'DEEP_THINKER',
      name: 'Deep Thinker',
      description: 'Score 100% on Critical Thinking questions',
      icon: 'Brain',
      xp_awarded: 75
    },
    INFERENCE_EXPERT: {
      code: 'INFERENCE_EXPERT',
      name: 'Inference Expert',
      description: 'Score 100% on Inference questions',
      icon: 'Target',
      xp_awarded: 75
    },
    KNOWLEDGE_BUILDER: {
      code: 'KNOWLEDGE_BUILDER',
      name: 'Knowledge Builder',
      description: 'Achieve a 90% or higher total score in Comprehension',
      icon: 'Award',
      xp_awarded: 150
    },
    TYPING_STARTER: {
      code: 'TYPING_STARTER',
      name: 'Typing Starter',
      description: 'Complete your first typing assessment',
      icon: 'Keyboard',
      xp_awarded: 50
    },
    SPEED_DEMON: {
      code: 'SPEED_DEMON',
      name: 'Speed Demon',
      description: 'Achieve greater than 60 WPM',
      icon: 'Zap',
      xp_awarded: 100
    },
    PRECISION_TYPIST: {
      code: 'PRECISION_TYPIST',
      name: 'Precision Typist',
      description: 'Achieve 100% accuracy on a typing assessment',
      icon: 'Target',
      xp_awarded: 150
    },
    FOCUS_MASTER: {
      code: 'FOCUS_MASTER',
      name: 'Focus Master',
      description: 'Complete assessment with 0 pauses over 2 seconds',
      icon: 'Brain',
      xp_awarded: 100
    },
    RHYTHM_KEEPER: {
      id: 'RHYTHM_KEEPER',
      title: 'Rhythm Keeper',
      description: 'Maintain steady typing rhythm with <150ms variance',
      icon: 'Music',
      xpReward: 350,
      condition: (metrics: any) => (metrics?.hitSE || 200) < 150
    },
    LASER_FOCUS: {
      id: 'LASER_FOCUS',
      title: 'Laser Focus',
      description: 'Complete the Continuous Performance Test with 0 omissions',
      icon: 'Crosshair',
      xpReward: 400,
      condition: (metrics: any) => metrics?.omissions === 0
    },
    STEADY_HAND: {
      id: 'STEADY_HAND',
      title: 'Steady Hand',
      description: 'Complete the Continuous Performance Test with 0 commissions',
      icon: 'Shield',
      xpReward: 400,
      condition: (metrics: any) => metrics?.commissions === 0
    },
    VISUAL_EXPLORER: {
      code: 'VISUAL_EXPLORER',
      name: 'Visual Explorer',
      description: 'First Attention Assessment Completed',
      icon: 'Search',
      xp_awarded: 50
    },
    SHARP_EYE: {
      code: 'SHARP_EYE',
      name: 'Sharp Eye',
      description: 'Attention Accuracy > 95%',
      icon: 'Target',
      xp_awarded: 100
    },
    LIGHTNING_SCAN: {
      code: 'LIGHTNING_SCAN',
      name: 'Lightning Scan',
      description: 'Average Reaction Time < 500ms',
      icon: 'Zap',
      xp_awarded: 150
    },
    DISTRACTOR_MASTER: {
      code: 'DISTRACTOR_MASTER',
      name: 'Distractor Master',
      description: '0 False Clicks during Attention tasks',
      icon: 'ShieldCheck',
      xp_awarded: 200
    },
    ATTENTION_CHAMPION: {
      code: 'ATTENTION_CHAMPION',
      name: 'Attention Champion',
      description: 'Attention Score > 90',
      icon: 'Brain',
      xp_awarded: 250
    }
  }
};

export const calculateLevel = (currentXP: number): { level: number; currentLevelXP: number; nextLevelXP: number | null; progressPercent: number } => {
  let currentLevel = 1;
  let nextLevelXP: number | null = REWARDS_CONFIG.levels[1].requiredXP;
  let currentLevelXPStart = 0;

  for (let i = 0; i < REWARDS_CONFIG.levels.length; i++) {
    if (currentXP >= REWARDS_CONFIG.levels[i].requiredXP) {
      currentLevel = REWARDS_CONFIG.levels[i].level;
      currentLevelXPStart = REWARDS_CONFIG.levels[i].requiredXP;
      
      if (i + 1 < REWARDS_CONFIG.levels.length) {
        nextLevelXP = REWARDS_CONFIG.levels[i + 1].requiredXP;
      } else {
        nextLevelXP = null; // Max level reached
      }
    }
  }

  const xpIntoLevel = currentXP - currentLevelXPStart;
  let progressPercent = 100;
  
  if (nextLevelXP !== null) {
    const levelSize = nextLevelXP - currentLevelXPStart;
    progressPercent = Math.min(100, Math.round((xpIntoLevel / levelSize) * 100));
  }

  return {
    level: currentLevel,
    currentLevelXP: currentXP,
    nextLevelXP,
    progressPercent
  };
};
