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
