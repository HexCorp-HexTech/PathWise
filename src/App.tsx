/* ============================================
   VIDYA AI — Main App with Routing
   ============================================ */
import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAppStore } from './store/appStore';
import { useAuthStore } from './store/authStore';
import { AppShell } from './components/layout/AppShell';
import { initializeDatabase } from './lib/db';
import { registerDbDebugger } from './lib/db-debug';
import { ErrorBoundary } from './components/ErrorBoundary';

// Pages
import { LandingPage } from './pages/Landing';
import { RoleSelection, StudentLogin, StudentSignup, TeacherLogin, TeacherSignup, ParentLogin } from './pages/auth/Auth';
import { StudentDashboard } from './pages/student/Dashboard';
import { SubjectExplorer, SubjectDetail, ChapterView } from './pages/student/Subjects';
import { AITutorPage } from './pages/student/AITutor';
import { AchievementsPage } from './pages/student/Achievements';
import { QuizPage } from './pages/student/Quiz';
import { FlashcardsPage } from './pages/student/Flashcards';
import { DoubtRoomPage } from './pages/student/DoubtRoom';
import { TeacherDashboard } from './pages/teacher/Dashboard';
import { StudentsPage } from './pages/teacher/Students';
import { AnalyticsPage } from './pages/teacher/Analytics';
import { AssignmentsPage } from './pages/teacher/Assignments';
import { ContentPage } from './pages/teacher/Content';
import { AIInsightsPage } from './pages/teacher/AIInsights';
import { ParentDashboard } from './pages/parent/Dashboard';
import { WeeklyReportPage } from './pages/parent/WeeklyReport';
import { SettingsPage } from './pages/shared/Settings';

// CSS imports
import './pages/Landing.css';
import './pages/auth/Auth.css';
import './pages/student/StudentDashboard.css';
import './pages/student/Subjects.css';
import './pages/student/AITutor.css';
import './pages/student/Achievements.css';
import './pages/student/Quiz.css';
import './pages/student/Flashcards.css';
import './pages/student/DoubtRoom.css';
import './pages/teacher/TeacherDashboard.css';
import './pages/teacher/Students.css';
import './pages/parent/ParentDashboard.css';
import './pages/shared/Settings.css';

// Auth guard component
const ProtectedRoute: React.FC<{ children: React.ReactNode; allowedRoles?: string[] }> = ({
  children,
  allowedRoles,
}) => {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to={`/${user.role}`} replace />;
  }

  return <>{children}</>;
};

const App: React.FC = () => {
  const { theme, setIsMobile } = useAppStore();

  // Apply theme on mount
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Responsive detection
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [setIsMobile]);

  // Seed database and register console debugger
  useEffect(() => {
    initializeDatabase().catch(err => console.error('Database seeding failed', err));
    registerDbDebugger();
  }, []);

  return (
    <BrowserRouter>
      <ErrorBoundary>
        <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/auth" element={<RoleSelection />} />
        <Route path="/auth/student/login" element={<StudentLogin />} />
        <Route path="/auth/student/signup" element={<StudentSignup />} />
        <Route path="/auth/teacher/login" element={<TeacherLogin />} />
        <Route path="/auth/teacher/signup" element={<TeacherSignup />} />
        <Route path="/auth/parent/login" element={<ParentLogin />} />

        {/* Student Routes */}
        <Route
          path="/student"
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <AppShell><StudentDashboard /></AppShell>
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/subjects"
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <AppShell><SubjectExplorer /></AppShell>
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/subjects/:subjectId"
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <AppShell><SubjectDetail /></AppShell>
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/subjects/:subjectId/chapters/:chapterId"
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <AppShell><ChapterView /></AppShell>
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/tutor"
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <AppShell><AITutorPage /></AppShell>
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/achievements"
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <AppShell><AchievementsPage /></AppShell>
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/doubts"
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <AppShell><DoubtRoomPage /></AppShell>
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/quiz/:chapterId"
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <AppShell><QuizPage /></AppShell>
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/flashcards/:chapterId"
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <AppShell><FlashcardsPage /></AppShell>
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/settings"
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <AppShell><SettingsPage /></AppShell>
            </ProtectedRoute>
          }
        />

        {/* Teacher Routes */}
        <Route
          path="/teacher"
          element={
            <ProtectedRoute allowedRoles={['teacher']}>
              <AppShell><TeacherDashboard /></AppShell>
            </ProtectedRoute>
          }
        />
        <Route
          path="/teacher/students"
          element={
            <ProtectedRoute allowedRoles={['teacher']}>
              <AppShell><StudentsPage /></AppShell>
            </ProtectedRoute>
          }
        />
        <Route
          path="/teacher/analytics"
          element={
            <ProtectedRoute allowedRoles={['teacher']}>
              <AppShell><AnalyticsPage /></AppShell>
            </ProtectedRoute>
          }
        />
        <Route
          path="/teacher/assignments"
          element={
            <ProtectedRoute allowedRoles={['teacher']}>
              <AppShell><AssignmentsPage /></AppShell>
            </ProtectedRoute>
          }
        />
        <Route
          path="/teacher/doubts"
          element={
            <ProtectedRoute allowedRoles={['teacher']}>
              <AppShell><DoubtRoomPage /></AppShell>
            </ProtectedRoute>
          }
        />
        <Route
          path="/teacher/content"
          element={
            <ProtectedRoute allowedRoles={['teacher']}>
              <AppShell><ContentPage /></AppShell>
            </ProtectedRoute>
          }
        />
        <Route
          path="/teacher/insights"
          element={
            <ProtectedRoute allowedRoles={['teacher']}>
              <AppShell><AIInsightsPage /></AppShell>
            </ProtectedRoute>
          }
        />
        <Route
          path="/teacher/settings"
          element={
            <ProtectedRoute allowedRoles={['teacher']}>
              <AppShell><SettingsPage /></AppShell>
            </ProtectedRoute>
          }
        />

        {/* Parent Routes */}
        <Route
          path="/parent"
          element={
            <ProtectedRoute allowedRoles={['parent']}>
              <AppShell><ParentDashboard /></AppShell>
            </ProtectedRoute>
          }
        />
        <Route
          path="/parent/report"
          element={
            <ProtectedRoute allowedRoles={['parent']}>
              <AppShell><WeeklyReportPage /></AppShell>
            </ProtectedRoute>
          }
        />
        <Route
          path="/parent/settings"
          element={
            <ProtectedRoute allowedRoles={['parent']}>
              <AppShell><SettingsPage /></AppShell>
            </ProtectedRoute>
          }
        />

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      </ErrorBoundary>
    </BrowserRouter>
  );
};

export default App;
