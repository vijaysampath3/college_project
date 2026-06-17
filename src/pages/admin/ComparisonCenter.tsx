import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../../components/layout';
import { Card, CardContent, StatCard, Badge, Button } from '../../components/ui';
import { Building, Users, GraduationCap, HeartHandshake, FileText, Brain, TrendingUp, AlertTriangle, ArrowUpRight, BarChart3, Activity } from 'lucide-react';
import {
  comparisonService,
  SchoolComparisonData,
  RiskComparisonData,
  TeacherComparisonData,
  AssessmentAnalyticsData,
  InterventionAnalyticsData,
  SchoolRankingData,
  PlatformHealthComparisonData
} from '../../services/comparison.service';

export const ComparisonCenter: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [schools, setSchools] = useState<SchoolComparisonData[]>([]);
  const [risks, setRisks] = useState<RiskComparisonData[]>([]);
  const [teachers, setTeachers] = useState<TeacherComparisonData[]>([]);
  const [assessments, setAssessments] = useState<AssessmentAnalyticsData[]>([]);
  const [interventions, setInterventions] = useState<InterventionAnalyticsData | null>(null);
  const [rankings, setRankings] = useState<SchoolRankingData[]>([]);
  const [health, setHealth] = useState<PlatformHealthComparisonData | null>(null);
  const [sortConfig, setSortConfig] = useState<{ key: keyof SchoolComparisonData; direction: 'asc' | 'desc' } | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [
          schoolsData,
          risksData,
          teachersData,
          assessmentsData,
          interventionsData,
          rankingsData,
          healthData
        ] = await Promise.all([
          comparisonService.getSchoolComparison(),
          comparisonService.getRiskComparison(),
          comparisonService.getTeacherComparison(),
          comparisonService.getAssessmentAnalytics(),
          comparisonService.getInterventionAnalytics(),
          comparisonService.getSchoolRankings(),
          comparisonService.getPlatformHealth()
        ]);

        setSchools(schoolsData);
        setRisks(risksData);
        setTeachers(teachersData);
        setAssessments(assessmentsData);
        setInterventions(interventionsData);
        setRankings(rankingsData);
        setHealth(healthData);
      } catch (error) {
        console.error("Failed to load comparison analytics", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const sortedSchools = React.useMemo(() => {
    let sortableSchools = [...schools];
    if (sortConfig !== null) {
      sortableSchools.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableSchools;
  }, [schools, sortConfig]);

  const requestSort = (key: keyof SchoolComparisonData) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  if (loading) {
    return (
      <DashboardLayout role="admin" title="Comparison Center">
        <div className="flex h-64 items-center justify-center">
          <p className="text-gray-500 font-medium animate-pulse">Loading Platform Intelligence...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="admin" title="Comparison Center">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Comparison & Analytics</h1>
        <p className="text-gray-600">Executive intelligence layer for platform-wide performance.</p>
      </div>

      {/* Section 7: Platform Health */}
      <div className="mb-10">
        <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Activity className="w-5 h-5 text-primary-600" />
          Executive Summary (Platform Health)
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-primary-50 to-white">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-primary-600">Registered Entities</p>
                <div className="flex gap-4 mt-2">
                  <div>
                    <span className="text-2xl font-bold text-gray-900">{health?.totalSchools || 0}</span>
                    <span className="text-xs text-gray-500 ml-1">Schools</span>
                  </div>
                  <div>
                    <span className="text-2xl font-bold text-gray-900">{health?.totalTeachers || 0}</span>
                    <span className="text-xs text-gray-500 ml-1">Teachers</span>
                  </div>
                </div>
              </div>
              <Building className="w-8 h-8 text-primary-200" />
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-secondary-50 to-white">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-secondary-600">Active Users</p>
                <div className="flex gap-4 mt-2">
                  <div>
                    <span className="text-2xl font-bold text-gray-900">{health?.totalStudents || 0}</span>
                    <span className="text-xs text-gray-500 ml-1">Students</span>
                  </div>
                  <div>
                    <span className="text-2xl font-bold text-gray-900">{health?.totalParents || 0}</span>
                    <span className="text-xs text-gray-500 ml-1">Parents</span>
                  </div>
                </div>
              </div>
              <Users className="w-8 h-8 text-secondary-200" />
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-success-50 to-white">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-success-600">Diagnostics Generated</p>
                <div className="flex gap-4 mt-2">
                  <div>
                    <span className="text-2xl font-bold text-gray-900">{health?.reportsGenerated || 0}</span>
                    <span className="text-xs text-gray-500 ml-1">Reports</span>
                  </div>
                  <div>
                    <span className="text-2xl font-bold text-gray-900">{health?.recommendationsGenerated || 0}</span>
                    <span className="text-xs text-gray-500 ml-1">Recs</span>
                  </div>
                </div>
              </div>
              <FileText className="w-8 h-8 text-success-200" />
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-warning-50 to-white">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-warning-600">Intervention (Upcoming)</p>
                <div className="flex gap-4 mt-2">
                  <div>
                    <span className="text-2xl font-bold text-gray-900">{health?.learningPathsGenerated || 0}</span>
                    <span className="text-xs text-gray-500 ml-1">Paths</span>
                  </div>
                  <div>
                    <span className="text-2xl font-bold text-gray-900">{health?.activitiesCompleted || 0}</span>
                    <span className="text-xs text-gray-500 ml-1">Activities</span>
                  </div>
                </div>
              </div>
              <Brain className="w-8 h-8 text-warning-200" />
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mb-10">
        {/* Section 6: School Rankings (SPI v1) */}
        <div className="lg:col-span-1">
          <Card className="h-full">
            <CardContent>
              <div className="mb-6">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-success-600" />
                  Top 10 Schools (SPI)
                </h3>
                <p className="text-xs text-gray-500 mt-1">Based on School Performance Index (SPI v1)</p>
              </div>
              <div className="space-y-4">
                {rankings.length === 0 ? (
                  <p className="text-sm text-gray-500 italic text-center py-4">No data available</p>
                ) : (
                  rankings.map((r, idx) => (
                    <div key={r.id} className="flex items-center gap-4">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${idx < 3 ? 'bg-primary-100 text-primary-700' : 'bg-gray-100 text-gray-600'}`}>
                        {idx + 1}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 text-sm">{r.school_name}</p>
                      </div>
                      <div className="text-right">
                        <Badge variant="success">{r.spiScore.toFixed(1)} SPI</Badge>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Section 2: Risk Comparison (Donut/Stacked representation) */}
        <div className="lg:col-span-2">
          <Card className="h-full">
            <CardContent>
              <div className="mb-6">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-warning-600" />
                  Risk Distribution by School
                </h3>
                <p className="text-xs text-gray-500 mt-1">Based on the latest report per student.</p>
              </div>
              <div className="space-y-6">
                {risks.length === 0 ? (
                  <p className="text-sm text-gray-500 italic text-center py-4">No data available</p>
                ) : (
                  risks.map((risk, idx) => {
                    const total = risk.total || 1;
                    const lowPct = (risk.lowRisk / total) * 100;
                    const modPct = (risk.moderateRisk / total) * 100;
                    const highPct = (risk.highRisk / total) * 100;

                    return (
                      <div key={idx} className="mb-2">
                        <div className="flex justify-between text-sm mb-1">
                          <span className="font-medium text-gray-900">{risk.school_name}</span>
                          <span className="text-gray-500">{risk.total} Evaluated</span>
                        </div>
                        <div className="w-full h-4 bg-gray-100 rounded-full overflow-hidden flex">
                          <div style={{ width: `${lowPct}%` }} className="bg-success-500 h-full" title={`Low Risk: ${risk.lowRisk}`}></div>
                          <div style={{ width: `${modPct}%` }} className="bg-warning-500 h-full" title={`Moderate Risk: ${risk.moderateRisk}`}></div>
                          <div style={{ width: `${highPct}%` }} className="bg-danger-500 h-full" title={`High Risk: ${risk.highRisk}`}></div>
                        </div>
                        <div className="flex justify-between text-xs mt-1 text-gray-500">
                          <span className="text-success-600">{lowPct.toFixed(1)}% Low</span>
                          <span className="text-warning-600">{modPct.toFixed(1)}% Mod</span>
                          <span className="text-danger-600">{highPct.toFixed(1)}% High</span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Section 1: School Comparison Table */}
      <Card className="mb-10">
        <CardContent>
          <div className="mb-6">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Building className="w-5 h-5 text-primary-600" />
              School Performance Details
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="pb-3 text-sm font-semibold text-gray-600 cursor-pointer" onClick={() => requestSort('school_name')}>School Name</th>
                  <th className="pb-3 text-sm font-semibold text-gray-600 cursor-pointer text-center" onClick={() => requestSort('totalStudents')}>Students</th>
                  <th className="pb-3 text-sm font-semibold text-gray-600 cursor-pointer text-center" onClick={() => requestSort('totalTeachers')}>Teachers</th>
                  <th className="pb-3 text-sm font-semibold text-gray-600 cursor-pointer text-center" onClick={() => requestSort('totalParents')}>Parents</th>
                  <th className="pb-3 text-sm font-semibold text-gray-600 cursor-pointer text-center" onClick={() => requestSort('assessmentCompletionRate')}>Assessments (%)</th>
                  <th className="pb-3 text-sm font-semibold text-gray-600 cursor-pointer text-center" onClick={() => requestSort('avgReadinessScore')}>Avg Readiness</th>
                  <th className="pb-3 text-sm font-semibold text-gray-600 cursor-pointer text-center" onClick={() => requestSort('highRiskPercentage')}>High Risk (%)</th>
                </tr>
              </thead>
              <tbody>
                {sortedSchools.map((s) => (
                  <tr key={s.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="py-3 text-sm font-medium text-gray-900">{s.school_name}</td>
                    <td className="py-3 text-sm text-gray-600 text-center">{s.totalStudents}</td>
                    <td className="py-3 text-sm text-gray-600 text-center">{s.totalTeachers}</td>
                    <td className="py-3 text-sm text-gray-600 text-center">{s.totalParents}</td>
                    <td className="py-3 text-sm text-center">
                      <Badge variant={s.assessmentCompletionRate > 75 ? 'success' : s.assessmentCompletionRate > 50 ? 'warning' : 'danger'} size="sm">
                        {s.assessmentCompletionRate}%
                      </Badge>
                    </td>
                    <td className="py-3 text-sm font-semibold text-gray-900 text-center">{s.avgReadinessScore}</td>
                    <td className="py-3 text-sm text-center">
                      <span className={s.highRiskPercentage > 30 ? 'text-danger-600 font-bold' : 'text-gray-600'}>
                        {s.highRiskPercentage}%
                      </span>
                    </td>
                  </tr>
                ))}
                {sortedSchools.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-gray-500">No schools found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-2 gap-6 mb-10">
        {/* Section 3: Teacher Leaderboard */}
        <Card>
          <CardContent>
            <div className="mb-6">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Users className="w-5 h-5 text-secondary-600" />
                Teacher Leaderboard (TEI)
              </h3>
              <p className="text-xs text-gray-500 mt-1">Based on Teacher Effectiveness Index</p>
            </div>
            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
              {teachers.length === 0 ? (
                <p className="text-sm text-gray-500 italic text-center py-4">No data available</p>
              ) : (
                teachers.map((t, idx) => (
                  <div key={t.id} className="p-3 border border-gray-100 rounded-xl hover:shadow-sm transition-all flex items-center gap-4">
                    <div className="w-8 h-8 bg-secondary-100 text-secondary-700 rounded-full flex items-center justify-center font-bold text-sm">
                      {idx + 1}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{t.teacher_name}</p>
                      <p className="text-xs text-gray-500">{t.school_name}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-secondary-600">{t.teiScore.toFixed(1)}</p>
                      <p className="text-xs text-gray-400">TEI</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Section 4: Assessment Analytics */}
        <Card>
          <CardContent>
            <div className="mb-6">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-primary-600" />
                Assessment Analytics
              </h3>
              <p className="text-xs text-gray-500 mt-1">Usage and completion across platform</p>
            </div>
            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
              {assessments.length === 0 ? (
                <p className="text-sm text-gray-500 italic text-center py-4">No data available</p>
              ) : (
                assessments.map((a, idx) => (
                  <div key={idx} className="p-3 bg-gray-50 rounded-xl flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{a.assessmentName}</p>
                      <p className="text-xs text-gray-500 mt-1">Avg Duration: {a.avgDurationSeconds > 0 ? `${Math.floor(a.avgDurationSeconds / 60)}m ${a.avgDurationSeconds % 60}s` : 'N/A'}</p>
                    </div>
                    <div className="text-right">
                      <Badge variant={a.completionRate > 70 ? 'success' : 'warning'}>{a.completionRate}% Done</Badge>
                      <p className="text-xs text-gray-400 mt-1">{a.totalAttempts} Attempts</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Section 5: Intervention Effectiveness */}
      <Card>
        <CardContent>
          <div className="mb-6">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Brain className="w-5 h-5 text-primary-600" />
              Intervention Effectiveness
            </h3>
            <p className="text-sm text-gray-600 mt-1">Measure the impact of NeuroLearn activities and paths.</p>
          </div>
          {interventions?.hasData ? (
            <div className="py-8 text-center border-2 border-dashed border-gray-200 rounded-xl">
              <p className="text-gray-500 italic">Intervention data loaded.</p>
            </div>
          ) : (
            <div className="py-12 bg-gray-50 rounded-xl flex flex-col items-center justify-center border border-gray-100">
              <AlertTriangle className="w-10 h-10 text-gray-400 mb-3" />
              <p className="font-medium text-gray-900">Insufficient intervention data available.</p>
              <p className="text-sm text-gray-500 mt-1 text-center max-w-md">
                Intervention analytics require longitudinal data from Learning Journeys and Activities. As students complete more tasks, this section will automatically populate.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
      
    </DashboardLayout>
  );
};
