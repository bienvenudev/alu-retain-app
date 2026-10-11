import { Navigate, Outlet, useLocation } from 'react-router-dom'

import { useAuth } from './AuthContext'

export function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return <p className="route-status">Loading your session…</p>
  }

  if (!isAuthenticated) {
    return <Navigate replace state={{ from: location }} to="/signin" />
  }

  return <Outlet />
}

export function AdminRoute() {
  const { isLoading, user } = useAuth()

  if (isLoading) {
    return <p className="route-status">Loading your session…</p>
  }

  if (user?.role !== 'admin') {
    return <Navigate replace to="/dashboard" />
  }

  return <Outlet />
}
