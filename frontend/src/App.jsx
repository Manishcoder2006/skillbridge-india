import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';

// Layout
import { AppLayout } from './components/layout/AppLayout';

// Guarding
import { ProtectedRoute } from './components/routing/ProtectedRoute';
import { RoleRoute } from './components/routing/RoleRoute';

// Public Pages
import { LandingPage } from './pages/LandingPage';
import { Login } from './pages/auth/Login';
import { Register } from './pages/auth/Register';
import { ForgotPassword } from './pages/auth/ForgotPassword';
import { ResetPassword } from './pages/auth/ResetPassword';
import { Unauthorized } from './pages/Unauthorized';
import { NotFound } from './pages/NotFound';

// Student Pages (Phase 2)
import { StudentOverview } from './pages/student/StudentOverview';
import { StudentProfile } from './pages/student/StudentProfile';
import { SkillAssessment } from './pages/student/SkillAssessment';
import { SkillsAndCareer } from './pages/student/SkillsAndCareer';
import { LearningSection } from './pages/student/LearningSection';
import { OpportunitiesSection } from './pages/student/OpportunitiesSection';
import { ApplicationsTracker } from './pages/student/ApplicationsTracker';
import { ResumeBuilder } from './pages/student/ResumeBuilder';

// Academician Pages (Phase 3)
import { AcademicianOverview } from './pages/academician/AcademicianOverview';
import { AcademicianProfile } from './pages/academician/AcademicianProfile';
import { MyStudents } from './pages/academician/MyStudents';
import { StudentAnalytics } from './pages/academician/StudentAnalytics';
import { LearningContent } from './pages/academician/LearningContent';
import { AcademicianOpportunities } from './pages/academician/AcademicianOpportunities';
import { CollaborationSection } from './pages/academician/CollaborationSection';
// Industry / HR Pages (Phase 4)
import { IndustryOverview } from './pages/industry/IndustryOverview';
import { CompanyProfile } from './pages/industry/CompanyProfile';
import { PostingsManager } from './pages/industry/PostingsManager';
import { CandidateMatching } from './pages/industry/CandidateMatching';
import { CandidatesAndApplications } from './pages/industry/CandidatesAndApplications';
import { IndustryCollaboration } from './pages/industry/IndustryCollaboration';
import { IndustryAnalytics } from './pages/industry/IndustryAnalytics';

// Other Role Placeholders (Preserved for future phases)
import { InstitutionDashboard } from './pages/dashboards/InstitutionDashboard';
import { SuperAdminDashboard } from './pages/dashboards/SuperAdminDashboard';

export function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/unauthorized" element={<Unauthorized />} />

            {/* Protected Role Dashboards wrapped in AppLayout */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              {/* Student Ecosystem Routes (Phase 2) */}
              <Route
                path="student"
                element={
                  <RoleRoute allowedRoles={['student', 'super_admin']}>
                    <StudentOverview />
                  </RoleRoute>
                }
              />
              <Route
                path="student/profile"
                element={
                  <RoleRoute allowedRoles={['student', 'super_admin']}>
                    <StudentProfile />
                  </RoleRoute>
                }
              />
              <Route
                path="student/assessments"
                element={
                  <RoleRoute allowedRoles={['student', 'super_admin']}>
                    <SkillAssessment />
                  </RoleRoute>
                }
              />
              <Route
                path="student/skills"
                element={
                  <RoleRoute allowedRoles={['student', 'super_admin']}>
                    <SkillsAndCareer />
                  </RoleRoute>
                }
              />
              <Route
                path="student/learning"
                element={
                  <RoleRoute allowedRoles={['student', 'super_admin']}>
                    <LearningSection />
                  </RoleRoute>
                }
              />
              <Route
                path="student/opportunities"
                element={
                  <RoleRoute allowedRoles={['student', 'super_admin']}>
                    <OpportunitiesSection />
                  </RoleRoute>
                }
              />
              <Route
                path="student/applications"
                element={
                  <RoleRoute allowedRoles={['student', 'super_admin']}>
                    <ApplicationsTracker />
                  </RoleRoute>
                }
              />
              <Route
                path="student/resume"
                element={
                  <RoleRoute allowedRoles={['student', 'super_admin']}>
                    <ResumeBuilder />
                  </RoleRoute>
                }
              />

              {/* Academician Ecosystem Routes (Phase 3) */}
              <Route
                path="academician"
                element={
                  <RoleRoute allowedRoles={['academician', 'super_admin']}>
                    <AcademicianOverview />
                  </RoleRoute>
                }
              />
              <Route
                path="academician/profile"
                element={
                  <RoleRoute allowedRoles={['academician', 'super_admin']}>
                    <AcademicianProfile />
                  </RoleRoute>
                }
              />
              <Route
                path="academician/students"
                element={
                  <RoleRoute allowedRoles={['academician', 'super_admin']}>
                    <MyStudents />
                  </RoleRoute>
                }
              />
              <Route
                path="academician/analytics"
                element={
                  <RoleRoute allowedRoles={['academician', 'super_admin']}>
                    <StudentAnalytics />
                  </RoleRoute>
                }
              />
              <Route
                path="academician/content"
                element={
                  <RoleRoute allowedRoles={['academician', 'super_admin']}>
                    <LearningContent />
                  </RoleRoute>
                }
              />
              <Route
                path="academician/opportunities"
                element={
                  <RoleRoute allowedRoles={['academician', 'super_admin']}>
                    <AcademicianOpportunities />
                  </RoleRoute>
                }
              />
              <Route
                path="academician/collaboration"
                element={
                  <RoleRoute allowedRoles={['academician', 'super_admin']}>
                    <CollaborationSection />
                  </RoleRoute>
                }
              />
              <Route
                path="academician/notifications"
                element={
                  <RoleRoute allowedRoles={['academician', 'super_admin']}>
                    <NotificationsSection />
                  </RoleRoute>
                }
              />

              {/* Industry HR Routes (Phase 4) */}
              <Route
                path="industry"
                element={
                  <RoleRoute allowedRoles={['industry_hr', 'super_admin']}>
                    <IndustryOverview />
                  </RoleRoute>
                }
              />
              <Route
                path="industry/profile"
                element={
                  <RoleRoute allowedRoles={['industry_hr', 'super_admin']}>
                    <CompanyProfile />
                  </RoleRoute>
                }
              />
              <Route
                path="industry/postings"
                element={
                  <RoleRoute allowedRoles={['industry_hr', 'super_admin']}>
                    <PostingsManager />
                  </RoleRoute>
                }
              />
              <Route
                path="industry/matching"
                element={
                  <RoleRoute allowedRoles={['industry_hr', 'super_admin']}>
                    <CandidateMatching />
                  </RoleRoute>
                }
              />
              <Route
                path="industry/candidates"
                element={
                  <RoleRoute allowedRoles={['industry_hr', 'super_admin']}>
                    <CandidatesAndApplications />
                  </RoleRoute>
                }
              />
              <Route
                path="industry/collaboration"
                element={
                  <RoleRoute allowedRoles={['industry_hr', 'super_admin']}>
                    <IndustryCollaboration />
                  </RoleRoute>
                }
              />
              <Route
                path="industry/analytics"
                element={
                  <RoleRoute allowedRoles={['industry_hr', 'super_admin']}>
                    <IndustryAnalytics />
                  </RoleRoute>
                }
              />

              {/* Institution Admin Routes */}
              <Route
                path="institution"
                element={
                  <RoleRoute allowedRoles={['institution_admin', 'super_admin']}>
                    <InstitutionDashboard />
                  </RoleRoute>
                }
              />
              <Route
                path="institution/*"
                element={
                  <RoleRoute allowedRoles={['institution_admin', 'super_admin']}>
                    <InstitutionDashboard />
                  </RoleRoute>
                }
              />

              {/* Super Admin Routes */}
              <Route
                path="admin"
                element={
                  <RoleRoute allowedRoles={['super_admin']}>
                    <SuperAdminDashboard />
                  </RoleRoute>
                }
              />
              <Route
                path="admin/*"
                element={
                  <RoleRoute allowedRoles={['super_admin']}>
                    <SuperAdminDashboard />
                  </RoleRoute>
                }
              />
            </Route>

            {/* 404 Fallback */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}

export default App;
