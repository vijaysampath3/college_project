import React, { useState, useEffect } from 'react';
import { useParentContext } from '../context/ParentContext';
import { 
  parentMonitoringService, 
  MonitoringOverview, 
  RiskAnalysis, 
  StrengthArea, 
  SupportArea, 
  InterventionStatus, 
  ParentVisibleNote,
  HomeSupportSummary
} from '../services/parentMonitoring.service';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { Card, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Star, 
  Target, 
  ClipboardList, 
  MessageSquare,
  Home as HomeIcon,
  CheckCircle2,
  Clock,
  AlertCircle
} from 'lucide-react';

export const ParentMonitoringPage: React.FC = () => {
  const { selectedStudent } = useParentContext();
  const [overview, setOverview] = useState<MonitoringOverview | null>(null);
  const [risk, setRisk] = useState<RiskAnalysis | null>(null);
  const [strengths, setStrengths] = useState<StrengthArea[]>([]);
  const [supportAreas, setSupportAreas] = useState<SupportArea[]>([]);
  const [interventions, setInterventions] = useState<InterventionStatus | null>(null);
  const [notes, setNotes] = useState<ParentVisibleNote[]>([]);
  const [homeSummary, setHomeSummary] = useState<HomeSupportSummary | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!selectedStudent) return;
      setIsLoading(true);
      setError(null);
      try {
        const [
          overviewData, 
          riskData, 
          strengthsData, 
          supportData, 
          interventionsData, 
          notesData,
          homeSummaryData
        ] = await Promise.all([
          parentMonitoringService.getOverview(selectedStudent.id),
          parentMonitoringService.getRiskAnalysis(selectedStudent.id),
          parentMonitoringService.getStrengths(selectedStudent.id),
          parentMonitoringService.getSupportAreas(selectedStudent.id),
          parentMonitoringService.getInterventions(selectedStudent.id),
          parentMonitoringService.getNotes(selectedStudent.id),
          parentMonitoringService.getHomeSupportSummary(selectedStudent.id)
        ]);

        setOverview(overviewData);
        setRisk(riskData);
        setStrengths(strengthsData);
        setSupportAreas(supportData);
        setInterventions(interventionsData);
        setNotes(notesData);
        setHomeSummary(homeSummaryData);
      } catch (err) {
        console.error("Failed to load monitoring data", err);
        setError("Failed to load monitoring data. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [selectedStudent]);

  const renderTrendIcon = (trend?: string) => {
    if (trend === 'Improving') return <TrendingUp className="w-5 h-5 text-green-500" />;
    if (trend === 'Declining') return <TrendingDown className="w-5 h-5 text-red-500" />;
    return <Minus className="w-5 h-5 text-gray-400" />;
  };

  const getRiskColor = (level: string) => {
    if (level === 'High Risk') return 'bg-red-50 text-red-700 border-red-200';
    if (level === 'Moderate Risk') return 'bg-amber-50 text-amber-700 border-amber-200';
    return 'bg-green-50 text-green-700 border-green-200';
  };

  if (!selectedStudent) {
    return (
      <DashboardLayout role="parent" title="Monitoring Center">
        <div className="flex justify-center items-center h-64 text-gray-500">
          No student selected.
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="parent" title="Monitoring Center">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Monitoring Center</h1>
        <p className="text-gray-600 mt-1">Current operational view and support guidance for {selectedStudent.studentName}</p>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 flex items-center gap-3">
          <AlertCircle className="w-5 h-5" />
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Top Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-gradient-to-br from-white to-blue-50/30">
              <CardContent className="p-5 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium">Risk Status</p>
                  <p className="text-xl font-bold text-gray-900">{overview?.riskStatus || 'N/A'}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-white to-purple-50/30">
              <CardContent className="p-5 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center text-purple-600">
                  <Target className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium">Readiness Score</p>
                  <p className="text-xl font-bold text-gray-900">{overview?.readinessScore || 0}%</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-white to-emerald-50/30">
              <CardContent className="p-5 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center">
                  {renderTrendIcon(overview?.overallTrend)}
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium">Overall Trend</p>
                  <p className="text-xl font-bold text-gray-900">{overview?.overallTrend || 'Stable'}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-white to-orange-50/30">
              <CardContent className="p-5 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center text-orange-600">
                  <ClipboardList className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium">Assigned Teacher</p>
                  <p className="text-xl font-bold text-gray-900">{overview?.assignedTeacher || 'None'}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content Area - Left Column */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Risk Analysis Card */}
              {risk && (
                <Card className={`border ${getRiskColor(risk.riskLevel)} shadow-sm`}>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-lg font-bold">Current Risk Assessment</h3>
                      <Badge variant={risk.riskLevel === 'High Risk' ? 'danger' : risk.riskLevel === 'Moderate Risk' ? 'warning' : 'success'}>
                        {risk.riskLevel}
                      </Badge>
                    </div>
                    <p className="text-lg font-medium opacity-90 mb-2">{risk.riskExplanation}</p>
                    <p className="text-sm opacity-75">
                      <strong>Focus Area:</strong> {risk.riskCategory}
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Interventions Card */}
              {interventions && (
                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                      <ClipboardList className="w-5 h-5 text-primary-500" />
                      Intervention Tracking
                    </h3>
                    
                    <div className="flex gap-4 mb-6">
                      <Badge variant="warning">{interventions.summary.pending} Pending</Badge>
                      <Badge variant="success">{interventions.summary.completed} Completed</Badge>
                      {interventions.summary.overdue > 0 && (
                        <Badge variant="danger">{interventions.summary.overdue} Overdue</Badge>
                      )}
                    </div>

                    <div className="space-y-4">
                      {interventions.items.length === 0 ? (
                        <p className="text-gray-500 text-sm py-4">No active interventions or assignments.</p>
                      ) : (
                        interventions.items.map(item => (
                          <div key={item.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                            <div className="flex items-start gap-3">
                              {item.status === 'completed' ? (
                                <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5" />
                              ) : item.status === 'overdue' ? (
                                <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
                              ) : (
                                <Clock className="w-5 h-5 text-blue-500 mt-0.5" />
                              )}
                              <div>
                                <p className="font-medium text-gray-900">{item.title}</p>
                                <p className="text-sm text-gray-500 capitalize">{item.type}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <Badge variant={item.status === 'completed' ? 'success' : item.status === 'overdue' ? 'danger' : 'default'}>
                                {item.status}
                              </Badge>
                              {item.dueDate && (
                                <p className="text-xs text-gray-500 mt-1">
                                  Due: {new Date(item.dueDate).toLocaleDateString()}
                                </p>
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Teacher Guidance Notes */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-primary-500" />
                    Teacher Guidance
                  </h3>
                  <div className="space-y-4">
                    {notes.length === 0 ? (
                      <p className="text-gray-500 text-sm py-4">No specific guidance notes from the teacher at this time.</p>
                    ) : (
                      notes.map(note => (
                        <div key={note.id} className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                          <p className="text-gray-800 text-sm leading-relaxed whitespace-pre-wrap">{note.note}</p>
                          <div className="flex justify-between items-center mt-3 text-xs text-gray-500">
                            <span>{note.author}</span>
                            <span>{new Date(note.date).toLocaleDateString()}</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>

            </div>

            {/* Right Column */}
            <div className="space-y-6">
              
              {/* Home Support Summary Card */}
              {homeSummary && (
                <Card className="bg-gradient-to-br from-primary-600 to-secondary-600 text-white shadow-lg shadow-primary-500/20">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-white">
                      <HomeIcon className="w-5 h-5 text-primary-100" />
                      Home Support Summary
                    </h3>
                    <div className="space-y-4 text-sm text-primary-50">
                      <div>
                        <p className="font-semibold text-white mb-1">What is improving?</p>
                        <p>{homeSummary.improving}</p>
                      </div>
                      <div>
                        <p className="font-semibold text-white mb-1">What needs attention?</p>
                        <p>{homeSummary.attention}</p>
                      </div>
                      <div>
                        <p className="font-semibold text-white mb-2">What you can do at home:</p>
                        <ul className="space-y-2">
                          {homeSummary.actions.map((action, i) => (
                            <li key={i} className="flex gap-2">
                              <span className="text-secondary-300">•</span>
                              <span>{action}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Strengths Card */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-md font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Star className="w-4 h-4 text-amber-500" />
                    Top Strengths
                  </h3>
                  {strengths.length === 0 ? (
                    <p className="text-sm text-gray-500">Not enough data to determine strengths.</p>
                  ) : (
                    <div className="space-y-3">
                      {strengths.map((s, i) => (
                        <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <span className="font-medium text-gray-800">{s.area}</span>
                          <span className="text-sm text-green-600 font-semibold">Excellent</span>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Support Areas Card */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-md font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Target className="w-4 h-4 text-red-500" />
                    Areas Requiring Support
                  </h3>
                  {supportAreas.length === 0 ? (
                    <p className="text-sm text-gray-500">No specific support areas identified currently.</p>
                  ) : (
                    <div className="space-y-3">
                      {supportAreas.map((s, i) => (
                        <div key={i} className="p-3 bg-red-50/50 border border-red-100 rounded-lg">
                          <div className="flex justify-between items-center mb-1">
                            <span className="font-medium text-gray-800">{s.area}</span>
                            <span className="text-xs text-red-600 font-medium">Needs Focus</span>
                          </div>
                          <p className="text-xs text-gray-500">{s.guidance}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};
