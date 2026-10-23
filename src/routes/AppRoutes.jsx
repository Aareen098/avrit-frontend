import { Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "@/routes/ProtectedRoute";
import GuestRoute from "@/routes/GuestRoute";
import StaffLayout from "@/layouts/StaffLayout";
import CandidateLayout from "@/layouts/CandidateLayout";
import Login from "@/pages/auth/Login";
import Register from "@/pages/auth/Register";
import CompanyRegister from "@/pages/auth/CompanyRegister";
import VerifyEmail from "@/pages/auth/VerifyEmail";
import ForgotPassword from "@/pages/auth/ForgotPassword";
import ResetPassword from "@/pages/auth/ResetPassword";
import StaffDashboard from "@/pages/staff/Dashboard";
import Candidates from "@/pages/staff/Candidates";
import CandidateProfile from "@/pages/staff/CandidateProfile";
import JobApplicants from "@/pages/staff/JobApplicants";
import EditJob from "@/pages/staff/EditJob";
import CandidateDashboard from "@/pages/candidate/Dashboard";
import ApplicationDetail from "@/pages/candidate/ApplicationDetail";
import PublicLayout from "@/layouts/PublicLayout";
import Careers from "@/pages/public/Careers";
import JobDetail from "@/pages/public/JobDetail";
import Apply from "@/pages/public/Apply";
import ApplicationStatus from "@/pages/public/ApplicationStatus";
import Pipeline from "@/pages/staff/Pipeline";
import AIAssistant from "@/pages/staff/AIAssistant";
import Settings from "@/pages/staff/Settings";
import MyApplications from "@/pages/candidate/MyApplications";
import CandidateProfilePage from "@/pages/candidate/CandidateProfilePage";
import Interviews from "@/pages/staff/Interviews";
import NotFound from "@/pages/public/NotFound";
import Jobs from "@/pages/staff/Jobs";
import CreateJob from "@/pages/staff/CreateJob";
import { useAuthStore } from "@/store/authStore";
import { ROLES, STAFF_ROLES, homeFor } from "@/utils/constants";

// "/" sends you to your home page, or to login.
function HomeRedirect() {
  const user = useAuthStore((s) => s.user);
  const token = useAuthStore((s) => s.token);
  return (
    <Navigate to={token && user ? homeFor(user.role) : "/login"} replace />
  );
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomeRedirect />} />

      {/* Only for people who are NOT logged in */}
      <Route element={<GuestRoute />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/register/company" element={<CompanyRegister />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
      </Route>
      <Route path="/verify-email" element={<VerifyEmail />} />

      {/* Public careers site: anyone can open these */}
      <Route element={<PublicLayout />}>
        <Route path="/careers" element={<Careers />} />
        <Route path="/c/:slug" element={<Careers />} />
        <Route path="/careers/:id" element={<JobDetail />} />
        <Route path="/careers/:id/apply" element={<Apply />} />
        <Route path="/status" element={<ApplicationStatus />} />
      </Route>

      {/* Staff: Admin, Recruiter, Hiring Manager */}
      <Route element={<ProtectedRoute roles={STAFF_ROLES} />}>
        <Route element={<StaffLayout />}>
          <Route path="/dashboard" element={<StaffDashboard />} />
          <Route path="/jobs" element={<Jobs />} />
          <Route path="/jobs" element={<Jobs />} />
          <Route path="/jobs/:id" element={<JobApplicants />} />
          <Route path="/candidates" element={<Candidates />} />
          <Route path="/candidates" element={<Candidates />} />
          <Route path="/candidates/:id" element={<CandidateProfile />} />
          <Route path="/interviews" element={<Interviews />} />

          <Route
            element={<ProtectedRoute roles={[ROLES.ADMIN, ROLES.RECRUITER]} />}
          >
            <Route path="/jobs/new" element={<CreateJob />} />
            <Route path="/jobs/:id/edit" element={<EditJob />} />
            <Route path="/pipeline" element={<Pipeline />} />
            <Route path="/assistant" element={<AIAssistant />} />
          </Route>

          <Route element={<ProtectedRoute roles={[ROLES.ADMIN]} />}>
            <Route path="/settings" element={<Settings />} />
          </Route>
        </Route>
      </Route>

      {/* Candidates */}
      <Route element={<ProtectedRoute roles={[ROLES.CANDIDATE]} />}>
        <Route element={<CandidateLayout />}>
          <Route path="/portal" element={<CandidateDashboard />} />
          <Route path="/portal/applications" element={<MyApplications />} />
          <Route
            path="/portal/applications/:reference"
            element={<ApplicationDetail />}
          />
          <Route path="/portal/profile" element={<CandidateProfilePage />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
