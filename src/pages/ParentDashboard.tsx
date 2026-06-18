import React, { useEffect, useState } from 'react';
import { BookOpen, Brain, Target, TrendingUp, ArrowRight, Lightbulb, Heart, Calendar, ChevronDown, Activity, CheckCircle, FileText } from 'lucide-react';
import { DashboardLayout } from '../components/layout';
import { Card, CardContent, StatCard, Badge } from '../components/ui';
import { ChildProgressChart } from '../components/charts';
import { useParentContext } from '../context/ParentContext';
import { parentDashboardService, ParentProfile, ParentDashboardSummary } from '../services/parentDashboard.service';

const ParentDashboard: React.FC = () => {
  const { selectedStudent, setSelectedStudent, linkedStudents, setLinkedStudents, isLoadingStudents, setIsLoadingStudents } = useParentContext();
  const [profile, setProfile] = useState<ParentProfile | null>(null);
  const [summary, setSummary] = useState<ParentDashboardSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setIsLoadingStudents(true);
        const [parentData, studentsData] = await Promise.all([
          parentDashboardService.getCurrentParent(),
          parentDashboardService.getLinkedStudents()
        ]);
        setProfile(parentData);
        setLinkedStudents(studentsData);
      } catch (error) {
        console.error('Error fetching parent data:', error);
      } finally {
        setIsLoadingStudents(false);
      }
    };
    fetchInitialData();
  }, []);

  useEffect(() => {
    const fetchSummary = async () => {
      if (selectedStudent) {
        setIsLoading(true);
        try {
          const summaryData = await parentDashboardService.getDashboardSummary(selectedStudent.id);
          setSummary(summaryData);
        } catch (error) {
          console.error('Error fetching dashboard summary:', error);
        } finally {
          setIsLoading(false);
        }
      }
    };
    fetchSummary();
  }, [selectedStudent]);

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'success';
    if (score >= 60) return 'primary';
    if (score >= 40) return 'warning';
    return 'danger';
  };

  if (isLoadingStudents || !profile) {
    return (
      <DashboardLayout role="parent" title="Parent Dashboard">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="parent" title="Parent Dashboard">
      {/* Welcome Section */}
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome, {profile.parentName}!</h1>
          <p className="text-gray-600">Monitor your child's learning progress and discover helpful recommendations.</p>
        </div>
        
        {linkedStudents.length > 1 && (
          <div className="relative">
            <select
              className="appearance-none bg-white border border-gray-200 rounded-xl py-3 pl-4 pr-10 focus:outline-none focus:ring-2 focus:ring-primary-500 font-medium text-gray-700 shadow-sm"
              value={selectedStudent?.id || ''}
              onChange={(e) => {
                const student = linkedStudents.find(s => s.id === e.target.value);
                if (student) setSelectedStudent(student);
              }}
            >
              {linkedStudents.map(student => (
                <option key={student.id} value={student.id}>{student.studentName}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
          </div>
        )}
      </div>

      {!selectedStudent ? (
        <Card>
          <CardContent className="p-8 text-center text-gray-500">
            No students linked to this account. Please contact the school.
          </CardContent>
        </Card>
      ) : isLoading || !summary ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
        </div>
      ) : (
        <>

      {/* Child Overview Card */}
      <div className="mb-8">
        <Card className="overflow-hidden">
          <div className="bg-gradient-to-r from-primary-500 via-primary-600 to-secondary-600 p-6">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-white font-bold text-2xl">
                {selectedStudent.studentName.charAt(0)}
              </div>
              <div className="flex-1 text-white">
                <h2 className="text-2xl font-bold mb-1">{selectedStudent.studentName}</h2>
                <p className="text-white/80">{selectedStudent.grade} • {selectedStudent.schoolName}</p>
              </div>
              <div className="hidden md:flex items-center gap-8">
                <div className="text-center">
                  <p className="text-3xl font-bold text-white">{summary.readingScore}%</p>
                  <p className="text-white/80 text-sm">Reading</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-white">{summary.attentionScore}%</p>
                  <p className="text-white/80 text-sm">Attention</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-white">{summary.learningScore}%</p>
                  <p className="text-white/80 text-sm">Learning</p>
                </div>
              </div>
            </div>
          </div>
          <CardContent>
            <div className="grid grid-cols-3 gap-8 md:hidden">
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">{summary.readingScore}%</p>
                <p className="text-gray-500 text-sm">Reading</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">{summary.attentionScore}%</p>
                <p className="text-gray-500 text-sm">Attention</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">{summary.learningScore}%</p>
                <p className="text-gray-500 text-sm">Learning</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Score Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard
          title="Reading Progress"
          value={`${summary.readingScore}%`}
          subtitle="Overall reading capability"
          trend="up"
          icon={<BookOpen className="w-6 h-6" />}
          color={getScoreColor(summary.readingScore)}
        />
        <StatCard
          title="Attention Score"
          value={`${summary.attentionScore}%`}
          subtitle="Overall focus capability"
          trend="up"
          icon={<Target className="w-6 h-6" />}
          color={getScoreColor(summary.attentionScore)}
        />
        <StatCard
          title="Learning Score"
          value={`${summary.learningScore}%`}
          subtitle={summary.progressSummary}
          trend={summary.riskStatus === 'Low' || summary.riskStatus === 'Moderate' ? 'up' : 'down'}
          icon={<Brain className="w-6 h-6" />}
          color={getScoreColor(summary.learningScore)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard
          title="Assigned Activities"
          value={summary.assignedActivitiesCount.toString()}
          subtitle="From Teacher"
          icon={<Activity className="w-6 h-6" />}
          color="primary"
        />
        <StatCard
          title="Pending Assessments"
          value={summary.pendingAssessmentsCount.toString()}
          subtitle="Requires attention"
          icon={<FileText className="w-6 h-6" />}
          color={summary.pendingAssessmentsCount > 0 ? "warning" : "success"}
        />
        <StatCard
          title="Learning Path"
          value={`${summary.learningPathCompletion}%`}
          subtitle="Completion status"
          icon={<CheckCircle className="w-6 h-6" />}
          color="success"
        />
      </div>

      {/* Progress Chart */}
      <div className="mb-8">
        <Card>
          <CardContent>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Progress Over Time</h3>
                <p className="text-sm text-gray-500">Track improvement across all areas</p>
              </div>
              <Badge variant="primary">Academic Year</Badge>
            </div>
            {summary.progressHistory && summary.progressHistory.length > 0 ? (
              <ChildProgressChart data={summary.progressHistory} height={300} />
            ) : (
              <div className="flex justify-center items-center h-48 text-gray-500">
                No progress history available.
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Assessments & Recommendations */}
      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardContent>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary-500" />
                <h3 className="text-lg font-bold text-gray-900">Recent Assessments</h3>
              </div>
            </div>
            <div className="space-y-4">
              {/* Future: Map real recent assessments here */}
              <div className="text-center text-gray-500 py-4">
                No recent assessments found.
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-warning-500" />
                <h3 className="text-lg font-bold text-gray-900">Activities at Home</h3>
              </div>
              <Badge variant="success">Easy to Do</Badge>
            </div>
            <div className="space-y-4">
              {summary.latestRecommendation ? (
                <div className="p-4 rounded-xl border border-primary-100 bg-primary-50">
                  <div className="flex items-start gap-4">
                    <div className="p-2 rounded-lg bg-primary-100 text-primary-600">
                      <Lightbulb className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">Latest Recommendation</h4>
                      <p className="text-sm text-gray-600 mt-1">{summary.latestRecommendation}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center text-gray-500 py-4">
                  No activities recommended at this time.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Encouragement Card */}
      <Card className="bg-gradient-to-br from-success-50 to-primary-50 border-success-200">
        <CardContent>
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-xl bg-success-100">
              <Heart className="w-6 h-6 text-success-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Great Progress!</h3>
              <p className="text-gray-600">
                {selectedStudent.studentName} has shown consistent improvement across all areas. Keep encouraging their learning journey at home.
                Your support makes a real difference!
              </p>
              <div className="mt-4 flex gap-4">
                <div className="flex items-center gap-2 text-success-600">
                  <TrendingUp className="w-4 h-4" />
                  <span className="font-medium">+15% overall improvement</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      </>
      )}
    </DashboardLayout>
  );
};

export default ParentDashboard;
