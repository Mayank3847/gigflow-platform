import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const PrivateRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useSelector((state) => state.auth);

  // Prevent redirect while auth is still resolving
  if (isLoading) return null;

  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

export default PrivateRoute;
