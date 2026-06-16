import { supabase } from '../lib/supabase';
import { REWARDS_CONFIG, calculateLevel } from '../config/rewards.config';

export interface UnlockedAchievement {
  code: string;
  name: string;
  description: string;
  icon: string;
  xpAwarded: number;
}

export interface RewardResult {
  totalXpEarned: number;
  newLevel: number;
  levelUp: boolean;
  unlockedAchievements: UnlockedAchievement[];
}

export const rewardsService = {
  async awardXP(
    userId: string, 
    assessmentType: string, 
    metrics: any, 
    isRetake: boolean, 
    hasInsights: boolean
  ): Promise<RewardResult> {
    
    let xpEarned = 0;
    const reasons: { reason: string, xp: number }[] = [];

    // Base XP
    if (isRetake) {
      xpEarned += REWARDS_CONFIG.xp.RETAKE;
      reasons.push({ reason: 'Assessment Retaken', xp: REWARDS_CONFIG.xp.RETAKE });
    } else {
      xpEarned += REWARDS_CONFIG.xp.COMPLETION;
      reasons.push({ reason: 'Assessment Completed', xp: REWARDS_CONFIG.xp.COMPLETION });
    }

    // High Accuracy Bonus
    if (assessmentType === 'reading' && metrics?.accuracy >= 90) {
      xpEarned += REWARDS_CONFIG.xp.HIGH_ACCURACY;
      reasons.push({ reason: 'High Accuracy Bonus', xp: REWARDS_CONFIG.xp.HIGH_ACCURACY });
    }
    
    // High Score Bonus for Comprehension
    if (assessmentType === 'comprehension' && metrics?.totalScore >= 90) {
      xpEarned += REWARDS_CONFIG.xp.HIGH_ACCURACY;
      reasons.push({ reason: 'High Score Bonus', xp: REWARDS_CONFIG.xp.HIGH_ACCURACY });
    }

    // AI Insight Bonus
    if (hasInsights) {
      xpEarned += REWARDS_CONFIG.xp.AI_INSIGHT;
      reasons.push({ reason: 'AI Insight Generated', xp: REWARDS_CONFIG.xp.AI_INSIGHT });
    }

    // 1. Log Transactions
    for (const item of reasons) {
      await supabase.from('reward_transactions').insert({
        student_id: userId,
        xp_awarded: item.xp,
        reason: item.reason,
        assessment_type: assessmentType
      });
    }

    // 2. Fetch or Init Rewards Record
    let { data: rewardData } = await supabase
      .from('student_rewards')
      .select('*')
      .eq('student_id', userId)
      .single();

    if (!rewardData) {
      const { data: newReward } = await supabase
        .from('student_rewards')
        .insert({
          student_id: userId,
          xp: 0,
          level: 1,
          total_assessments: 0
        })
        .select()
        .single();
      rewardData = newReward;
    }

    const previousLevel = rewardData.level;
    const newTotalXp = rewardData.xp + xpEarned;
    const newTotalAssessments = rewardData.total_assessments + 1;
    const levelInfo = calculateLevel(newTotalXp);

    // 3. Update Rewards Record
    await supabase
      .from('student_rewards')
      .update({
        xp: newTotalXp,
        level: levelInfo.level,
        total_assessments: newTotalAssessments,
        updated_at: new Date().toISOString()
      })
      .eq('student_id', userId);

    // 4. Check Achievements
    const unlocked = await this.checkAndUnlockAchievements(
      userId, 
      newTotalAssessments, 
      metrics || {}, 
      hasInsights,
      assessmentType
    );

    // If achievements added XP, we'll update the final XP in the background to avoid blocking
    if (unlocked.length > 0) {
      const achievementXp = unlocked.reduce((sum, a) => sum + a.xpAwarded, 0);
      const finalXp = newTotalXp + achievementXp;
      const finalLevelInfo = calculateLevel(finalXp);
      
      await supabase
        .from('student_rewards')
        .update({
          xp: finalXp,
          level: finalLevelInfo.level,
          updated_at: new Date().toISOString()
        })
        .eq('student_id', userId);
        
      for (const a of unlocked) {
        await supabase.from('reward_transactions').insert({
          student_id: userId,
          xp_awarded: a.xpAwarded,
          reason: `Achievement Unlocked: ${a.name}`,
          assessment_type: assessmentType
        });
      }

      return {
        totalXpEarned: xpEarned + achievementXp,
        newLevel: finalLevelInfo.level,
        levelUp: finalLevelInfo.level > previousLevel,
        unlockedAchievements: unlocked
      };
    }

    return {
      totalXpEarned: xpEarned,
      newLevel: levelInfo.level,
      levelUp: levelInfo.level > previousLevel,
      unlockedAchievements: []
    };
  },

  async checkAndUnlockAchievements(
    userId: string, 
    totalAssessments: number, 
    metrics: any,
    hasInsights: boolean,
    assessmentType: string
  ): Promise<UnlockedAchievement[]> {
    const { data: existingAchievements } = await supabase
      .from('student_achievements')
      .select('achievement_code')
      .eq('student_id', userId);

    const existingCodes = new Set(existingAchievements?.map(a => a.achievement_code) || []);
    const newlyUnlocked: UnlockedAchievement[] = [];

    const check = (conf: any, condition: boolean) => {
      if (condition && !existingCodes.has(conf.code)) {
        newlyUnlocked.push({
          code: conf.code,
          name: conf.name,
          description: conf.description,
          icon: conf.icon,
          xpAwarded: conf.xp_awarded
        });
      }
    };

    const A = REWARDS_CONFIG.achievements;
    check(A.FIRST_ASSESSMENT, totalAssessments >= 1);
    check(A.DEDICATED_STUDENT, totalAssessments >= 5);
    check(A.AI_FEEDBACK, hasInsights);

    if (assessmentType === 'reading') {
      check(A.READING_MASTER, metrics.accuracy >= 90);
    }

    if (assessmentType === 'comprehension') {
      check(A.COMPREHENSION_STARTER, true); // Since they just finished one
      check(A.KNOWLEDGE_BUILDER, metrics.totalScore >= 90);
      
      // Assume metrics object contains the category scores like: { criticalThinking: 20, inference: 20, etc. }
      // A perfect score in a category is 20 if it's 1 question per category * 20 points
      check(A.DEEP_THINKER, metrics.criticalThinking === 20);
      check(A.INFERENCE_EXPERT, metrics.inference === 20);
    }

    if (assessmentType === 'attention') {
      check(A.VISUAL_EXPLORER, true);
      check(A.SHARP_EYE, metrics.accuracy >= 95);
      check(A.ATTENTION_CHAMPION, metrics.score > 90);
      check(A.LIGHTNING_SCAN, metrics.avgRT < 500);
      check(A.DISTRACTOR_MASTER, metrics.falseClicks === 0);
    }

    if (assessmentType === 'focus') {
      check(A.FOCUS_EXPLORER, true);
      check(A.ENGAGED_LEARNER, metrics.engagementScore > 85);
      check(A.LASER_VISION, metrics.focusScore > 90);
      check(A.SCREEN_CHAMPION, metrics.screenFocusPercent > 95);
    }

    if (assessmentType === 'learning-behaviour') {
      check(A.BEHAVIOUR_EXPLORER, true);
      check(A.PATTERN_MASTER, metrics.task1?.patternAccuracy > 90);
      check(A.RULE_KEEPER, metrics.task2?.ruleRetention > 90);
      check(A.PERSISTENT_LEARNER, metrics.persistenceScore > 85);
      check(A.ADAPTIVE_THINKER, metrics.adaptabilityScore > 85);
      check(A.CONSISTENCY_CHAMPION, metrics.consistencyScore > 90);
    }

    // Get reading specific attempts for READING_EXPLORER
    if (!existingCodes.has(A.READING_EXPLORER.code)) {
      const { data: readingCount } = await supabase
        .from('assessment_sessions')
        .select('id', { count: 'exact' })
        .eq('student_id', userId)
        .eq('status', 'completed')
        .eq('assessment_type', 'reading');
        
      if ((readingCount?.length || 0) >= 3) {
        check(A.READING_EXPLORER, true);
      }
    }

    // Insert new achievements
    for (const achievement of newlyUnlocked) {
      await supabase.from('student_achievements').insert({
        student_id: userId,
        achievement_code: achievement.code,
        achievement_name: achievement.name,
        achievement_description: achievement.description,
        icon: achievement.icon,
        xp_awarded: achievement.xpAwarded
      });
    }

    return newlyUnlocked;
  },

  async getStudentRewards(userId: string) {
    const { data } = await supabase
      .from('student_rewards')
      .select('*')
      .eq('student_id', userId)
      .single();
    
    if (data) {
      return {
        xp: data.xp,
        level: data.level,
        totalAssessments: data.total_assessments
      };
    }
    return { xp: 0, level: 1, totalAssessments: 0 };
  },

  async getStudentAchievements(userId: string) {
    const { data } = await supabase
      .from('student_achievements')
      .select('*')
      .eq('student_id', userId)
      .order('earned_at', { ascending: false });
    
    return data || [];
  },
  
  async awardRecommendationXP(userId: string, category: string): Promise<void> {
    const xpAwarded = 20; // 20 XP per recommendation
    
    // 1. Give XP
    const { data: rewardData } = await supabase
      .from('student_rewards')
      .select('xp, current_streak, highest_streak, last_activity_date')
      .eq('student_id', userId)
      .single();

    if (rewardData) {
      await supabase
        .from('student_rewards')
        .update({
          xp: rewardData.xp + xpAwarded,
          last_activity_date: new Date().toISOString()
        })
        .eq('student_id', userId);
    }

    // 2. Check achievements
    const { data: recsCountData } = await supabase
      .from('student_recommendations')
      .select('id, category', { count: 'exact' })
      .eq('student_id', userId)
      .eq('completed', true);

    const totalRecs = recsCountData?.length || 0;
    const categoryCount = recsCountData?.filter(r => r.category === category).length || 0;

    const { data: existingAchievements } = await supabase
      .from('student_achievements')
      .select('achievement_code')
      .eq('student_id', userId);

    const existingCodes = new Set(existingAchievements?.map(a => a.achievement_code) || []);
    const newlyUnlocked: UnlockedAchievement[] = [];
    const A = REWARDS_CONFIG.achievements;

    const check = (conf: any, condition: boolean) => {
      if (condition && conf && !existingCodes.has(conf.code)) {
        newlyUnlocked.push({
          code: conf.code,
          name: conf.name,
          description: conf.description,
          icon: conf.icon,
          xpAwarded: conf.xp_awarded
        });
      }
    };

    check(A.CONSISTENT_PRACTICE, totalRecs >= 10);
    check(A.SKILL_MASTER, totalRecs >= 25);

    if (category === 'reading') {
      check(A.READING_IMPROVER, categoryCount >= 5);
    }
    if (category === 'focus' || category === 'attention') {
      check(A.FOCUS_BUILDER, categoryCount >= 5);
    }

    // Grant newly unlocked
    for (const achievement of newlyUnlocked) {
      await supabase.from('student_achievements').insert({
        student_id: userId,
        achievement_code: achievement.code,
        achievement_name: achievement.name,
        achievement_description: achievement.description,
        icon: achievement.icon,
        xp_awarded: achievement.xpAwarded
      });
      // Add achievement XP
      await supabase
        .from('student_rewards')
        .update({ xp: (rewardData?.xp || 0) + xpAwarded + achievement.xpAwarded })
        .eq('student_id', userId);
    }
  },

  async awardActivityXPAndCheckAchievements(userId: string, xpAwarded: number, category: string): Promise<void> {
    const { data: rewardData } = await supabase
      .from('student_rewards')
      .select('xp')
      .eq('student_id', userId)
      .single();

    if (rewardData) {
      await supabase
        .from('student_rewards')
        .update({ xp: rewardData.xp + xpAwarded })
        .eq('student_id', userId);
    }

    const { data: attemptsCountData } = await supabase
      .from('student_activity_attempts')
      .select('id, learning_activities(category)')
      .eq('student_id', userId);

    const totalActivities = attemptsCountData?.length || 0;
    const readingActivities = attemptsCountData?.filter(a => a.learning_activities?.category === 'reading').length || 0;
    const attentionActivities = attemptsCountData?.filter(a => a.learning_activities?.category === 'attention' || a.learning_activities?.category === 'focus').length || 0;

    const { data: existingAchievements } = await supabase
      .from('student_achievements')
      .select('achievement_code')
      .eq('student_id', userId);

    const existingCodes = new Set(existingAchievements?.map(a => a.achievement_code) || []);
    const newlyUnlocked: UnlockedAchievement[] = [];
    const A = REWARDS_CONFIG.achievements;

    const check = (conf: any, condition: boolean) => {
      if (condition && conf && !existingCodes.has(conf.code)) {
        newlyUnlocked.push({
          code: conf.code,
          name: conf.name,
          description: conf.description,
          icon: conf.icon,
          xpAwarded: conf.xp_awarded
        });
      }
    };

    check(A.ACTIVITY_STARTER, totalActivities >= 1);
    check(A.READING_WARRIOR, readingActivities >= 10);
    check(A.FOCUS_TRAINER, attentionActivities >= 10);
    check(A.ACTIVITY_MASTER, totalActivities >= 50);

    for (const achievement of newlyUnlocked) {
      await supabase.from('student_achievements').insert({
        student_id: userId,
        achievement_code: achievement.code,
        achievement_name: achievement.name,
        achievement_description: achievement.description,
        icon: achievement.icon,
        xp_awarded: achievement.xpAwarded
      });
      await supabase
        .from('student_rewards')
        .update({ xp: (rewardData?.xp || 0) + xpAwarded + achievement.xpAwarded })
        .eq('student_id', userId);
    }
  }
};
