import { Navigate, Outlet } from "react-router-dom"
import { useAuth } from "../hooks/useAuth"

function PublicRoute() {
  const { initializing, isAuthenticated } = useAuth()

  if (initializing) {
    return null
  }

  if (isAuthenticated) {
    return <Navigate replace to="/" />
  }

  return <Outlet />
}

export default PublicRoute
