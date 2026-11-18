import { Navigate, useLocation } from 'react-router'
import authServices from '../Services/authServices.js'

function AdminRoute({ children }) {
  const user = authServices.getUser()
  const location = useLocation()

  if (!user) {
    return <Navigate to="/connexion" replace state={{ from: location }} />
  }

  if (user.us_role !== 'admin') {
    return <Navigate to="/" replace />
  }

  return children
}

export default AdminRoute
