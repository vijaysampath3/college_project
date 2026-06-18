import React, { useState, useEffect } from 'react';
import { useParentContext } from '../context/ParentContext';
import {
  parentRecommendationsService,
  PriorityRecommendations,
  TeacherAssignedActivity,
  TeacherAssignedAssessment,
  HomeSupportActivity,
  DailySupportPlan,
  TeacherRecommendation,
  HomeActivityLog
} from '../services/parentRecommendations.service';
import { BookOpen, Target, CheckCircle, Clock, AlertTriangle, Play, Calendar, Bookmark, PlusCircle } from 'lucide-react';

const ParentRecommendationsPage: React.FC = () => {
  const { selectedStudent, isLoadingStudents } = useParentContext();

  const [priorities, setPriorities] = useState<PriorityRecommendations | null>(null);
  const [activities, setActivities] = useState<TeacherAssignedActivity[]>([]);
  const [assessments, setAssessments] = useState<TeacherAssignedAssessment[]>([]);
  const [homeActivities, setHomeActivities] = useState<HomeSupportActivity[]>([]);
  const [dailyPlan, setDailyPlan] = useState<DailySupportPlan | null>(null);
  const [teacherRecs, setTeacherRecs] = useState<TeacherRecommendation[]>([]);
  const [history, setHistory] = useState<HomeActivityLog[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal State for logging home activity
  const [isLoggingActivity, setIsLoggingActivity] = useState(false);
  const [selectedHomeActivity, setSelectedHomeActivity] = useState<HomeSupportActivity | null>(null);
  const [parentNotes, setParentNotes] = useState('');

  const fetchData = async () => {
    if (!selectedStudent) return;
    setIsLoading(true);
    setError(null);
    try {
      const studentId = selectedStudent.id;
      const [
        priData,
        actData,
        assData,
        homeData,
        planData,
        recData,
        histData
      ] = await Promise.all([
        parentRecommendationsService.getPriorities(studentId),
        parentRecommendationsService.getActivities(studentId),
        parentRecommendationsService.getAssessments(studentId),
        parentRecommendationsService.getHomeActivities(studentId),
        parentRecommendationsService.getDailyPlan(studentId),
        parentRecommendationsService.getTeacherRecommendations(studentId),
        parentRecommendationsService.getHomeActivityLogs(studentId)
      ]);

      setPriorities(priData);
      setActivities(actData);
      setAssessments(assData);
      setHomeActivities(homeData);
      setDailyPlan(planData);
      setTeacherRecs(recData);
      setHistory(histData);
    } catch (err) {
      console.error(err);
      setError('Failed to load recommendations data. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedStudent]);

  const handleMarkComplete = (activity: HomeSupportActivity) => {
    setSelectedHomeActivity(activity);
    setParentNotes('');
    setIsLoggingActivity(true);
  };

  const submitActivityLog = async () => {
    if (!selectedStudent || !selectedHomeActivity) return;
    try {
      await parentRecommendationsService.createHomeActivityLog(selectedStudent.id, {
        activity_name: selectedHomeActivity.name,
        activity_category: selectedHomeActivity.category,
        parent_notes: parentNotes
      });
      setIsLoggingActivity(false);
      setSelectedHomeActivity(null);
      // Refresh history
      const newHistory = await parentRecommendationsService.getHomeActivityLogs(selectedStudent.id);
      setHistory(newHistory);
    } catch (err) {
      console.error(err);
      alert('Failed to log activity. Please try again.');
    }
  };

  if (isLoadingStudents || isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-lg text-slate-500 flex items-center">
          <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mr-3"></div>
          Loading recommendations...
        </div>
      </div>
    );
  }

  if (!selectedStudent) {
    return (
      <div className="flex h-64 items-center justify-center text-slate-500">
        Please select a student to view their recommendations.
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      <header>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Recommendations & Home Support</h1>
        <p className="mt-2 text-slate-500">
          Actionable steps and daily focus areas to support {selectedStudent.studentName} at home.
        </p>
      </header>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center">
          <AlertTriangle className="h-5 w-5 mr-3 text-red-500" />
          {error}
        </div>
      )}

      {/* Daily Support Plan - Hero Section */}
      {dailyPlan && (
        <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl shadow-lg shadow-indigo-200 text-white p-8">
          <div className="flex items-center mb-6">
            <div className="bg-white/20 p-3 rounded-xl mr-4 backdrop-blur-sm">
              <Target className="h-8 w-8 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Daily Support Plan</h2>
              <p className="text-indigo-100 mt-1">Today's Focus: <span className="font-semibold text-white">{dailyPlan.todaysFocus}</span></p>
            </div>
          </div>
          
          <div className="bg-white/10 rounded-xl p-6 backdrop-blur-sm mb-6 border border-white/10">
            <h3 className="text-sm uppercase tracking-wider font-semibold text-indigo-200 mb-2">This Week's Goal</h3>
            <p className="text-lg font-medium">{dailyPlan.thisWeeksGoal}</p>
          </div>

          <div>
            <h3 className="text-sm uppercase tracking-wider font-semibold text-indigo-200 mb-4">Parent Action Steps</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {dailyPlan.actionSteps.map((step, idx) => (
                <div key={idx} className="flex items-start bg-black/10 rounded-lg p-4 border border-white/5">
                  <div className="bg-indigo-500 text-white w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 mr-3 text-xs font-bold">
                    {idx + 1}
                  </div>
                  <p className="text-indigo-50 leading-relaxed">{step}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Priority & Home Activities */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Upcoming Deadlines & Priorities */}
          {priorities && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center">
                  <Clock className="h-5 w-5 text-amber-500 mr-2" />
                  <h2 className="text-lg font-bold text-slate-800">Priority & Deadlines</h2>
                </div>
              </div>
              <div className="p-6 space-y-6">
                
                {priorities.upcoming.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-slate-500 mb-3 uppercase tracking-wider">Due within 7 Days</h3>
                    <div className="space-y-3">
                      {priorities.upcoming.map(item => (
                        <div key={item.id} className="flex justify-between items-center bg-amber-50 rounded-xl p-4 border border-amber-100">
                          <div>
                            <p className="font-semibold text-slate-800">{item.title}</p>
                            <p className="text-sm text-slate-500 flex items-center mt-1">
                              <span className="bg-white border border-slate-200 px-2 py-0.5 rounded text-xs mr-2">{item.type}</span>
                              {item.source}
                            </p>
                          </div>
                          <div className="text-right">
                            <span className="text-sm font-bold text-amber-600 bg-amber-100 px-3 py-1 rounded-full">
                              {item.dueDate ? new Date(item.dueDate).toLocaleDateString() : 'Upcoming'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <h3 className="text-sm font-semibold text-slate-500 mb-3 uppercase tracking-wider">High Priority Focus</h3>
                  {priorities.high.length > 0 ? (
                    <div className="space-y-3">
                      {priorities.high.filter(h => !priorities.upcoming.find(u => u.id === h.id)).map(item => (
                        <div key={item.id} className="flex justify-between items-center bg-red-50 rounded-xl p-4 border border-red-100">
                          <div>
                            <p className="font-semibold text-slate-800">{item.title}</p>
                            <p className="text-sm text-slate-500 mt-1">{item.type} &bull; {item.source}</p>
                          </div>
                        </div>
                      ))}
                      {priorities.high.filter(h => !priorities.upcoming.find(u => u.id === h.id)).length === 0 && (
                        <p className="text-slate-500 text-sm italic">All high priority items are listed in Upcoming Deadlines.</p>
                      )}
                    </div>
                  ) : (
                    <p className="text-slate-500 text-sm italic">No immediate high priority items.</p>
                  )}
                </div>

              </div>
            </div>
          )}

          {/* Teacher Assigned Activities & Assessments */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center">
              <BookOpen className="h-5 w-5 text-indigo-500 mr-2" />
              <h2 className="text-lg font-bold text-slate-800">Teacher Assignments</h2>
            </div>
            <div className="p-0">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider border-b border-slate-100">
                    <th className="px-6 py-3 font-semibold">Name</th>
                    <th className="px-6 py-3 font-semibold">Type</th>
                    <th className="px-6 py-3 font-semibold">Due Date</th>
                    <th className="px-6 py-3 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {activities.map(a => (
                    <tr key={`act-${a.id}`} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <p className="font-semibold text-slate-800">{a.name}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{a.teacherName}</p>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">Activity</td>
                      <td className="px-6 py-4 text-sm text-slate-600">{a.dueDate ? new Date(a.dueDate).toLocaleDateString() : 'No date'}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium capitalize ${
                          a.status === 'completed' ? 'bg-emerald-100 text-emerald-800' :
                          a.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                          'bg-amber-100 text-amber-800'
                        }`}>
                          {a.status.replace('_', ' ')}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {assessments.map(a => (
                    <tr key={`ass-${a.id}`} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <p className="font-semibold text-slate-800">{a.name}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{a.teacherName}</p>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">Assessment</td>
                      <td className="px-6 py-4 text-sm text-slate-600">{a.dueDate ? new Date(a.dueDate).toLocaleDateString() : 'No date'}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium capitalize ${
                          a.status === 'completed' ? 'bg-emerald-100 text-emerald-800' :
                          a.status === 'pending' ? 'bg-amber-100 text-amber-800' :
                          'bg-slate-100 text-slate-800'
                        }`}>
                          {a.status.replace('_', ' ')}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {activities.length === 0 && assessments.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-6 py-8 text-center text-slate-500 italic">
                        No active teacher assignments.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* Right Column: Home Support & History */}
        <div className="space-y-8">
          
          {/* Home Support Activities */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100 bg-indigo-50 flex items-center justify-between">
              <div className="flex items-center">
                <Play className="h-5 w-5 text-indigo-600 mr-2" />
                <h2 className="text-lg font-bold text-indigo-900">Do It Today</h2>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-sm text-slate-500 mb-2">Optional home activities tailored to current risk areas.</p>
              
              {homeActivities.length > 0 ? homeActivities.map((ha, idx) => (
                <div key={idx} className="bg-slate-50 rounded-xl p-4 border border-slate-200 hover:border-indigo-300 transition-colors group cursor-pointer" onClick={() => handleMarkComplete(ha)}>
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-bold text-indigo-600 bg-indigo-100 px-2 py-1 rounded">{ha.category}</span>
                    <span className="text-xs text-slate-500 flex items-center">
                      <Clock className="w-3 h-3 mr-1" /> {ha.estimatedMinutes} min
                    </span>
                  </div>
                  <h3 className="font-semibold text-slate-800 mb-3">{ha.name}</h3>
                  <button className="w-full py-2 bg-white border border-slate-300 rounded-lg text-sm font-medium text-slate-700 group-hover:bg-indigo-50 group-hover:text-indigo-700 group-hover:border-indigo-300 transition-colors flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 mr-2" /> Mark Complete
                  </button>
                </div>
              )) : (
                <p className="text-slate-500 italic text-sm">No specific home activities generated right now.</p>
              )}
            </div>
          </div>

          {/* Teacher Recommendations */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center">
              <Bookmark className="h-5 w-5 text-emerald-500 mr-2" />
              <h2 className="text-lg font-bold text-slate-800">Teacher Notes</h2>
            </div>
            <div className="p-6 space-y-4">
              {teacherRecs.length > 0 ? teacherRecs.map(tr => (
                <div key={tr.id} className="pb-4 border-b border-slate-100 last:border-0 last:pb-0">
                  <p className="text-slate-800 text-sm leading-relaxed mb-2">"{tr.text}"</p>
                  <p className="text-xs text-slate-500 flex justify-between items-center">
                    <span>{tr.teacherName}</span>
                    <span>{new Date(tr.date).toLocaleDateString()}</span>
                  </p>
                </div>
              )) : (
                <p className="text-slate-500 text-sm italic">No specific recommendations from teachers.</p>
              )}
            </div>
          </div>

          {/* Activity History */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center">
              <Calendar className="h-5 w-5 text-slate-400 mr-2" />
              <h2 className="text-lg font-bold text-slate-800">Activity History</h2>
            </div>
            <div className="p-6">
              {history.length > 0 ? (
                <div className="space-y-4">
                  {history.slice(0, 5).map(h => (
                    <div key={h.id} className="flex items-start">
                      <div className="mt-1 bg-emerald-100 p-1.5 rounded-full mr-3">
                        <CheckCircle className="w-3 h-3 text-emerald-600" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-800">{h.activityName}</p>
                        <p className="text-xs text-slate-500 mb-1">{new Date(h.completedAt).toLocaleString()}</p>
                        {h.notes && <p className="text-xs text-slate-600 italic bg-slate-50 p-2 rounded border border-slate-100">"{h.notes}"</p>}
                      </div>
                    </div>
                  ))}
                  {history.length > 5 && <p className="text-xs text-center text-indigo-600 font-medium pt-2 cursor-pointer">View all history</p>}
                </div>
              ) : (
                <p className="text-slate-500 text-sm italic text-center py-4">No home activities recorded yet.</p>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* Log Activity Modal */}
      {isLoggingActivity && selectedHomeActivity && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-slide-up">
            <div className="px-6 py-5 border-b border-slate-100">
              <h3 className="text-xl font-bold text-slate-800">Log Home Activity</h3>
            </div>
            <div className="p-6">
              <div className="mb-6 bg-indigo-50 p-4 rounded-xl">
                <span className="text-xs font-bold text-indigo-600 mb-1 block">{selectedHomeActivity.category}</span>
                <p className="font-semibold text-slate-800">{selectedHomeActivity.name}</p>
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-700 mb-2">Optional Notes (How did it go?)</label>
                <textarea 
                  className="w-full border border-slate-300 rounded-xl p-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow outline-none"
                  rows={4}
                  placeholder="E.g., Finished the reading smoothly but stumbled on new words..."
                  value={parentNotes}
                  onChange={(e) => setParentNotes(e.target.value)}
                />
              </div>

              <div className="flex space-x-3">
                <button 
                  onClick={() => setIsLoggingActivity(false)}
                  className="flex-1 px-4 py-2.5 border border-slate-300 text-slate-700 rounded-xl font-medium hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={submitActivityLog}
                  className="flex-1 px-4 py-2.5 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors shadow-sm shadow-indigo-200"
                >
                  Save & Complete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default ParentRecommendationsPage;
