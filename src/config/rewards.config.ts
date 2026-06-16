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
    DEDICATED_STUDENT: {
      code: 'DEDICATED_STUDENT',
      name: 'Dedicated Student',
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
    PATH_BEGINNER: {
      code: 'PATH_BEGINNER',
      name: 'Path Beginner',
      description: 'Complete your first journey activity',
      icon: 'Target',
      xp_awarded: 50
    },
    PATH_EXPLORER: {
      code: 'PATH_EXPLORER',
      name: 'Path Explorer',
      description: 'Reach Week 2 in your learning journey',
      icon: 'BookOpen',
      xp_awarded: 100
    },
    PATH_ADVANCER: {
      code: 'PATH_ADVANCER',
      name: 'Path Advancer',
      description: 'Reach Week 3 in your learning journey',
      icon: 'Brain',
      xp_awarded: 150
    },
    PATH_MASTER: {
      code: 'PATH_MASTER',
      name: 'Path Master',
      description: 'Complete full 4-week learning journey',
      icon: 'Award',
      xp_awarded: 300
    },
    JOURNEY_COMPLETED: {
      code: 'JOURNEY_COMPLETED',
      name: 'Journey Completed',
      description: 'Complete all assigned path activities',
      icon: 'CheckCircle2',
      xp_awarded: 500
    },
    WEEKLY_STREAK: {
      code: 'WEEKLY_STREAK',
      name: 'Weekly Streak',
      description: 'Achieve a 7-day activity streak',
      icon: 'Zap',
      xp_awarded: 200
    },
    MONTHLY_STREAK: {
      code: 'MONTHLY_STREAK',
      name: 'Monthly Streak',
      description: 'Achieve a 30-day activity streak',
      icon: 'Award',
      xp_awarded: 1000
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
    PERFECT_ATTENTION: {
      code: 'PERFECT_ATTENTION',
      name: 'Perfect Attention',
      description: 'Zero omissions and commissions on hard mode',
      icon: 'ShieldCheck',
      xp_awarded: 250
    },
    // Phase 8D: Learning Behaviour
    BEHAVIOUR_EXPLORER: {
      code: 'BEHAVIOUR_EXPLORER',
      name: 'Behaviour Explorer',
      description: 'Complete your first Learning Behaviour Assessment',
      icon: 'Search',
      xp_awarded: 50
    },
    PATTERN_MASTER: {
      code: 'PATTERN_MASTER',
      name: 'Pattern Master',
      description: 'Achieve Pattern Accuracy > 90%',
      icon: 'Puzzle',
      xp_awarded: 100
    },
    RULE_KEEPER: {
      code: 'RULE_KEEPER',
      name: 'Rule Keeper',
      description: 'Achieve Rule Retention > 90%',
      icon: 'BookOpen',
      xp_awarded: 100
    },
    PERSISTENT_LEARNER: {
      code: 'PERSISTENT_LEARNER',
      name: 'Persistent Learner',
      description: 'Achieve a Persistence Score > 85%',
      icon: 'Clock',
      xp_awarded: 150
    },
    ADAPTIVE_THINKER: {
      code: 'ADAPTIVE_THINKER',
      name: 'Adaptive Thinker',
      description: 'Achieve an Adaptability Score > 85%',
      icon: 'Activity',
      xp_awarded: 150
    },
    CONSISTENCY_CHAMPION: {
      code: 'CONSISTENCY_CHAMPION',
      name: 'Consistency Champion',
      description: 'Achieve a Consistency Score > 90%',
      icon: 'CheckCircle',
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
    },
    FOCUS_EXPLORER: {
      code: 'FOCUS_EXPLORER',
      name: 'Focus Explorer',
      description: 'First Focus & Engagement Assessment Completed',
      icon: 'Eye',
      xp_awarded: 50
    },
    ENGAGED_LEARNER: {
      code: 'ENGAGED_LEARNER',
      name: 'Engaged Learner',
      description: 'Engagement Score > 85',
      icon: 'Activity',
      xp_awarded: 100
    },
    LASER_VISION: {
      code: 'LASER_VISION',
      name: 'Laser Vision',
      description: 'Focus Score > 90',
      icon: 'Crosshair',
      xp_awarded: 150
    },
    SCREEN_CHAMPION: {
      code: 'SCREEN_CHAMPION',
      name: 'Screen Champion',
      description: 'Screen Focus > 95%',
      icon: 'Monitor',
      xp_awarded: 100
    },
    CONSISTENT_PRACTICE: {
      code: 'CONSISTENT_PRACTICE',
      name: 'Consistent Practice',
      description: 'Complete 10 recommendations',
      icon: 'Target',
      xp_awarded: 250
    },
    WEEKLY_GOAL_COMPLETED: {
      code: 'WEEKLY_GOAL_COMPLETED',
      name: 'Goal Crusher',
      description: 'Complete your weekly action plan tasks',
      icon: 'Award',
      xp_awarded: 300
    },
    READING_IMPROVER: {
      code: 'READING_IMPROVER',
      name: 'Reading Improver',
      description: 'Complete 5 reading recommendations',
      icon: 'BookOpen',
      xp_awarded: 150
    },
    FOCUS_BUILDER: {
      code: 'FOCUS_BUILDER',
      name: 'Focus Builder',
      description: 'Complete 5 focus recommendations',
      icon: 'Brain',
      xp_awarded: 150
    },
    SKILL_MASTER: {
      code: 'SKILL_MASTER',
      name: 'Skill Master',
      description: 'Complete 25 recommendations',
      icon: 'Star',
      xp_awarded: 500
    },
    ACTIVITY_STARTER: {
      code: 'ACTIVITY_STARTER',
      name: 'Activity Starter',
      description: 'Complete first activity',
      icon: 'PlayCircle',
      xp_awarded: 50
    },
    READING_WARRIOR: {
      code: 'READING_WARRIOR',
      name: 'Reading Warrior',
      description: 'Complete 10 reading activities',
      icon: 'BookOpen',
      xp_awarded: 200
    },
    FOCUS_TRAINER: {
      code: 'FOCUS_TRAINER',
      name: 'Focus Trainer',
      description: 'Complete 10 attention activities',
      icon: 'Brain',
      xp_awarded: 200
    },
    LEARNING_STREAK: {
      code: 'LEARNING_STREAK',
      name: 'Learning Streak',
      description: '7-day activity streak',
      icon: 'Activity',
      xp_awarded: 300
    },
    ACTIVITY_MASTER: {
      code: 'ACTIVITY_MASTER',
      name: 'Activity Master',
      description: 'Complete 50 activities',
      icon: 'Star',
      xp_awarded: 1000
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
