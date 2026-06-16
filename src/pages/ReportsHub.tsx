import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { reportsService } from '../services/reports.service';
import { StudentReport } from '../types/Report';
import { FileText, Download, Loader2, Brain, Activity, Clock, FileBarChart, CheckCircle2, TrendingUp } from 'lucide-react';
import { RiskCard } from '../components/reports/RiskCard';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

export const ReportsHub: React.FC = () => {
  const { user } = useAuth();
  const [reports, setReports] = useState<StudentReport[]>([]);
  const [activeReport, setActiveReport] = useState<StudentReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const reportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user) {
      loadReports();
    }
  }, [user]);

  const loadReports = async () => {
    try {
      if (!user) return;
      const data = await reportsService.getHistoricalReports(user.id);
      setReports(data);
      if (data.length > 0) {
        setActiveReport(data[0]); // Load latest by default
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerate = async () => {
    if (!user) return;
    setIsGenerating(true);
    setError(null);
    try {
      const newReport = await reportsService.generateReport(user.id);
      setReports([newReport, ...reports]);
      setActiveReport(newReport);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!reportRef.current) return;
    
    try {
      const canvas = await html2canvas(reportRef.current, { scale: 2 });
      const imgData = canvas.toDataURL('image/png');
      
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Intelligence_Report_${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (err) {
      console.error("Failed to generate PDF", err);
      alert("Failed to generate PDF");
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reports</h1>
          <p className="text-gray-600">Comprehensive analysis of your cognitive and learning profile</p>
        </div>
        <div className="flex gap-4">
          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="flex items-center gap-2 px-6 py-2.5 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-700 transition-colors shadow-sm disabled:opacity-50"
          >
            {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Brain className="w-5 h-5" />}
            Generate New Report
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-danger-50 border border-danger-200 text-danger-700 rounded-xl">
          {error}
        </div>
      )}

      {reports.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-gray-100">
          <FileBarChart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No Reports Found</h2>
          <p className="text-gray-500 mb-6">You haven't generated any intelligence reports yet.</p>
          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="px-6 py-3 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-700 transition-colors"
          >
            Generate First Report
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar History */}
          <div className="lg:col-span-1 space-y-4">
            <h3 className="font-bold text-gray-900 mb-4">Report History</h3>
            {reports.map((report) => (
              <button
                key={report.id}
                onClick={() => setActiveReport(report)}
                className={`w-full text-left p-4 rounded-xl border transition-all ${
                  activeReport?.id === report.id
                    ? 'bg-primary-50 border-primary-200 shadow-sm'
                    : 'bg-white border-gray-100 hover:border-primary-100 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <FileText className={`w-5 h-5 ${activeReport?.id === report.id ? 'text-primary-600' : 'text-gray-400'}`} />
                  <span className="font-bold text-gray-900">Version {report.report_version}</span>
                </div>
                <div className="text-sm text-gray-500 flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {new Date(report.created_at).toLocaleDateString()}
                </div>
              </button>
            ))}
          </div>

          {/* Report Viewer */}
          <div className="lg:col-span-3">
            {activeReport && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="bg-gray-50 border-b border-gray-200 p-4 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 bg-white border border-gray-200 rounded-full text-sm font-medium text-gray-600">
                      Version {activeReport.report_version}
                    </span>
                    <span className="text-sm text-gray-500">
                      Generated on {new Date(activeReport.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <button
                    onClick={handleDownloadPDF}
                    className="flex items-center gap-2 px-4 py-2 text-primary-600 font-medium hover:bg-primary-50 rounded-lg transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    Export PDF
                  </button>
                </div>

                {/* Printable Area */}
                <div ref={reportRef} className="p-8 space-y-12 bg-white">
                  
                  {/* Header */}
                  <div className="flex items-center justify-between border-b border-gray-100 pb-8">
                    <div>
                      <h1 className="text-4xl font-black text-gray-900 mb-2">Report</h1>
                      <p className="text-lg text-gray-500">NeuroLearn Cognitive Analysis</p>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-500 uppercase tracking-wider font-bold mb-1">Readiness Score</div>
                      <div className="text-5xl font-black text-primary-600">{activeReport.readiness_score}</div>
                    </div>
                  </div>

                  {/* 1. Executive Summary */}
                  <section>
                    <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <Brain className="w-6 h-6 text-primary-500" />
                      Executive Summary
                    </h2>
                    <p className="text-gray-700 leading-relaxed text-lg">
                      {activeReport.ai_insights.executiveSummary}
                    </p>
                  </section>

                  {/* 2 & 3. Learning Profile & Assessment Summary */}
                  <div className="grid md:grid-cols-2 gap-8">
                    <section className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                      <h3 className="text-sm uppercase tracking-wider font-bold text-gray-500 mb-2">Learning Profile</h3>
                      <div className="text-3xl font-bold text-primary-700 mb-4">
                        {activeReport.learning_profile}
                      </div>
                      <p className="text-sm text-gray-600">Based on behavioural dimension analysis.</p>
                    </section>
                    
                    <section className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                      <h3 className="text-sm uppercase tracking-wider font-bold text-gray-500 mb-4">Assessment Coverage</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-3 bg-white rounded-xl border border-gray-100">
                          <div className="text-2xl font-bold text-gray-900">{activeReport.generated_from_assessments}</div>
                          <div className="text-xs text-gray-500">Assessments Analyzed</div>
                        </div>
                      </div>
                    </section>
                  </div>

                  {/* 5. Risk Analysis */}
                  <section>
                    <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                      <Activity className="w-6 h-6 text-primary-500" />
                      Risk Analysis
                    </h2>
                    <div className="grid md:grid-cols-2 gap-4">
                      <RiskCard title="Learning Difficulties" risk={activeReport.risk_analysis.learning_difficulties} />
                      <RiskCard title="Dyslexia Indicators" risk={activeReport.risk_analysis.dyslexia_indicators} />
                      <RiskCard title="Reading Fluency" risk={activeReport.risk_analysis.reading_fluency} />
                      <RiskCard title="Attention Inconsistency" risk={activeReport.risk_analysis.attention_inconsistency} />
                      <RiskCard title="Concentration" risk={activeReport.risk_analysis.concentration} />
                      <RiskCard title="Cognitive Overload" risk={activeReport.risk_analysis.cognitive_overload} />
                      <RiskCard title="Learning Engagement" risk={activeReport.risk_analysis.learning_engagement} />
                    </div>
                  </section>

                  {/* 6 & 7. Strengths and Growth Areas */}
                  <div className="grid md:grid-cols-2 gap-8">
                    <section>
                      <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <CheckCircle2 className="w-6 h-6 text-success-500" />
                        Key Strengths
                      </h2>
                      <ul className="space-y-3">
                        {activeReport.ai_insights.strengths.map((s, i) => (
                          <li key={i} className="flex items-start gap-3 p-3 bg-success-50 text-success-900 rounded-xl border border-success-100">
                            <span className="font-bold text-success-600">{i + 1}.</span> {s}
                          </li>
                        ))}
                      </ul>
                    </section>
                    <section>
                      <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <TrendingUp className="w-6 h-6 text-warning-500" />
                        Growth Areas
                      </h2>
                      <ul className="space-y-3">
                        {activeReport.ai_insights.growthAreas.map((g, i) => (
                          <li key={i} className="flex items-start gap-3 p-3 bg-warning-50 text-warning-900 rounded-xl border border-warning-100">
                            <span className="font-bold text-warning-600">{i + 1}.</span> {g}
                          </li>
                        ))}
                      </ul>
                    </section>
                  </div>

                  {/* 8. Recommendations */}
                  <section className="bg-primary-900 text-white p-8 rounded-3xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -translate-y-1/2 translate-x-1/3"></div>
                    <h2 className="text-2xl font-bold mb-6 relative z-10">Personalized Recommendations</h2>
                    <div className="grid gap-4 relative z-10">
                      {activeReport.ai_insights.recommendations.map((r, i) => (
                        <div key={i} className="p-4 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
                          <p className="text-lg leading-relaxed">{r}</p>
                        </div>
                      ))}
                    </div>
                  </section>

                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
