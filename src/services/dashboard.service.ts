import { supabase } from '../lib/supabase';
import { ReadingAssessmentResult } from '../types/ReadingAssessmentResult';
import { calculateLevel } from '../config/rewards.config';

export interface DashboardScores {
  readingRiskScore: number;
  readingRiskLabel: string;
  comprehensionScore: string;
  attentionScore: string;
  typingScore: string;
  learningBehaviour: string;
  overallProgress: number;
}

export interface AssessmentHistoryEntry {
  id: string;
  date: string;
  attemptNumber: number;
  score: number; // Generic score for the chart (accuracy for reading, totalScore for comp)
  // Optional detailed metrics
  accuracy?: number;
  wpm?: number;
  confidence?: number;
}

export interface ActivityEntry {
  id: string;
  type: string;
  title: string;
  date: string;
  score: number;
  status: string;
}

export interface RecommendationEntry {
  id: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  category: string;
}

export interface Achievement {
  name: string;
  iconType: string;
  unlocked: boolean;
}

export interface XPProgress {
  level: number;
  currentXP: number;
  nextLevelXP: number | null;
  progressPercent: number;
}

export interface DashboardData {
  hasAssessments: boolean;
  scores: DashboardScores;
  readingHistory: AssessmentHistoryEntry[];
  comprehensionHistory: AssessmentHistoryEntry[];
  typingHistory: AssessmentHistoryEntry[];
  recentActivity: ActivityEntry[];
  recommendations: RecommendationEntry[];
  achievements: Achievement[];
  weeklyProgress: { day: string; minutes: number; assessments: number }[];
  xpProgress: XPProgress | null;
}

export const dashboardService = {
  async getDashboardData(userId: string): Promise<DashboardData> {
    // Fetch all required data in parallel
    const [
      sessionsResponse,
      resultsResponse,
      progressResponse,
      rewardsResponse,
      achievementsResponse
    ] = await Promise.all([
      supabase.from('assessment_sessions').select('*').eq('student_id', userId).order('completed_at', { ascending: false }),
      supabase.from('assessment_results').select('*').eq('student_id', userId).order('created_at', { ascending: false }),
      supabase.from('assessment_progress').select('*').eq('student_id', userId),
      supabase.from('student_rewards').select('*').eq('student_id', userId).maybeSingle(),
      supabase.from('student_achievements').select('*').eq('student_id', userId)
    ]);

    const sessions = sessionsResponse.data || [];
    const results = resultsResponse.data || [];
    const progress = progressResponse.data || [];
    const rewardData = rewardsResponse.data;
    const achievementsData = achievementsResponse.data || [];

    const completedSessions = sessions.filter(s => s.status === 'completed');
    const hasAssessments = completedSessions.length > 0;

    // 1. Calculate Scores
    let readingRiskScore = 0;
    let readingRiskLabel = 'Pending Assessment';
    
    // Find latest reading result
    const latestReadingResult = results.find(r => r.assessment_type === 'reading');
    
    if (latestReadingResult && latestReadingResult.result_data?.metrics) {
      const accuracy = latestReadingResult.result_data.metrics.accuracy || 0;
      readingRiskScore = Math.round(Math.max(0, 100 - accuracy)); // Lower accuracy = higher risk
      
      if (accuracy >= 85) readingRiskLabel = 'Low Risk';
      else if (accuracy >= 70) readingRiskLabel = 'Moderate Risk';
      else readingRiskLabel = 'High Risk';
    }

    let comprehensionScore = 'Pending Assessment';
    const latestCompResult = results.find(r => r.assessment_type === 'comprehension');
    if (latestCompResult && latestCompResult.result_data?.metrics) {
      comprehensionScore = `${latestCompResult.result_data.metrics.totalScore}%`;
    }

    let typingScore = 'Pending Assessment';
    const latestTypingResult = results.find(r => r.assessment_type === 'typing');
    if (latestTypingResult && latestTypingResult.result_data?.metrics) {
      typingScore = `${latestTypingResult.result_data.metrics.wpm} WPM`;
    }

    const totalProgress = progress.length > 0 
      ? Math.round((progress.filter(p => p.status === 'completed').length / progress.length) * 100) 
      : 0;

    const scores: DashboardScores = {
      readingRiskScore,
      readingRiskLabel,
      comprehensionScore,
      attentionScore: 'Pending Assessment',
      typingScore,
      learningBehaviour: 'Pending Assessment',
      overallProgress: totalProgress
    };

    // 2. Assessment History
    const readingHistory: AssessmentHistoryEntry[] = results
      .filter(r => r.assessment_type === 'reading' && r.result_data?.metrics)
      .map(r => {
        const metrics = r.result_data.metrics;
        return {
          id: r.id,
          date: `Attempt ${r.result_data.attemptNumber || 1}`,
          attemptNumber: r.result_data.attemptNumber || 1,
          score: metrics.accuracy || 0,
          accuracy: metrics.accuracy || 0,
          wpm: metrics.wpm || 0,
          confidence: r.result_data.whisper?.confidence || 0,
        };
      })
      .reverse();

    const comprehensionHistory: AssessmentHistoryEntry[] = results
      .filter(r => r.assessment_type === 'comprehension' && r.result_data?.metrics)
      .map(r => {
        const metrics = r.result_data.metrics;
        return {
          id: r.id,
          date: `Attempt ${r.result_data.attemptNumber || 1}`,
          attemptNumber: r.result_data.attemptNumber || 1,
          score: metrics.totalScore || 0,
        };
      })
      .reverse();

    const typingHistory: AssessmentHistoryEntry[] = results
      .filter(r => r.assessment_type === 'typing' && r.result_data?.metrics)
      .map(r => {
        const metrics = r.result_data.metrics;
        return {
          id: r.id,
          date: `Attempt ${r.result_data.attemptNumber || 1}`,
          attemptNumber: r.result_data.attemptNumber || 1,
          score: metrics.wpm || 0,
          accuracy: metrics.accuracy || 0,
        };
      })
      .reverse();

    // 3. Recent Activity
    const recentActivity: ActivityEntry[] = completedSessions.slice(0, 5).map(s => {
      // Find corresponding result to get score
      // Match by exact sessionId if present, else fallback to time-based matching (within 10 minutes)
      const result = results.find(r => {
        if (r.assessment_type !== s.assessment_type) return false;
        if (r.result_data?.sessionId === s.id) return true;
        
        if (!s.completed_at) return false;
        
        const rTime = new Date(r.created_at).getTime();
        const sTime = new Date(s.completed_at).getTime();
        return Math.abs(rTime - sTime) < 10 * 60 * 1000; // within 10 minutes
      });
      let score = 0;
      if (result?.result_data?.metrics) {
        if (s.assessment_type === 'reading') score = result.result_data.metrics.accuracy || 0;
        if (s.assessment_type === 'comprehension') score = result.result_data.metrics.totalScore || 0;
        if (s.assessment_type === 'typing') score = result.result_data.metrics.wpm || 0;
      }
      
      const titleMap: Record<string, string> = {
        'reading': 'Reading Assessment',
        'comprehension': 'Comprehension Test',
        'typing': 'Typing Assessment'
      };

      return {
        id: s.id,
        type: 'assessment',
        title: titleMap[s.assessment_type] || 'Assessment',
        date: new Date(s.completed_at).toLocaleDateString(),
        score,
        status: 'completed'
      };
    });

    // 4. Recommendations
    const recommendations: RecommendationEntry[] = [];
    if (latestReadingResult?.result_data?.insights?.recommendations) {
      const recs = latestReadingResult.result_data.insights.recommendations as string[];
      recs.forEach((rec, idx) => {
        recommendations.push({
          id: `rec_${idx}`,
          title: `Strategy ${idx + 1}`,
          description: rec,
          priority: idx === 0 ? 'high' : 'medium',
          category: 'reading'
        });
      });
    }

    // 5. Achievements (Real data)
    const dbAchievementCodes = new Set(achievementsData.map(a => a.achievement_code));
    
    // We map to the existing hardcoded names for now to preserve UI icons/layout, 
    // but their `unlocked` state comes purely from the DB.
    const achievements: Achievement[] = [
      { name: 'First Assessment', iconType: 'PlayCircle', unlocked: dbAchievementCodes.has('FIRST_ASSESSMENT') },
      { name: 'Reading Explorer', iconType: 'BookOpen', unlocked: dbAchievementCodes.has('READING_EXPLORER') },
      { name: 'Reading Master', iconType: 'Target', unlocked: dbAchievementCodes.has('READING_MASTER') },
      { name: 'Persistent Learner', iconType: 'Clock', unlocked: dbAchievementCodes.has('PERSISTENT_LEARNER') },
      { name: 'AI Feedback Received', iconType: 'Brain', unlocked: dbAchievementCodes.has('AI_FEEDBACK') },
      { name: 'Comprehension Starter', iconType: 'BookOpen', unlocked: dbAchievementCodes.has('COMPREHENSION_STARTER') },
      { name: 'Deep Thinker', iconType: 'Brain', unlocked: dbAchievementCodes.has('DEEP_THINKER') },
      { name: 'Inference Expert', iconType: 'Target', unlocked: dbAchievementCodes.has('INFERENCE_EXPERT') },
      { name: 'Knowledge Builder', iconType: 'Award', unlocked: dbAchievementCodes.has('KNOWLEDGE_BUILDER') },
      { name: 'Typing Starter', iconType: 'Keyboard', unlocked: dbAchievementCodes.has('TYPING_STARTER') },
      { name: 'Speed Demon', iconType: 'Zap', unlocked: dbAchievementCodes.has('SPEED_DEMON') },
      { name: 'Precision Typist', iconType: 'Target', unlocked: dbAchievementCodes.has('PRECISION_TYPIST') },
      { name: 'Focus Master', iconType: 'Brain', unlocked: dbAchievementCodes.has('FOCUS_MASTER') },
      { name: 'Rhythm Keeper', iconType: 'Activity', unlocked: dbAchievementCodes.has('RHYTHM_KEEPER') }
    ];

    // 6. XP Progress
    let xpProgress: XPProgress | null = null;
    if (rewardData) {
      const levelInfo = calculateLevel(rewardData.xp);
      xpProgress = {
        level: levelInfo.level,
        currentXP: rewardData.xp,
        nextLevelXP: levelInfo.nextLevelXP,
        progressPercent: levelInfo.progressPercent
      };
    } else {
      xpProgress = {
        level: 1,
        currentXP: 0,
        nextLevelXP: 100,
        progressPercent: 0
      };
    }

    // Generate last 7 days dynamically
    const weeklyProgress: { day: string; minutes: number; assessments: number }[] = [];
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      weeklyProgress.push({
        day: days[d.getDay()],
        minutes: 0,
        assessments: 0
      });
    }
    
    // Group recent sessions by day
    completedSessions.forEach(s => {
      if (!s.completed_at) return;
      const d = new Date(s.completed_at);
      const start = s.started_at ? new Date(s.started_at) : d;
      
      const diffMs = d.getTime() - start.getTime();
      const diffMins = Math.max(1, Math.round(diffMs / 1000 / 60)); // at least 1 min per session
      
      const today = new Date();
      // Only count if within last 7 days
      if ((today.getTime() - d.getTime()) <= 7 * 24 * 60 * 60 * 1000) {
        const dayName = days[d.getDay()];
        const target = weeklyProgress.find(w => w.day === dayName);
        if (target) {
          target.assessments += 1;
          target.minutes += diffMins;
        }
      }
    });

    return {
      hasAssessments,
      scores,
      readingHistory,
      comprehensionHistory,
      typingHistory,
      recentActivity,
      recommendations,
      achievements,
      weeklyProgress,
      xpProgress
    };
  }
};
