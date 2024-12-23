import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export const PrivateRoute = ({ children }) => {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" />;
}; 