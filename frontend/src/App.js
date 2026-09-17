import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import Login from './pages/shared/Login';
import Register from './pages/shared/Register';
import ForgotPassword from './pages/shared/ForgotPassword';
import ResetPassword from './pages/shared/ResetPassword';
import Dashboard from './pages/shared/Dashboard';
import MyDashboard from './pages/employee/MyDashboard';
import TeamDashboard from './pages/manager/TeamDashboard';
import Projects from './pages/shared/Projects';
import ProjectDetail from './pages/shared/ProjectDetail';
import Tasks from './pages/shared/Tasks';
import TaskDetail from './pages/shared/TaskDetail';
import Sprints from './pages/shared/Sprints';
import Organization from './pages/companyAdmin/Organization';
import Activity from './pages/companyAdmin/Activity';
import Settings from './pages/companyAdmin/Settings';
import PlatformTenants from './pages/platformOwner/PlatformTenants';
import PlatformUsers from './pages/platformOwner/PlatformUsers';
import PlatformAnalytics from './pages/platformOwner/PlatformAnalytics';
import PlatformActivity from './pages/platformOwner/PlatformActivity';
import { ProtectedRoute } from './components/ProtectedRoute';
import MyActivity from './pages/employee/MyActivity';
function AppRoutes() {
  const { currentUser } = useApp();
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />

        {/* Main Dashboard */}
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
<Route path="/my-activity" element={<ProtectedRoute><MyActivity /></ProtectedRoute>} />
        {/* Company-Level Routes */}
        <Route path="/my-tasks" element={<ProtectedRoute><MyDashboard /></ProtectedRoute>} />
        <Route path="/team-analytics" element={<ProtectedRoute><TeamDashboard /></ProtectedRoute>} />
        <Route path="/projects" element={<ProtectedRoute><Projects /></ProtectedRoute>} />
        <Route path="/projects/:id" element={<ProtectedRoute><ProjectDetail /></ProtectedRoute>} />
        <Route path="/tasks" element={<ProtectedRoute><Tasks /></ProtectedRoute>} />
        <Route path="/tasks/:id" element={<ProtectedRoute><TaskDetail /></ProtectedRoute>} />
        <Route path="/sprints" element={<ProtectedRoute><Sprints /></ProtectedRoute>} />
        <Route path="/organization" element={<ProtectedRoute><Organization /></ProtectedRoute>} />
        <Route path="/activity" element={<ProtectedRoute><Activity /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />

        {/* Platform Owner Routes */}
        <Route path="/platform/tenants" element={<ProtectedRoute><PlatformTenants /></ProtectedRoute>} />
        <Route path="/platform/users" element={<ProtectedRoute><PlatformUsers /></ProtectedRoute>} />
        <Route path="/platform/analytics" element={<ProtectedRoute><PlatformAnalytics /></ProtectedRoute>} />
        <Route path="/platform/activity" element={<ProtectedRoute><PlatformActivity /></ProtectedRoute>} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to={currentUser ? "/dashboard" : "/login"} />} />
      </Routes>
    </BrowserRouter>
  );
}

function App() {
  return (
    <AppProvider>
      <AppRoutes />
    </AppProvider>
  );
}

export default App;