import { Navigate, Outlet, useLocation } from "react-router-dom"
import { useAuth } from "../hooks/useAuth"

function ProtectedRoute() {
  const { initializing, isAuthenticated } = useAuth()
  const location = useLocation()

  if (initializing) {
    return null
  }

  if (!isAuthenticated) {
    return <Navigate replace to="/login" state={{ from: location }} />
  }

  return <Outlet />
}

export default ProtectedRoute
