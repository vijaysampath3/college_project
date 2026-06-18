import React, { useState, useEffect } from 'react';
import { useParentContext } from '../context/ParentContext';
import { parentProgressService, ProgressSummary, AssessmentHistoryItem, ProgressTrend, LearningPathProgress, SkillArea, TimelineAchievement } from '../services/parentProgress.service';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { Card, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { 
  TrendingUp, 
  TrendingDown, 
  Minus,
  Award, 
  Target, 
  BookOpen, 
  Activity,
  CheckCircle,
  Lightbulb,
  Clock,
  Map
} from 'lucide-react';
import { ChildProgressChart } from '../components/charts';

const ParentProgressPage: React.FC = () => {
  const { selectedStudent } = useParentContext();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [summary, setSummary] = useState<ProgressSummary | null>(null);
  const [assessments, setAssessments] = useState<AssessmentHistoryItem[]>([]);
  const [trends, setTrends] = useState<ProgressTrend[]>([]);
  const [learningPath, setLearningPath] = useState<LearningPathProgress | null>(null);
  const [strengths, setStrengths] = useState<SkillArea[]>([]);
  const [improvements, setImprovements] = useState<SkillArea[]>([]);
  const [timeline, setTimeline] = useState<TimelineAchievement[]>([]);

  useEffect(() => {
    if (!selectedStudent) return;
    
    const fetchAllData = async () => {
      setLoading(true);
      setError(null);
      try {
        const studentId = selectedStudent.id;
        const [
          sumRes,
          assRes,
          trendRes,
          pathRes,
          strRes,
          impRes,
          timeRes
        ] = await Promise.all([
          parentProgressService.getSummary(studentId),
          parentProgressService.getAssessmentHistory(studentId),
          parentProgressService.getTrends(studentId),
          parentProgressService.getLearningPath(studentId),
          parentProgressService.getStrengths(studentId),
          parentProgressService.getImprovements(studentId),
          parentProgressService.getAchievements(studentId)
        ]);

        setSummary(sumRes);
        setAssessments(assRes);
        setTrends(trendRes);
        setLearningPath(pathRes);
        setStrengths(strRes);
        setImprovements(impRes);
        setTimeline(timeRes);
      } catch (err) {
        console.error("Error loading progress data:", err);
        setError("Failed to load progress data.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchAllData();
  }, [selectedStudent]);

  if (!selectedStudent) {
    return (
      <DashboardLayout role="parent" title="Progress Center">
        <div className="flex justify-center items-center h-64 text-gray-500">
          No student selected.
        </div>
      </DashboardLayout>
    );
  }

  const getTrendIcon = (trend: string) => {
    if (trend === 'Improving') return <TrendingUp className="w-5 h-5 text-success-500" />;
    if (trend === 'Declining') return <TrendingDown className="w-5 h-5 text-danger-500" />;
    return <Minus className="w-5 h-5 text-gray-500" />;
  };

  const getRiskColor = (risk: string) => {
    if (risk === 'Severe' || risk === 'High') return 'danger';
    if (risk === 'Moderate') return 'warning';
    return 'success';
  };

  return (
    <DashboardLayout role="parent" title="Progress Center">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Academic Progress Center</h1>
        <p className="text-gray-600 mt-1">Detailed performance and achievement tracking for {selectedStudent.studentName}</p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
        </div>
      ) : error ? (
        <div className="bg-danger-50 text-danger-600 p-4 rounded-lg">{error}</div>
      ) : summary && (
        <>
          {/* Section 1: Overview */}
          <Card className="mb-8 bg-gradient-to-r from-primary-600 to-secondary-600 text-white">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-2xl font-bold backdrop-blur-sm">
                    {summary.studentName.charAt(0)}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">{summary.studentName}</h2>
                    <p className="text-white/80">{summary.grade} • {summary.schoolName}</p>
                    <p className="text-white/80 text-sm mt-1">Teacher: {summary.assignedTeacher}</p>
                  </div>
                </div>
                
                <div className="flex gap-6">
                  <div className="bg-white/10 p-4 rounded-xl backdrop-blur-sm text-center">
                    <p className="text-white/80 text-sm mb-1">Risk Status</p>
                    <Badge variant={getRiskColor(summary.riskStatus)}>{summary.riskStatus}</Badge>
                  </div>
                  <div className="bg-white/10 p-4 rounded-xl backdrop-blur-sm text-center min-w-[120px]">
                    <p className="text-white/80 text-sm mb-1">Overall Score</p>
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-3xl font-bold">{summary.overallScore}</span>
                      {getTrendIcon(summary.overallTrend)}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid lg:grid-cols-3 gap-8 mb-8">
            <div className="lg:col-span-2 space-y-8">
              
              {/* Section 3: Progress Trends */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">Progress Over Time</h3>
                      <p className="text-sm text-gray-500">Historical performance across assessed categories</p>
                    </div>
                  </div>
                  {trends.length > 0 ? (
                    <ChildProgressChart data={trends} height={350} />
                  ) : (
                    <div className="h-[350px] flex items-center justify-center text-gray-500">
                      Not enough historical data yet.
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Section 4: Learning Path Progress */}
              {learningPath && (
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-2 mb-6">
                      <Map className="w-5 h-5 text-primary-500" />
                      <h3 className="text-lg font-bold text-gray-900">Learning Path Progression</h3>
                    </div>
                    
                    <div className="mb-6">
                      <div className="flex justify-between items-end mb-2">
                        <div>
                          <p className="text-sm font-medium text-primary-600 uppercase tracking-wider">{learningPath.currentPath}</p>
                          <p className="text-2xl font-bold text-gray-900">{learningPath.completionPercentage}% Completed</p>
                        </div>
                        <Badge variant="primary">Week {learningPath.currentWeek}</Badge>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-3">
                        <div 
                          className="bg-primary-500 h-3 rounded-full transition-all duration-1000" 
                          style={{ width: `${learningPath.completionPercentage}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-success-50 p-4 rounded-xl border border-success-100">
                        <p className="text-sm text-success-700 mb-1">Completed Activities</p>
                        <p className="text-2xl font-bold text-success-800">{learningPath.completedActivities}</p>
                      </div>
                      <div className="bg-warning-50 p-4 rounded-xl border border-warning-100">
                        <p className="text-sm text-warning-700 mb-1">Remaining Activities</p>
                        <p className="text-2xl font-bold text-warning-800">{learningPath.remainingActivities}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Strengths & Improvements */}
              <div className="grid md:grid-cols-2 gap-6">
                {/* Section 5: Strengths */}
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <Award className="w-5 h-5 text-success-500" />
                      <h3 className="text-lg font-bold text-gray-900">Top Strengths</h3>
                    </div>
                    <div className="space-y-4">
                      {strengths.length > 0 ? strengths.map((s, idx) => (
                        <div key={idx} className="p-3 bg-success-50 rounded-lg border border-success-100">
                          <div className="flex justify-between items-center mb-1">
                            <span className="font-semibold text-success-900">{s.category}</span>
                            <span className="font-bold text-success-700">{s.score}%</span>
                          </div>
                          <p className="text-sm text-success-800/80">{s.description}</p>
                        </div>
                      )) : (
                        <p className="text-sm text-gray-500">Not enough data to determine strengths.</p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Section 6: Improvements */}
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <Target className="w-5 h-5 text-warning-500" />
                      <h3 className="text-lg font-bold text-gray-900">Focus Areas</h3>
                    </div>
                    <div className="space-y-4">
                      {improvements.length > 0 ? improvements.map((s, idx) => (
                        <div key={idx} className="p-3 bg-warning-50 rounded-lg border border-warning-100">
                          <div className="flex justify-between items-center mb-1">
                            <span className="font-semibold text-warning-900">{s.category}</span>
                            <span className="font-bold text-warning-700">{s.score}%</span>
                          </div>
                          <p className="text-sm text-warning-800/80">{s.description}</p>
                        </div>
                      )) : (
                        <p className="text-sm text-gray-500">Not enough data to determine focus areas.</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

            </div>

            <div className="space-y-8">
              
              {/* Section 2: Assessment History */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-6">
                    <Activity className="w-5 h-5 text-primary-500" />
                    <h3 className="text-lg font-bold text-gray-900">Recent Assessments</h3>
                  </div>
                  
                  <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
                    {assessments.length > 0 ? assessments.map((ass, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors border-b border-gray-100 last:border-0">
                        <div>
                          <p className="font-medium text-gray-900 text-sm">{ass.type}</p>
                          <p className="text-xs text-gray-500">{ass.date}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-gray-900">{ass.score}%</p>
                          {ass.improvement > 0 ? (
                            <span className="text-xs text-success-600 flex items-center justify-end gap-1">
                              <TrendingUp className="w-3 h-3" /> +{ass.improvement}%
                            </span>
                          ) : ass.improvement < 0 ? (
                            <span className="text-xs text-danger-600 flex items-center justify-end gap-1">
                              <TrendingDown className="w-3 h-3" /> {ass.improvement}%
                            </span>
                          ) : (
                            <span className="text-xs text-gray-500 flex items-center justify-end gap-1">
                              <Minus className="w-3 h-3" /> Stable
                            </span>
                          )}
                        </div>
                      </div>
                    )) : (
                      <div className="text-center text-gray-500 py-4">No assessments taken yet.</div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Section 7: Achievement Timeline */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-6">
                    <Clock className="w-5 h-5 text-primary-500" />
                    <h3 className="text-lg font-bold text-gray-900">Achievement Timeline</h3>
                  </div>
                  
                  <div className="relative pl-6 space-y-6 max-h-[400px] overflow-y-auto pr-2">
                    <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-gray-200"></div>
                    
                    {timeline.length > 0 ? timeline.map((event) => (
                      <div key={event.id} className="relative">
                        <div className={`absolute -left-[30px] p-1.5 rounded-full border-2 border-white ${
                          event.type === 'activity' ? 'bg-success-500' : 
                          event.type === 'assessment' ? 'bg-primary-500' : 'bg-warning-500'
                        }`}>
                          {event.type === 'activity' && <CheckCircle className="w-3 h-3 text-white" />}
                          {event.type === 'assessment' && <Activity className="w-3 h-3 text-white" />}
                          {event.type === 'recommendation' && <Lightbulb className="w-3 h-3 text-white" />}
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-0.5">{event.date}</p>
                          <p className="text-sm font-semibold text-gray-900">{event.title}</p>
                          <p className="text-sm text-gray-600">{event.description}</p>
                        </div>
                      </div>
                    )) : (
                      <div className="text-center text-gray-500 py-4">No recent achievements.</div>
                    )}
                  </div>
                </CardContent>
              </Card>

            </div>
          </div>
        </>
      )}
    </DashboardLayout>
  );
};

export default ParentProgressPage;
