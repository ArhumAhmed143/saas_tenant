import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword'; // 🆕
import ResetPassword from './pages/ResetPassword'; // 🆕
import AuthCallback from './pages/AuthCallback';
import Dashboard from './pages/Dashboard';
import MyDashboard from './pages/MyDashboard';
import TeamDashboard from './pages/TeamDashboard';
import Projects from './pages/Projects';
import ProjectDetail from './pages/ProjectDetail';
import Tasks from './pages/Tasks';
import TaskDetail from './pages/TaskDetail';
import Sprints from './pages/Sprints';
import Organization from './pages/Organization';
import Activity from './pages/Activity';
import Settings from './pages/Settings';
import { ProtectedRoute } from './components/ProtectedRoute';

function AppRoutes() {
  const { currentUser } = useApp();
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} /> {/* 🆕 */}
        <Route path="/reset-password/:token" element={<ResetPassword />} /> {/* 🆕 */}
        <Route path="/auth-callback" element={<AuthCallback />} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
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