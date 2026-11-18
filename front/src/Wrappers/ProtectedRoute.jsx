import { Navigate, useLocation } from 'react-router'
import authServices from '../Services/authServices.js'

function ProtectedRoute({ children }) {
  const location = useLocation()

  if (!authServices.isConnected()) {
    return <Navigate to="/connexion" replace state={{ from: location }} />
  }

  return children
}

export default ProtectedRoute
