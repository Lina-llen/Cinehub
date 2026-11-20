import { useContext } from 'react';
import { Navigate } from 'react-router';
import AuthContext from '../Contexts/AuthContext';
import LoginPage from '../Pages/LoginPage';

const AdminRoute = ({ children }) => {
  const { isConnected, user } = useContext(AuthContext);

  if (!isConnected) {
    return <LoginPage />;
  }

  if (!user || user.us_role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default AdminRoute;
