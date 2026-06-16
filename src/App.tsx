import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import StudentDashboard from './pages/StudentDashboard';
import TeacherDashboard from './pages/TeacherDashboard';
import ParentDashboard from './pages/ParentDashboard';
import AdminDashboard from './pages/AdminDashboard';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { RoleGuard } from './components/auth/RoleGuard';
import AssessmentHub from './pages/AssessmentHub';
import AssessmentPlaceholder from './pages/AssessmentPlaceholder';
import { CPTAssessment } from './pages/assessments/CPTAssessment';
import { FocusAssessment } from './pages/assessments/FocusAssessment';
import { LearningBehaviourAssessment } from './pages/assessments/LearningBehaviourAssessment';
import { ReportsHub } from './pages/ReportsHub';
import { RecommendationsPage } from './pages/RecommendationsPage';
import { LearningJourneyPage } from './pages/LearningJourneyPage';
import { ActivitiesLibrary } from './pages/ActivitiesLibrary';
import { ActivityPlayer } from './pages/ActivityPlayer';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          
          <Route element={<ProtectedRoute />}>
            <Route element={<RoleGuard allowedRole="student" />}>
              <Route path="/student" element={<StudentDashboard />} />
              <Route path="/student/assessments" element={<AssessmentHub />} />
              <Route path="/student/assessments/cpt" element={<CPTAssessment />} />
              <Route path="/student/assessments/focus" element={<FocusAssessment />} />
              <Route path="/student/assessments/learning-behaviour" element={<LearningBehaviourAssessment />} />
              <Route path="/student/reports" element={<ReportsHub />} />
              <Route path="/student/recommendations" element={<RecommendationsPage />} />
              <Route path="/student/learning-journey" element={<LearningJourneyPage />} />
              <Route path="/student/activities" element={<ActivitiesLibrary />} />
              <Route path="/student/activity/:activityCode" element={<ActivityPlayer />} />
              <Route path="/student/assessments/:type" element={<AssessmentPlaceholder />} />
              <Route path="/student/*" element={<StudentDashboard />} />
            </Route>

            <Route element={<RoleGuard allowedRole="teacher" />}>
              <Route path="/teacher" element={<TeacherDashboard />} />
              <Route path="/teacher/*" element={<TeacherDashboard />} />
            </Route>

            <Route element={<RoleGuard allowedRole="parent" />}>
              <Route path="/parent" element={<ParentDashboard />} />
              <Route path="/parent/*" element={<ParentDashboard />} />
            </Route>

            <Route element={<RoleGuard allowedRole="admin" />}>
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/*" element={<AdminDashboard />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
