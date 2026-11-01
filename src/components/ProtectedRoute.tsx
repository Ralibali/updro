import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import type { UserRole } from '@/types'
import { loginPathFor } from '@/lib/authRedirect'

interface ProtectedRouteProps {
  children: React.ReactNode
  role?: UserRole
}

const ProtectedRoute = ({ children, role }: ProtectedRouteProps) => {
  const { isAuthenticated, loading, profile } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    )
  }

  if (!isAuthenticated) {
    // Keep the requested page (for example a link in a notification e-mail) so
    // login can continue there.
    return <Navigate to={loginPathFor(`${location.pathname}${location.search}${location.hash}`)} replace />
  }

  // Admin can access all protected routes
  if (role && profile?.role !== role && profile?.role !== 'admin') {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}

export default ProtectedRoute
