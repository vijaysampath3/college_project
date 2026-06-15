import { supabase } from '../lib/supabase';

export interface AssessmentResultData {
  metrics: Record<string, any>;
  risk?: Record<string, any>;
  recommendations?: string[];
  [key: string]: any;
}

class AssessmentService {
  /**
   * Starts a new assessment session and updates progress status to in_progress
   */
  async startAssessment(userId: string, assessmentType: string, schoolName?: string, passageData?: { id: string, category: string, difficulty: string }) {
    let resolvedSchoolName = schoolName;

    // Fetch school_name from profile if not provided
    if (!resolvedSchoolName) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('school_name')
        .eq('id', userId)
        .single();
      if (profile) resolvedSchoolName = profile.school_name;
    }

    // 1. Upsert progress
    const { error: progressError } = await supabase
      .from('assessment_progress')
      .upsert({
        student_id: userId,
        assessment_type: assessmentType,
        status: 'in_progress',
        school_name: resolvedSchoolName,
        updated_at: new Date().toISOString()
      }, { onConflict: 'student_id, assessment_type' });

    if (progressError) throw progressError;

    // 2. Determine attempt number
    const { count } = await supabase
      .from('assessment_sessions')
      .select('*', { count: 'exact', head: true })
      .eq('student_id', userId)
      .eq('assessment_type', assessmentType);

    const attemptNumber = (count || 0) + 1;

    // 3. Create session
    const { data: sessionData, error: sessionError } = await supabase
      .from('assessment_sessions')
      .insert({
        student_id: userId,
        assessment_type: assessmentType,
        status: 'in_progress',
        attempt_number: attemptNumber,
        school_name: resolvedSchoolName,
        passage_id: passageData?.id,
        passage_category: passageData?.category,
        passage_difficulty: passageData?.difficulty,
      })
      .select('id, attempt_number')
      .single();

    if (sessionError) throw sessionError;

    return { id: sessionData.id, attemptNumber: sessionData.attempt_number };
  }

  /**
   * Updates intermediate progress (if applicable)
   */
  async updateProgress(userId: string, assessmentType: string, progressPercentage: number) {
    const { error } = await supabase
      .from('assessment_progress')
      .update({
        progress_percentage: progressPercentage,
        updated_at: new Date().toISOString()
      })
      .eq('student_id', userId)
      .eq('assessment_type', assessmentType);

    if (error) throw error;
  }

  /**
   * Completes an assessment session and updates overall progress to completed
   */
  async completeAssessment(userId: string, assessmentType: string, sessionId: string, durationSeconds: number) {
    const now = new Date().toISOString();
    
    // 1. Complete Session
    const { error: sessionError } = await supabase
      .from('assessment_sessions')
      .update({
        status: 'completed',
        completed_at: now,
        duration_seconds: durationSeconds
      })
      .eq('id', sessionId);

    if (sessionError) throw sessionError;

    // 2. Complete Progress
    const { error: progressError } = await supabase
      .from('assessment_progress')
      .update({
        status: 'completed',
        progress_percentage: 100,
        completed_at: now,
        updated_at: now
      })
      .eq('student_id', userId)
      .eq('assessment_type', assessmentType);

    if (progressError) throw progressError;
  }

  /**
   * Saves the structured results of the assessment
   */
  async saveResults(userId: string, assessmentType: string, version: string, resultData: AssessmentResultData, schoolName?: string) {
    let resolvedSchoolName = schoolName;

    if (!resolvedSchoolName) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('school_name')
        .eq('id', userId)
        .single();
      if (profile) resolvedSchoolName = profile.school_name;
    }

    const { error } = await supabase
      .from('assessment_results')
      .insert({
        student_id: userId,
        assessment_type: assessmentType,
        assessment_version: version,
        result_data: resultData,
        school_name: resolvedSchoolName
      });

    if (error) throw error;
  }

  /**
   * Fetches the overall progress state for a student
   */
  async getStudentProgress(userId: string) {
    const { data, error } = await supabase
      .from('assessment_progress')
      .select('*')
      .eq('student_id', userId);

    if (error) throw error;
    return data;
  }

  /**
   * Fetches historical results for a specific assessment type
   */
  async getAssessmentResults(userId: string, assessmentType: string) {
    const { data, error } = await supabase
      .from('assessment_results')
      .select('*')
      .eq('student_id', userId)
      .eq('assessment_type', assessmentType)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  /**
   * Fetches all sessions for a specific assessment type
   */
  async getAssessmentSessions(userId: string, assessmentType: string) {
    const { data, error } = await supabase
      .from('assessment_sessions')
      .select('*')
      .eq('student_id', userId)
      .eq('assessment_type', assessmentType)
      .order('attempt_number', { ascending: false });

    if (error) throw error;
    return data;
  }

  /**
   * Fetches the latest session or result for an assessment type
   */
  async getLatestAssessment(userId: string, assessmentType: string) {
    const { data, error } = await supabase
      .from('assessment_sessions')
      .select('*')
      .eq('student_id', userId)
      .eq('assessment_type', assessmentType)
      .eq('status', 'completed')
      .order('completed_at', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') throw error; // ignore 0 rows error
    return data || null;
  }

  /**
   * Fetches an active, unexpired session for a specific assessment type
   */
  async getActiveSession(userId: string, assessmentType: string) {
    // 24 hour expiry
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    
    const { data, error } = await supabase
      .from('assessment_sessions')
      .select('*')
      .eq('student_id', userId)
      .eq('assessment_type', assessmentType)
      .eq('status', 'in_progress')
      .gt('started_at', oneDayAgo)
      .order('started_at', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data || null;
  }

  /**
   * Updates intermediate session data JSON
   */
  async updateSessionData(sessionId: string, data: any) {
    const { error } = await supabase
      .from('assessment_sessions')
      .update({
        session_data: data
      })
      .eq('id', sessionId);

    if (error) throw error;
  }

  /**
   * Abandons an active session
   */
  async abandonSession(sessionId: string) {
    const { error } = await supabase
      .from('assessment_sessions')
      .update({
        status: 'abandoned',
        completed_at: new Date().toISOString()
      })
      .eq('id', sessionId);

    if (error) throw error;
  }
}

export const assessmentService = new AssessmentService();
