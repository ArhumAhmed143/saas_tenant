import { Navigate, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export const ProtectedRoute = ({ children }) => {
  const { currentUser } = useApp();
  const token = localStorage.getItem('accessToken');
  const location = useLocation();

  if (!currentUser || !token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};